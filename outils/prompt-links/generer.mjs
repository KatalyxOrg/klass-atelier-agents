#!/usr/bin/env node
// Fabrique les prompt links T3 Code de l'atelier à partir de la page support.
//
// Chaque emplacement <p class="prompt-link" data-prompt-link="<clé>"> de index.html
// reçoit le lien du texte <pre class="prompt" id="prompt-<clé>"> de la même page.
// Le texte affiché et le texte du lien restent ainsi identiques.
// Le script réécrit aussi la liste des liens dans outils/prompt-links/README.md.
//
//   node outils/prompt-links/generer.mjs
//
// À relancer après toute modification d'un texte de prompt dans index.html.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = dirname(fileURLToPath(import.meta.url));
const RACINE = resolve(ICI, '..', '..');
const PAGE = join(RACINE, 'index.html');
const LISTE = join(ICI, 'README.md');

const REPO = 'KatalyxOrg/klass-atelier-agents';
const PROVIDER = 'claude';
const MODELE = 'claude-sonnet-5-5';
const LONGUEUR_MAX = 8000;
const TEXTE_DU_LIEN = 'Ouvrir le brouillon dans T3 Code';

const decoder = (html) =>
  html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');

const echapperAttribut = (texte) => texte.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

// encodeURIComponent laisse passer ' ( ) * ! : on les encode aussi, sinon une apostrophe
// ou une parenthèse couperait le lien dans du Markdown ou dans un attribut HTML.
const encoder = (texte) =>
  encodeURIComponent(texte).replace(/['()*!]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);

export function lienPour(prompt) {
  // Seul le prompt a besoin d'être encodé : repo, provider et model restent lisibles.
  return `https://app.t3.codes/new?prompt=${encoder(prompt)}&repo=${REPO}&provider=${PROVIDER}&model=${MODELE}`;
}

let page = readFileSync(PAGE, 'utf8');
const liens = [];
let partie = '';

const motifEmplacement =
  /<p class="prompt-link" data-prompt-link="([^"]+)"><span class="etiquette">([^<]+)<\/span>.*?<\/p>/g;

// Les titres de partie, pour situer chaque lien dans la séance.
const parties = [...page.matchAll(/<h2>([^<]+)<\/h2>/g)].map((m) => ({ index: m.index, titre: m[1] }));

page = page.replace(motifEmplacement, (tout, cle, etiquette, index) => {
  const pre = page.match(new RegExp(`<pre class="prompt" id="prompt-${cle}">([\\s\\S]*?)</pre>`));
  if (!pre) throw new Error(`Aucun texte <pre id="prompt-${cle}"> pour l'emplacement « ${cle} ».`);
  const prompt = decoder(pre[1]);
  const url = lienPour(prompt);
  const longueur = decodeURIComponent(url).length;
  if (longueur > LONGUEUR_MAX) throw new Error(`Le lien « ${cle} » fait ${longueur} caractères décodés (au plus ${LONGUEUR_MAX}).`);
  partie = parties.filter((p) => p.index < index).at(-1)?.titre ?? '';
  liens.push({ cle, etiquette, partie, url, longueur });
  return `<p class="prompt-link" data-prompt-link="${cle}"><span class="etiquette">${etiquette}</span><a href="${echapperAttribut(url)}">${TEXTE_DU_LIEN}</a></p>`;
});

if (liens.length === 0) throw new Error('Aucun emplacement de prompt link trouvé dans index.html.');
writeFileSync(PAGE, page);

const tableau = [
  '| Partie | Lien | Taille décodée |',
  '|---|---|---:|',
  ...liens.map((l) => `| ${decoder(l.partie)} | [${decoder(l.etiquette)}](${l.url}) | ${l.longueur} |`),
].join('\n');

const liste = readFileSync(LISTE, 'utf8');
const debut = '<!-- DEBUT DES LIENS : généré par generer.mjs, ne pas modifier à la main -->';
const fin = '<!-- FIN DES LIENS -->';
const avant = liste.indexOf(debut);
const apres = liste.indexOf(fin);
if (avant < 0 || apres < 0) throw new Error(`Les marques « ${debut} » et « ${fin} » manquent dans ${LISTE}.`);
writeFileSync(LISTE, `${liste.slice(0, avant + debut.length)}\n\n${tableau}\n\n${liste.slice(apres)}`);

console.log(`${liens.length} prompt links posés dans index.html et listés dans outils/prompt-links/README.md :`);
for (const l of liens) console.log(`  ${l.cle} (${l.longueur} caractères)`);
