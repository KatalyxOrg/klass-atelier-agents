#!/usr/bin/env node
// Les yeux du parcours Proposition.
//
// Rend une proposition écrite en Markdown :
//   1. en PDF A4 aux couleurs Klass, avec le Chrome headless de Playwright ;
//   2. puis en une image PNG par page, avec pdf.js dans ce même Chrome (pas de Poppler).
//
// Usage, depuis proposition/ :
//   npm run rendre -- exemple/proposition.md
//
// Sortie : un dossier rendu/ à côté du fichier Markdown, qui contient proposition.pdf
// et page-1.png, page-2.png… Le dossier est vidé à chaque rendu. Il n'est pas suivi par Git.

import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import { chromium } from 'playwright';

const ICI = dirname(fileURLToPath(import.meta.url));
const PARCOURS = resolve(ICI, '..');
const RACINE = resolve(PARCOURS, '..');
const PDFJS = join(PARCOURS, 'node_modules', 'pdfjs-dist', 'build');
const ORIGINE = 'http://atelier.local';
const ECHELLE = 1.5; // 1 point PDF = 1,5 pixel : une page A4 fait environ 893 × 1263 pixels.

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ttf': 'font/ttf',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
};

function arreter(message) {
  console.error(`Rendu impossible : ${message}`);
  process.exit(1);
}

const echapper = (texte) =>
  texte.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Le chemin d'un fichier du dépôt, vu depuis l'origine servie au navigateur. */
const url = (chemin) => `${ORIGINE}/${relative(RACINE, chemin).split(sep).map(encodeURIComponent).join('/')}`;

function pageHtml(markdown, dossierSource) {
  const titre = (markdown.match(/^#\s+(.+)$/m)?.[1] ?? 'Proposition').replace(/[*_`]/g, '').trim();
  const corps = marked.parse(markdown, { breaks: true }); // un retour à la ligne du Markdown reste un retour à la ligne
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>${echapper(titre)}</title>
<base href="${url(dossierSource)}/">
<link rel="stylesheet" href="${ORIGINE}/klass/brand.css">
<link rel="stylesheet" href="${ORIGINE}/klass/polices.css">
<style>
@page{size:A4;margin:16mm 18mm 18mm}
*{box-sizing:border-box}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0;color:var(--klass-ink);font:10.5pt/1.5 var(--klass-font-text)}
.bandeau{display:flex;justify-content:space-between;align-items:center;padding-bottom:5mm;margin-bottom:7mm;border-bottom:2px solid var(--klass-ink)}
.bandeau img{height:11mm}
.bandeau span{font-family:var(--klass-font-display);font-weight:700;font-size:8.5pt;letter-spacing:.08em;text-transform:uppercase;color:var(--klass-orange-strong)}
h1,h2,h3{font-family:var(--klass-font-display);line-height:1.15;letter-spacing:-.01em;break-after:avoid}
h1{font-size:24pt;font-weight:800;margin:0 0 4mm}
h1::after{content:"_";color:var(--klass-orange)}
h2{font-size:14pt;font-weight:800;margin:7mm 0 2.5mm;padding-top:5mm;background:linear-gradient(var(--klass-orange),var(--klass-orange)) left top/22mm 3px no-repeat}
h3{font-size:11.5pt;font-weight:700;margin:5mm 0 2mm}
p,ul,ol{margin:0 0 2.5mm}
ul,ol{padding-left:6mm}
li{margin:0 0 1mm}
strong{font-weight:650}
a{color:var(--klass-orange-strong)}
table{border-collapse:collapse;width:100%;margin:3mm 0 4mm;font-size:10pt;break-inside:avoid}
th,td{text-align:left;padding:2mm 3mm;border-bottom:1px solid var(--klass-border);vertical-align:top}
th{font-family:var(--klass-font-display);font-weight:700;background:var(--klass-paper)}
td[align=right],th[align=right]{text-align:right;white-space:nowrap}
tr:last-child td{border-bottom:2px solid var(--klass-ink)}
blockquote{margin:3mm 0;padding:1mm 0 1mm 5mm;border-left:3px solid var(--klass-orange);font-size:11pt}
blockquote p{margin:0}
hr{border:0;border-top:1px solid var(--klass-border);margin:5mm 0}
code{font-size:.9em;background:var(--klass-paper);padding:0 3px;border-radius:2px}
img{max-width:100%}
</style>
</head>
<body>
<div class="bandeau"><img src="${ORIGINE}/klass/svg/klass-lockup.svg" alt="Klass by Katalyx"><span>Proposition commerciale</span></div>
${corps}
</body>
</html>`;
}

const PIED = `<div style="width:100%;padding:0 18mm;font-family:'Schibsted Grotesk',sans-serif;font-size:7.5pt;color:#575757;display:flex;justify-content:space-between">
<span class="title"></span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`;

// Les deux pages servies en mémoire : la proposition en HTML, et la page qui convertit le PDF en images.
const PAGE_IMAGES = `<!doctype html><meta charset="utf-8"><body style="margin:0">`;

async function main() {
  const argument = process.argv[2];
  if (!argument || argument === '--aide' || argument === '-h') {
    console.log('Usage, depuis proposition/ : npm run rendre -- <chemin/vers/proposition.md>');
    process.exit(argument ? 0 : 1);
  }
  // Le chemin peut être donné depuis la racine de l'atelier ou depuis proposition/.
  const candidats = [process.env.INIT_CWD, process.cwd(), PARCOURS, RACINE].filter(Boolean).map((d) => resolve(d, argument));
  const source = candidats.find((c) => existsSync(c));
  if (!source) arreter(`le fichier ${argument} est introuvable.`);
  if (extname(source).toLowerCase() !== '.md') arreter(`${argument} n'est pas un fichier Markdown (.md).`);
  if (!source.startsWith(RACINE + sep)) arreter(`${argument} doit se trouver dans le dossier de l'atelier.`);
  if (!existsSync(join(PDFJS, 'pdf.min.mjs'))) {
    arreter('les dépendances du parcours ne sont pas installées. Lancez « npm install » dans proposition/.');
  }

  const dossierSource = dirname(source);
  const sortie = join(dossierSource, 'rendu');
  rmSync(sortie, { recursive: true, force: true });
  mkdirSync(sortie, { recursive: true });

  const html = pageHtml(readFileSync(source, 'utf8'), dossierSource);
  let pdf = null;

  let navigateur;
  try {
    navigateur = await chromium.launch();
  } catch (erreur) {
    arreter(`le navigateur intégré ne démarre pas. Lancez « npm install » dans proposition/ : il le télécharge (environ 120 Mo).\n${erreur.message.split('\n')[0]}`);
  }

  try {
    const contexte = await navigateur.newContext();
    // Tout est servi depuis le disque, sous une origine locale ; le reste du web est coupé,
    // pour que le rendu soit le même avec ou sans connexion.
    await contexte.route('**/*', async (route) => {
      const demande = new URL(route.request().url());
      if (demande.origin !== ORIGINE) return route.abort();
      const chemin = decodeURIComponent(demande.pathname);
      if (chemin === '/__proposition__.html') return route.fulfill({ body: html, contentType: TYPES['.html'] });
      if (chemin === '/__images__.html') return route.fulfill({ body: PAGE_IMAGES, contentType: TYPES['.html'] });
      if (chemin === '/__proposition__.pdf') return route.fulfill({ body: pdf, contentType: TYPES['.pdf'] });
      const fichier = chemin.startsWith('/__pdfjs__/')
        ? join(PDFJS, chemin.slice('/__pdfjs__/'.length))
        : join(RACINE, chemin);
      if (!fichier.startsWith(RACINE + sep) || !existsSync(fichier)) return route.fulfill({ status: 404, body: '' });
      return route.fulfill({
        body: readFileSync(fichier),
        contentType: TYPES[extname(fichier).toLowerCase()] ?? 'application/octet-stream',
      });
    });

    // 1. Le PDF.
    const page = await contexte.newPage();
    await page.goto(`${ORIGINE}/__proposition__.html`, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: PIED,
    });
    writeFileSync(join(sortie, 'proposition.pdf'), pdf);

    // 2. Une image par page, en lisant le PDF lui-même avec pdf.js.
    const lecteur = await contexte.newPage();
    await lecteur.goto(`${ORIGINE}/__images__.html`);
    const images = await lecteur.evaluate(async (echelle) => {
      const pdfjs = await import('/__pdfjs__/pdf.min.mjs');
      pdfjs.GlobalWorkerOptions.workerSrc = '/__pdfjs__/pdf.worker.min.mjs';
      const document_ = await pdfjs.getDocument({ url: '/__proposition__.pdf' }).promise;
      const rendus = [];
      for (let n = 1; n <= document_.numPages; n++) {
        const pagePdf = await document_.getPage(n);
        const vue = pagePdf.getViewport({ scale: echelle });
        const toile = document.createElement('canvas');
        toile.width = Math.ceil(vue.width);
        toile.height = Math.ceil(vue.height);
        const contexte2d = toile.getContext('2d');
        contexte2d.fillStyle = '#FFFFFF';
        contexte2d.fillRect(0, 0, toile.width, toile.height);
        await pagePdf.render({ canvas: toile, canvasContext: contexte2d, viewport: vue }).promise;
        rendus.push(toile.toDataURL('image/png').split(',')[1]);
      }
      return rendus;
    }, ECHELLE);

    if (images.length === 0) arreter('le PDF ne contient aucune page.');
    images.forEach((base64, i) => writeFileSync(join(sortie, `page-${i + 1}.png`), Buffer.from(base64, 'base64')));
  } finally {
    await navigateur.close();
  }

  const pages = readdirSync(sortie).filter((f) => /^page-\d+\.png$/.test(f)).length;
  const lisible = (chemin) => relative(process.cwd(), chemin) || '.';
  console.log(`PDF : ${lisible(join(sortie, 'proposition.pdf'))} (${pages} page${pages > 1 ? 's' : ''})`);
  console.log(`Images : ${lisible(sortie)}/page-1.png … page-${pages}.png`);
  console.log(`Source : ${basename(source)}`);
}

main().catch((erreur) => arreter(erreur.message));
