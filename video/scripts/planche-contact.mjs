// Les yeux de l'agent sur la vidéo : une planche contact, c'est-à-dire une seule image
// qui aligne 10 vignettes de la vidéo, une toutes les 2 secondes.
//
//   npm run planche                 (lit out/video.mp4, écrit out/planche-contact.png)
//
// Les vignettes se lisent de gauche à droite, puis de haut en bas : la case 1 est à 1 s,
// la case 2 à 3 s, la case 3 à 5 s… la case 10 à 19 s. Chaque case montre le milieu de
// ses 2 secondes. Le rendu reste hors de Git (dossier out/).
//
// Il faut ffmpeg sur l'ordinateur (c'est le check d'environnement de l'accueil qui l'installe).

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const video = join(racine, 'out', 'video.mp4');
const planche = join(racine, 'out', 'planche-contact.png');

const COLONNES = 5;
const LIGNES = 2;
const LARGEUR_VIGNETTE = 216; // la hauteur suit le format de la vidéo
const ECART = 8; // espace blanc entre deux vignettes et autour de la planche
const PAS_SECONDES = 2;

if (!existsSync(video)) {
  console.error('La vidéo out/video.mp4 n\'existe pas encore : rendez-la d\'abord (npm run rendre).');
  process.exit(1);
}

// Le nombre d'images par seconde de la vidéo (30 pour la composition de départ).
const sonde = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=r_frame_rate', '-of', 'csv=p=0', video], {
  encoding: 'utf8',
});
const [numerateur, denominateur] = (sonde.stdout ?? '').trim().split('/').map(Number);
const fps = numerateur / (denominateur || 1);
if (!fps) {
  console.error('ffprobe n\'a pas pu lire la vidéo : il vient avec ffmpeg (voir CLAUDE.md du dossier video/).');
  process.exit(1);
}
const pasImages = Math.round(fps * PAS_SECONDES);

const filtre = [
  `select='not(mod(n\\,${pasImages}))'`,
  `scale=${LARGEUR_VIGNETTE}:-2`,
  `tile=${COLONNES}x${LIGNES}:padding=${ECART}:margin=${ECART}:color=white`,
].join(',');

// -ss 1 : on regarde le milieu de chaque tranche de 2 secondes plutôt que son tout début.
const r = spawnSync('ffmpeg', ['-y', '-v', 'error', '-ss', String(PAS_SECONDES / 2), '-i', video, '-vf', filtre, '-frames:v', '1', planche], {
  stdio: 'inherit',
});
if (r.error) {
  console.error('ffmpeg est introuvable : il faut l\'installer (voir CLAUDE.md du dossier video/).');
  process.exit(1);
}
if (r.status !== 0) process.exit(r.status ?? 1);

console.log(`Planche contact : video/out/planche-contact.png (${COLONNES * LIGNES} vignettes, une toutes les ${PAS_SECONDES} s, de 1 s à 19 s).`);
