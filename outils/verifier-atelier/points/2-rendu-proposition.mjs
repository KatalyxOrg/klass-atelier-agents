// Point 2 : le rendu de la proposition (les yeux du parcours Proposition).
// Dans le clone, il rend la proposition d'exemple avec le script du parcours, puis contrôle :
//   - le PDF existe et compte au moins une page ;
//   - il y a une image PNG par page, chacune de taille non nulle ;
//   - le script passe par le Chrome headless de Playwright, pas par Poppler.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { Ecart, executer } from '../outils.mjs';

const SCRIPT = 'proposition/outils/rendre.mjs';
const EXEMPLE = 'proposition/exemple/proposition.md';
const SORTIE = 'proposition/exemple/rendu';
const SIGNATURE_PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

export default {
  numero: 2,
  titre: 'Rendu de la proposition : PDF, puis une image PNG par page',
  requiert: [1],
  async verifier({ dossier }) {
    for (const f of [SCRIPT, EXEMPLE]) {
      if (!existsSync(join(dossier, f))) throw new Ecart(`${f} est absent du dépôt.`);
    }
    const script = readFileSync(join(dossier, SCRIPT), 'utf8');
    if (/pdftoppm|pdftocairo/.test(script)) throw new Ecart(`${SCRIPT} passe par Poppler : il doit rester sur le Chrome headless.`);
    if (!/from 'playwright'/.test(script)) throw new Ecart(`${SCRIPT} n'utilise pas le Chrome headless de Playwright.`);

    executer(process.execPath, ['outils/rendre.mjs', 'exemple/proposition.md'], { cwd: join(dossier, 'proposition') });

    const pdf = join(dossier, SORTIE, 'proposition.pdf');
    if (!existsSync(pdf)) throw new Ecart(`Le rendu n'a pas produit ${SORTIE}/proposition.pdf.`);
    const octets = readFileSync(pdf);
    if (octets.subarray(0, 5).toString('latin1') !== '%PDF-') throw new Ecart('proposition.pdf n\'est pas un PDF.');
    const pages = (octets.toString('latin1').match(/\/Type\s*\/Page(?![s\w])/g) ?? []).length;
    if (pages < 1) throw new Ecart('Le PDF ne compte aucune page.');

    const images = readdirSync(join(dossier, SORTIE)).filter((f) => /^page-\d+\.png$/.test(f));
    if (images.length !== pages) throw new Ecart(`Le PDF compte ${pages} page(s), mais le rendu a produit ${images.length} image(s).`);
    for (let n = 1; n <= pages; n++) {
      const image = join(dossier, SORTIE, `page-${n}.png`);
      if (!existsSync(image)) throw new Ecart(`page-${n}.png manque.`);
      if (statSync(image).size === 0) throw new Ecart(`page-${n}.png est vide.`);
      if (!readFileSync(image).subarray(0, 8).equals(SIGNATURE_PNG)) throw new Ecart(`page-${n}.png n'est pas une image PNG.`);
    }
    const poids = images.map((f) => Math.round(statSync(join(dossier, SORTIE, f)).size / 1024));
    return `PDF de ${pages} page(s) ; ${pages} PNG non vides (${poids.join(', ')} Ko).`;
  },
};
