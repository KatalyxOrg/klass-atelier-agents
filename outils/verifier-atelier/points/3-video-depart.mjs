// Point 3 : la vidéo de départ se rend, dure 20 s (à ±0,5 s) et a la résolution attendue.
// Le rendu passe par le même script que celui de l'associé (npm run rendre dans video/).

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { Ecart, executer, npm } from '../outils.mjs';

const DUREE_ATTENDUE = 20;
const TOLERANCE = 0.5;
const LARGEUR = 1080;
const HAUTEUR = 1920;

export default {
  numero: 3,
  titre: 'Vidéo de départ : 20 s, résolution attendue',
  requiert: [1],
  async verifier({ dossier }) {
    const video = join(dossier, 'video');
    if (!existsSync(join(video, 'package.json'))) throw new Ecart('Le dossier video/ (projet Remotion de départ) est absent.');

    npm(['run', 'rendre', '--silent'], { cwd: video });

    const mp4 = join(video, 'out', 'video.mp4');
    if (!existsSync(mp4)) throw new Ecart('Le rendu n\'a pas produit video/out/video.mp4.');

    const sonde = executer('ffprobe', [
      '-v', 'error', '-select_streams', 'v:0',
      '-show_entries', 'stream=width,height:format=duration',
      '-of', 'json', mp4,
    ]);
    const { streams, format } = JSON.parse(sonde.stdout);
    const { width, height } = streams?.[0] ?? {};
    const duree = Number(format?.duration);

    if (!Number.isFinite(duree) || Math.abs(duree - DUREE_ATTENDUE) > TOLERANCE) {
      throw new Ecart(`La vidéo dure ${duree} s ; ${DUREE_ATTENDUE} s attendues (à ±${TOLERANCE} s près).`);
    }
    if (width !== LARGEUR || height !== HAUTEUR) {
      throw new Ecart(`La vidéo fait ${width}×${height} ; ${LARGEUR}×${HAUTEUR} attendus.`);
    }
    return `Vidéo rendue : ${duree.toFixed(2)} s, ${width}×${height}.`;
  },
};
