// Point 7 : les prompt links T3 Code du dépôt.
// Il cherche tous les liens app.t3.codes qui portent un prompt (ou une PR) dans les
// fichiers texte suivis, et contrôle chacun :
//   - le lien décodé fait au plus 8 000 caractères ;
//   - repo vaut KatalyxOrg/klass-atelier-agents ;
//   - provider vaut claude et model vaut claude-sonnet-5-5 (les liens sont pour les associés) ;
//   - aucun caractère invisible, ni dans le lien ni dans le prompt décodé.
// Chaque emplacement data-prompt-link de index.html doit porter son lien.

import { Ecart, fichiersSuivis, lireTexte } from '../outils.mjs';

const REPO = 'KatalyxOrg/klass-atelier-agents';
const PROVIDER = 'claude';
const MODELE = 'claude-sonnet-5-5';
const LONGUEUR_MAX = 8000;

// Écrit sans le point littéral, pour que ce fichier ne soit pas pris pour un lien.
const MOTIF_LIEN = /https?:\/\/app\.t3\.codes\/[^\s"'<>`)\]]+/g;

// Ce qu'un associé ne voit pas : espaces de largeur nulle, contrôles bidirectionnels,
// caractères « tag », sélecteurs de variante, trait d'union conditionnel, caractères de contrôle.
const INVISIBLES =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F­͏؜ᅟᅠ឴឵᠋-᠏​-‏‪-‮⁠-⁯ㅤ︀-️﻿ﾠ￰-￻]|[\u{E0000}-\u{E007F}]|[\u{E0100}-\u{E01EF}]/u;

function decoderEntites(texte) {
  return texte
    .replace(/&amp;/g, '&')
    .replace(/&#38;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function decrireInvisible(texte) {
  const m = texte.match(INVISIBLES);
  const code = m[0].codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
  return `U+${code} à la position ${m.index}`;
}

/** Les prompt links trouvés dans les fichiers texte suivis : { fichier, ligne, brut }. */
export function trouverPromptLinks(dossier) {
  const liens = [];
  for (const fichier of fichiersSuivis(dossier)) {
    const texte = lireTexte(dossier, fichier);
    if (texte === null) continue;
    for (const m of texte.matchAll(MOTIF_LIEN)) {
      const brut = decoderEntites(m[0]);
      let url;
      try {
        url = new URL(brut);
      } catch {
        continue;
      }
      if (!url.searchParams.has('prompt') && !url.searchParams.has('pr')) continue;
      const ligne = texte.slice(0, m.index).split('\n').length;
      liens.push({ fichier, ligne, brut, url });
    }
  }
  return liens;
}

/** Les écarts d'un lien, sous forme de phrases ; un tableau vide si le lien est bon. */
export function ecartsDuLien({ brut, url }) {
  const ecarts = [];
  let decode;
  try {
    decode = decodeURIComponent(brut);
  } catch {
    return ['le lien est mal encodé (decodeURIComponent échoue)'];
  }
  if (decode.length > LONGUEUR_MAX) {
    ecarts.push(`le lien décodé fait ${decode.length} caractères (au plus ${LONGUEUR_MAX})`);
  }
  const repo = url.searchParams.get('repo');
  if (repo !== REPO) ecarts.push(`repo vaut « ${repo ?? '(absent)'} » au lieu de « ${REPO} »`);
  const provider = url.searchParams.get('provider');
  if (provider !== PROVIDER) ecarts.push(`provider vaut « ${provider ?? '(absent)'} » au lieu de « ${PROVIDER} »`);
  const modele = url.searchParams.get('model');
  if (modele !== MODELE) ecarts.push(`model vaut « ${modele ?? '(absent)'} » au lieu de « ${MODELE} »`);
  if (INVISIBLES.test(brut)) ecarts.push(`caractère invisible dans le lien : ${decrireInvisible(brut)}`);
  const prompt = url.searchParams.get('prompt') ?? '';
  if (INVISIBLES.test(prompt)) ecarts.push(`caractère invisible dans le prompt : ${decrireInvisible(prompt)}`);
  return ecarts;
}

export default {
  numero: 7,
  titre: 'Prompt links (8 000 caractères, repo, modèle, aucun caractère invisible)',
  async verifier({ dossier }) {
    const page = lireTexte(dossier, 'index.html') ?? '';
    const emplacements = [...page.matchAll(/<p class="prompt-link" data-prompt-link="([^"]+)">(.*?)<\/p>/g)];
    const vides = emplacements.filter((m) => !/<a href="https?:\/\/app\.t3\.codes\//.test(m[2])).map((m) => m[1]);
    if (vides.length) {
      throw new Ecart(`Emplacements de prompt link sans lien dans index.html : ${vides.join(', ')}. Lancez node outils/prompt-links/generer.mjs.`);
    }
    const liens = trouverPromptLinks(dossier);
    if (liens.length === 0) throw new Ecart('Aucun prompt link dans le dépôt.');
    const fautifs = [];
    for (const lien of liens) {
      const ecarts = ecartsDuLien(lien);
      if (ecarts.length) fautifs.push(`${lien.fichier}:${lien.ligne} — ${ecarts.join(' ; ')}`);
    }
    if (fautifs.length) {
      throw new Ecart(`${fautifs.length} prompt link(s) sur ${liens.length} en écart :\n${fautifs.join('\n')}`);
    }
    const fichiers = new Set(liens.map((l) => l.fichier)).size;
    return `${liens.length} prompt link(s) conformes, dans ${fichiers} fichier(s).`;
  },
};
