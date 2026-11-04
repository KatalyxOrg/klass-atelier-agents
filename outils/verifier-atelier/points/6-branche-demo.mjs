// Point 6 : la branche de démo pré-notée, que le formateur révèle pendant la partie
// « Vérification ». Sur le dépôt distant, la branche demo/proposition-notee :
//   - existe ;
//   - contient la proposition de démo, ses rendus (les pages en images) et son fichier de notes ;
//   - a une note par dimension de la grille Proposition (de 1 à 5, ou « Inconnu »),
//     chacune avec son passage cité, sauf « Inconnu ».

import { Ecart, executer } from '../outils.mjs';

export const BRANCHE = 'demo/proposition-notee';
const DOSSIER = 'proposition/victor';
const GRILLE = 'proposition/grille-proposition.md';

const montrer = (dossier, chemin) =>
  executer('git', ['show', `FETCH_HEAD:${chemin}`], { cwd: dossier, toleree: true });

/** Les dimensions de la grille : [{ numero, titre }], d'après ses titres « ## 1. … ». */
export function dimensionsDeLaGrille(texte) {
  return [...texte.matchAll(/^## (\d+)\. (.+?)\s*★?\s*$/gm)].map((m) => ({ numero: Number(m[1]), titre: m[2] }));
}

/** Les lignes du tableau de notes : [{ numero, note, citation }]. */
export function lignesDeNotes(texte) {
  const lignes = [];
  for (const ligne of texte.split(/\r?\n/)) {
    const cellules = ligne.split('|').slice(1, -1).map((c) => c.trim());
    const m = cellules[0]?.match(/^\**(\d+)\.\s/);
    if (!m || cellules.length < 3) continue;
    lignes.push({ numero: Number(m[1]), note: cellules[1].replace(/\*/g, ''), citation: cellules[2] });
  }
  return lignes;
}

export default {
  numero: 6,
  titre: `Branche de démo pré-notée (${BRANCHE}) : sur le remote, une note par dimension`,
  async verifier({ dossier }) {
    const distante = executer('git', ['ls-remote', '--heads', 'origin', BRANCHE], { cwd: dossier }).stdout.trim();
    if (!distante) throw new Ecart(`La branche ${BRANCHE} n'existe pas sur le dépôt distant.`);
    executer('git', ['fetch', '--quiet', 'origin', BRANCHE], { cwd: dossier });
    const commit = executer('git', ['rev-parse', '--short', 'FETCH_HEAD'], { cwd: dossier }).stdout.trim();

    const fichiers = executer('git', ['ls-tree', '-r', '--name-only', 'FETCH_HEAD', `${DOSSIER}/`], { cwd: dossier })
      .stdout.split('\n')
      .filter(Boolean);
    for (const attendu of [`${DOSSIER}/proposition.md`, `${DOSSIER}/notes-grille.md`]) {
      if (!fichiers.includes(attendu)) throw new Ecart(`${BRANCHE} ne contient pas ${attendu}.`);
    }
    const pages = fichiers.filter((f) => /\/rendu\/page-\d+\.png$/.test(f));
    if (pages.length === 0) throw new Ecart(`${BRANCHE} ne contient aucun rendu (${DOSSIER}/rendu/page-1.png…).`);

    const grille = montrer(dossier, GRILLE);
    const dimensions = dimensionsDeLaGrille(grille.stdout);
    if (grille.code !== 0 || dimensions.length === 0) throw new Ecart(`Impossible de lire les dimensions de ${GRILLE} sur ${BRANCHE}.`);

    const lignes = lignesDeNotes(montrer(dossier, `${DOSSIER}/notes-grille.md`).stdout);
    const ecarts = [];
    for (const { numero, titre } of dimensions) {
      const trouvees = lignes.filter((l) => l.numero === numero);
      if (trouvees.length !== 1) {
        ecarts.push(`dimension ${numero} (${titre}) : ${trouvees.length} ligne(s) de note au lieu d'une`);
        continue;
      }
      const { note, citation } = trouvees[0];
      if (!/^([1-5]|Inconnu)$/.test(note)) ecarts.push(`dimension ${numero} : note « ${note} » (attendu : 1 à 5, ou Inconnu)`);
      else if (note !== 'Inconnu' && !/«.+»/.test(citation)) ecarts.push(`dimension ${numero} : la note ${note} ne cite aucun passage`);
    }
    const enTrop = lignes.filter((l) => !dimensions.some((d) => d.numero === l.numero)).map((l) => l.numero);
    if (enTrop.length) ecarts.push(`notes pour des dimensions absentes de la grille : ${enTrop.join(', ')}`);
    if (ecarts.length) throw new Ecart(`${DOSSIER}/notes-grille.md sur ${BRANCHE} :\n${ecarts.join('\n')}`);

    const notes = dimensions.map((d) => `${d.numero}:${lignes.find((l) => l.numero === d.numero).note}`).join(' ');
    return `${BRANCHE} (${commit}) : ${dimensions.length} dimensions notées (${notes}), ${pages.length} page(s) rendue(s).`;
  },
};
