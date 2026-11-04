// Point 9 : la page support index.html.
//   - chaque image, feuille de style et script locaux qu'elle appelle existe dans le dépôt
//     (et les illustrations ne viennent pas de la branche de démo : elles sont suivies ici) ;
//   - chaque ancre interne (#…) mène à un élément de la page, dont les 9 étapes du script formateur ;
//   - dans le Chrome headless de Playwright, la page s'ouvre en mode présentation sans erreur,
//     chaque image se charge, et les flèches parcourent toutes les vues des 9 étapes ;
//   - chaque vue de présentation tient dans l'écran, commandes comprises, à 960 × 600
//     (1440 × 900 zoomé à 150 %, comme le demande le script formateur) et à 1366 × 768,
//     pour chaque choix de parcours : rien ne sort du cadre, rien ne passe sous les commandes.

import { createRequire } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Ecart, fichiersSuivis, lireTexte } from '../outils.mjs';

const PAGE = 'index.html';
const CADRES = [{ width: 960, height: 600 }, { width: 1366, height: 768 }];
const PARCOURS = ['tous', 'proposition', 'video'];

/** Dans la page ouverte en présentation : ce qui, dans la vue courante, sort du cadre ou passe sous les commandes. */
function debordements() {
  const H = innerHeight;
  const W = innerWidth;
  const commandes = document.querySelector('.commandes-diapo')?.getBoundingClientRect();
  const vue = document.querySelector('section.active > .bloc.courant');
  const ecarts = [];
  if (document.documentElement.scrollHeight > H + 1) ecarts.push(`la page défile (${document.documentElement.scrollHeight} px de haut pour ${H})`);
  if (!vue) return ecarts;
  for (const e of vue.querySelectorAll('h1, h3, li, p, img, table, td, figure > svg, .carte, .encart, .promesse, .surtitre')) {
    const r = e.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const texte = (e.textContent || e.getAttribute('alt') || e.tagName).trim().replace(/\s+/g, ' ').slice(0, 50);
    if (r.bottom > H + 0.5 || r.right > W + 0.5 || r.left < -0.5) ecarts.push(`« ${texte} » sort du cadre`);
    else if (commandes && r.left < commandes.right && r.right > commandes.left && r.top < commandes.bottom && r.bottom > commandes.top) ecarts.push(`« ${texte} » passe sous les commandes`);
  }
  return [...new Set(ecarts)];
}

const ETAPES = ['accueil', 'pourquoi', 'briefer', 'environnement', 'verification', 'orchestrer', 'mobile', 'cloture', 'marge'];

/** Les ressources locales appelées par la page : src et href qui ne sont ni des liens web ni des ancres. */
function ressourcesLocales(page) {
  const chemins = new Set();
  for (const m of page.matchAll(/<(?:img|script|link)\b[^>]*?\b(?:src|href)="([^"]+)"/g)) {
    const valeur = m[1];
    if (/^(?:[a-z]+:|\/\/|#)/i.test(valeur)) continue;
    chemins.add(decodeURI(valeur.split(/[?#]/)[0]));
  }
  return [...chemins];
}

export default {
  numero: 9,
  titre: 'Page support : images, ancres, et mode présentation dans le Chrome headless',
  requiert: [1],
  async verifier({ dossier }) {
    const page = lireTexte(dossier, PAGE);
    if (page === null) throw new Ecart(`${PAGE} est absent du dépôt.`);
    const suivis = new Set(fichiersSuivis(dossier));

    // Les ressources locales
    const ressources = ressourcesLocales(page);
    const manquantes = ressources.filter((c) => !suivis.has(c));
    if (manquantes.length) throw new Ecart(`${PAGE} appelle des fichiers absents du dépôt : ${manquantes.join(', ')}.`);
    const images = ressources.filter((c) => /\.(?:png|jpe?g|svg|webp|gif)$/i.test(c));

    // Les ancres
    const ids = new Set([...page.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
    const sansEtape = ETAPES.filter((id) => !new RegExp(`<section class="etape" id="${id}"`).test(page));
    if (sansEtape.length) throw new Ecart(`Étapes absentes de ${PAGE} (le script formateur y renvoie) : ${sansEtape.map((e) => `#${e}`).join(', ')}.`);
    const cibles = [...page.matchAll(/href="#([^"]*)"/g)].map((m) => m[1]);
    const orphelines = [...new Set(cibles.filter((c) => c && !ids.has(c)))];
    if (orphelines.length) throw new Ecart(`Ancres sans cible dans ${PAGE} : ${orphelines.map((c) => `#${c}`).join(', ')}.`);
    const usages = [...page.matchAll(/(?:href|marker-(?:start|end))="(?:url\()?#([^")]+)\)?"/g)].map((m) => m[1]);
    const symboles = [...new Set(usages.filter((c) => !ids.has(c)))];
    if (symboles.length) throw new Ecart(`Pictos ou flèches introuvables dans ${PAGE} : ${symboles.join(', ')}.`);

    // Le Chrome headless : celui que le parcours Proposition installe
    const exiger = createRequire(join(dossier, 'proposition', 'package.json'));
    let chromium;
    try {
      ({ chromium } = exiger('playwright'));
    } catch {
      throw new Ecart('Playwright est introuvable dans proposition/node_modules : le point 1 doit passer avant.');
    }
    const url = `${pathToFileURL(join(dossier, PAGE)).href}?mode=presentation&parcours=tous#accueil`;
    const navigateur = await chromium.launch();
    try {
      const contexte = await navigateur.newContext({ viewport: { width: 1440, height: 900 } });
      const onglet = await contexte.newPage();
      const erreurs = [];
      onglet.on('pageerror', (e) => erreurs.push(`erreur JavaScript : ${e.message}`));
      onglet.on('console', (m) => { if (m.type() === 'error') erreurs.push(`console : ${m.text()}`); });
      onglet.on('requestfailed', (r) => { if (r.url().startsWith('file:')) erreurs.push(`fichier non chargé : ${r.url()}`); });
      await onglet.goto(url, { waitUntil: 'load' });

      const etat = await onglet.evaluate(() => ({
        presentation: document.documentElement.classList.contains('presentation'),
        section: document.querySelector('section.active')?.id,
        vue: Boolean(document.querySelector('section.active > .bloc.courant')?.getBoundingClientRect().height),
        frise: document.querySelectorAll('[data-frise] a').length,
        images: [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.getAttribute('src')),
      }));
      if (!etat.presentation) throw new Ecart('Le mode présentation ne s\'ouvre pas (?mode=presentation).');
      if (etat.section !== 'accueil' || !etat.vue) throw new Ecart('Le mode présentation n\'affiche pas la première vue de l\'accueil.');
      if (etat.frise < ETAPES.length) throw new Ecart(`La frise ne compte que ${etat.frise} lien(s) pour ${ETAPES.length} étapes.`);
      if (etat.images.length) throw new Ecart(`Images non chargées dans le navigateur : ${etat.images.join(', ')}.`);

      // Les flèches parcourent toutes les vues, étape après étape.
      const vues = new Map();
      for (let i = 0; i < 200; i++) {
        const { id, compteur, visible } = await onglet.evaluate(() => ({
          id: document.querySelector('section.active')?.id,
          compteur: document.querySelector('.commandes-diapo .compteur')?.textContent,
          visible: Boolean(document.querySelector('section.active > .bloc.courant')?.getBoundingClientRect().height),
        }));
        if (!visible && ETAPES.includes(id)) throw new Ecart(`Vue vide en présentation : #${id} (${compteur}).`);
        vues.set(id, (vues.get(id) ?? 0) + 1);
        await onglet.keyboard.press('ArrowRight');
        const apres = await onglet.evaluate(() => document.querySelector('.commandes-diapo .compteur')?.textContent);
        if (apres === compteur) break;
      }
      const jamaisVues = ETAPES.filter((e) => !vues.has(e));
      if (jamaisVues.length) throw new Ecart(`Les flèches n'atteignent pas : ${jamaisVues.map((e) => `#${e}`).join(', ')}.`);

      // Chaque ancre d'étape s'ouvre, en mode lecture.
      await onglet.keyboard.press('Escape');
      for (const id of ETAPES) {
        await onglet.evaluate((cible) => { location.hash = cible; }, id);
        const active = await onglet.evaluate(() => document.querySelector('section.active')?.id);
        if (active !== id) throw new Ecart(`L'ancre #${id} n'affiche pas son étape (affiche #${active}).`);
      }
      if (erreurs.length) throw new Ecart(`La page s'ouvre avec des erreurs :\n${erreurs.join('\n')}`);
      await contexte.close();

      // Chaque vue tient dans le cadre, à chaque taille d'écran et pour chaque parcours.
      const fautes = [];
      for (const cadre of CADRES) {
        const ctx = await navigateur.newContext({ viewport: cadre });
        for (const parcours of PARCOURS) {
          const o = await ctx.newPage();
          await o.goto(url.replace('parcours=tous', `parcours=${parcours}`), { waitUntil: 'load' });
          await o.evaluate(() => document.fonts.ready);
          for (let i = 0; i < 200; i++) {
            const compteur = await o.evaluate(() => document.querySelector('.commandes-diapo .compteur')?.textContent);
            for (const ecart of await o.evaluate(debordements)) fautes.push(`${cadre.width} × ${cadre.height}, parcours ${parcours}, ${compteur} : ${ecart}`);
            await o.keyboard.press('ArrowRight');
            if (await o.evaluate(() => document.querySelector('.commandes-diapo .compteur')?.textContent) === compteur) break;
          }
          await o.close();
        }
        await ctx.close();
      }
      if (fautes.length) throw new Ecart(`Des vues de présentation débordent (${fautes.length}) :\n${fautes.slice(0, 15).join('\n')}`);

      const total = [...vues.values()].reduce((a, b) => a + b, 0);
      return `${images.length} image(s) et ${ressources.length - images.length} autre(s) fichier(s) présents ; ${ids.size} ancres ; présentation : ${total} vues sur ${vues.size} parties, sans erreur ; chaque vue tient à 960 × 600 et 1366 × 768, pour les 3 choix de parcours.`;
    } finally {
      await navigateur.close();
    }
  },
};
