// Point 8 : le dépôt d'exercices ne mentionne pas l'autre marque de Katalyx.
// Le nom est cherché, sans tenir compte de la casse, dans le contenu des fichiers suivis,
// dans leurs chemins et dans les messages de commit de la branche.
// Il est écrit en deux morceaux pour que ce fichier ne le contienne pas lui-même.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Ecart, executer, fichiersSuivis } from '../outils.mjs';

const NOM = ['Web', 'isport'].join('');
const MOTIF = new RegExp(['web', 'isport'].join('[\\s._-]?'), 'i');

export default {
  numero: 8,
  titre: `Aucune mention de ${NOM} dans le dépôt`,
  async verifier({ dossier }) {
    const trouves = [];
    const fichiers = fichiersSuivis(dossier);
    for (const fichier of fichiers) {
      if (MOTIF.test(fichier)) trouves.push(`chemin : ${fichier}`);
      const texte = readFileSync(join(dossier, fichier)).toString('latin1');
      const m = texte.match(MOTIF);
      if (m) trouves.push(`${fichier}:${texte.slice(0, m.index).split('\n').length}`);
    }
    const journal = executer('git', ['log', '--format=%h %B'], { cwd: dossier }).stdout;
    const commits = journal.split('\n').filter((l) => MOTIF.test(l));
    commits.forEach((l) => trouves.push(`message de commit : ${l.trim().slice(0, 80)}`));

    if (trouves.length) {
      throw new Ecart(`${NOM} est mentionné ${trouves.length} fois :\n${trouves.join('\n')}`);
    }
    return `${fichiers.length} fichiers suivis et l'historique de la branche lus : aucune mention.`;
  },
};
