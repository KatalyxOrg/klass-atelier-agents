// Point 1 : les dépendances s'installent depuis zéro.
// Chaque dossier suivi qui contient un package.json (la racine, proposition/, video/…)
// est installé : `npm ci` s'il a un package-lock.json, `npm install` sinon.

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { Ecart, fichiersSuivis, npm } from '../outils.mjs';

export default {
  numero: 1,
  titre: 'Installation des dépendances depuis zéro',
  async verifier({ dossier }) {
    const manifestes = fichiersSuivis(dossier).filter(
      (f) => (f === 'package.json' || f.endsWith('/package.json')) && !f.includes('node_modules/'),
    );
    if (manifestes.length === 0) throw new Ecart('Aucun package.json dans le dépôt.');

    const installes = [];
    for (const manifeste of manifestes) {
      const relatif = dirname(manifeste);
      const cible = join(dossier, relatif);
      if (existsSync(join(cible, 'node_modules'))) {
        throw new Ecart(`${relatif}/node_modules existe avant l'installation : le clone n'est pas vierge.`);
      }
      const verrou = existsSync(join(cible, 'package-lock.json'));
      npm([verrou ? 'ci' : 'install', '--no-audit', '--no-fund', '--loglevel=error'], { cwd: cible });

      const pkg = JSON.parse(readFileSync(join(cible, 'package.json'), 'utf8'));
      const nbDependances = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).length;
      if (nbDependances > 0 && !existsSync(join(cible, 'node_modules'))) {
        throw new Ecart(`${relatif} déclare ${nbDependances} dépendance(s), mais node_modules est absent après l'installation.`);
      }
      installes.push(`${relatif === '.' ? 'racine' : relatif} (${nbDependances} dépendance(s), ${verrou ? 'npm ci' : 'npm install'})`);
    }
    return `Installé : ${installes.join(' ; ')}`;
  },
};
