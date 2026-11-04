// Outils partagés par les points de verifier-atelier.
// Un point les importe avec : import { executer, npm, fichiersSuivis } from '../outils.mjs';

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Erreur d'un point : son message est affiché tel quel, sans pile d'appels.
 * On la reconnaît à son nom, car les points sont chargés depuis le clone
 * (une autre copie de ce module que celle du lanceur).
 */
export class Ecart extends Error {
  constructor(message) {
    super(message);
    this.name = 'Ecart';
  }
}

export const estEcart = (erreur) => erreur?.name === 'Ecart';

/**
 * Lance une commande et rend sa sortie. Lève un Ecart si elle échoue,
 * sauf avec { toleree: true }.
 */
export function executer(commande, args = [], { cwd, toleree = false, env } = {}) {
  const r = spawnSync(commande, args, {
    cwd,
    env: { ...process.env, ...env },
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  });
  if (r.error) {
    throw new Ecart(`Impossible de lancer « ${commande} » : ${r.error.message}`);
  }
  if (r.status !== 0 && !toleree) {
    const sortie = `${r.stdout ?? ''}\n${r.stderr ?? ''}`.trim().split('\n').slice(-25).join('\n');
    throw new Ecart(`« ${commande} ${args.join(' ')} » a échoué (code ${r.status}).\n${sortie}`);
  }
  return { code: r.status, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
}

/**
 * Lance npm de façon portable (Mac, Linux, Windows) : sous `npm run`, on réutilise
 * le npm qui a lancé le script ; sinon on passe par le shell sous Windows.
 */
export function npm(args, options = {}) {
  const npmCli = process.env.npm_execpath;
  if (npmCli && /\.c?js$/.test(npmCli)) {
    return executer(process.execPath, [npmCli, ...args], options);
  }
  if (process.platform === 'win32') {
    return executer('cmd.exe', ['/d', '/s', '/c', 'npm', ...args], options);
  }
  return executer('npm', args, options);
}

/** Les fichiers suivis par Git dans le clone, en chemins relatifs avec des « / ». */
export function fichiersSuivis(dossier) {
  const { stdout } = executer('git', ['ls-files', '-z'], { cwd: dossier });
  return stdout.split('\0').filter(Boolean);
}

/** Lit un fichier suivi s'il s'agit de texte ; rend null pour un fichier binaire. */
export function lireTexte(dossier, chemin) {
  const contenu = readFileSync(join(dossier, chemin));
  if (contenu.includes(0)) return null;
  return contenu.toString('utf8');
}
