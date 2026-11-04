// Rend la composition « Presentation » en MP4 : out/video.mp4
//   npm run rendre
// Le premier rendu télécharge un navigateur intégré (environ 120 Mo) ; les suivants sont rapides.
// Les rendus restent hors de Git (dossier out/).

import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
mkdirSync(join(racine, 'out'), { recursive: true });

const remotion = join(racine, 'node_modules', '@remotion', 'cli', 'remotion-cli.js');
const r = spawnSync(process.execPath, [remotion, 'render', 'src/index.js', 'Presentation', 'out/video.mp4'], {
  cwd: racine,
  stdio: 'inherit',
});
if (r.error || r.status !== 0) {
  console.error('Le rendu a échoué : lisez le message ci-dessus.');
  process.exit(r.status ?? 1);
}
console.log('\nVidéo rendue : video/out/video.mp4');
