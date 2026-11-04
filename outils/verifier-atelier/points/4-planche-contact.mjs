// Point 4 : la planche contact existe et a les dimensions attendues pour ses vignettes.
// Elle est produite par le script de l'associé (npm run planche dans video/), à partir de la vidéo du point 3.
//
// Les valeurs attendues sont écrites ici, volontairement, et non lues dans le script :
// si le script change, ce point le signale.

import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { Ecart, npm } from '../outils.mjs';

const COLONNES = 5;
const LIGNES = 2;
const LARGEUR_VIGNETTE = 216;
const HAUTEUR_VIGNETTE = 384; // 216 × 1920 / 1080, pour la vidéo 1080 × 1920
const ECART = 8; // entre les vignettes et autour de la planche

const LARGEUR = COLONNES * LARGEUR_VIGNETTE + (COLONNES - 1) * ECART + 2 * ECART;
const HAUTEUR = LIGNES * HAUTEUR_VIGNETTE + (LIGNES - 1) * ECART + 2 * ECART;

/** Largeur et hauteur d'un PNG, lues dans son en-tête. */
function dimensionsPng(chemin) {
  const octets = readFileSync(chemin);
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (octets.length < 24 || !octets.subarray(0, 8).equals(signature)) throw new Ecart('video/out/planche-contact.png n\'est pas une image PNG.');
  return { largeur: octets.readUInt32BE(16), hauteur: octets.readUInt32BE(20) };
}

export default {
  numero: 4,
  titre: 'Planche contact : présente, aux dimensions attendues',
  requiert: [3],
  async verifier({ dossier }) {
    const video = join(dossier, 'video');
    npm(['run', 'planche', '--silent'], { cwd: video });

    const png = join(video, 'out', 'planche-contact.png');
    if (!existsSync(png) || statSync(png).size === 0) throw new Ecart('La planche contact video/out/planche-contact.png est absente ou vide.');

    const { largeur, hauteur } = dimensionsPng(png);
    if (largeur !== LARGEUR || hauteur !== HAUTEUR) {
      throw new Ecart(`La planche fait ${largeur}×${hauteur} ; ${LARGEUR}×${HAUTEUR} attendus pour ${COLONNES * LIGNES} vignettes (${COLONNES}×${LIGNES}).`);
    }
    return `Planche de ${largeur}×${hauteur}, ${COLONNES * LIGNES} vignettes (${COLONNES}×${LIGNES}).`;
  },
};
