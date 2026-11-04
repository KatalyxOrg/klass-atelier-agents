// Point 5 : la skill /proposition-klass.
//   - .claude/skills/proposition-klass/SKILL.md existe ;
//   - son en-tête est valide : name vaut « proposition-klass », description est remplie ;
//   - les fichiers qu'elle référence existent, dont la grille et le script de rendu ;
//   - c'est la seule skill du dépôt.

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { Ecart, fichiersSuivis, lireTexte } from '../outils.mjs';

const NOM = 'proposition-klass';
const SKILL = `.claude/skills/${NOM}/SKILL.md`;
const ATTENDUS = ['proposition/grille-proposition.md', 'proposition/outils/rendre.mjs'];

function lireEntete(texte) {
  const m = texte.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!m) return null;
  const champs = {};
  for (const ligne of m[1].split(/\r?\n/)) {
    const c = ligne.match(/^([a-zA-Z-]+):\s*(.*)$/);
    if (c) champs[c[1]] = c[2].trim().replace(/^["']|["']$/g, '');
  }
  return { champs, corps: texte.slice(m[0].length) };
}

export default {
  numero: 5,
  titre: 'Skill /proposition-klass : en-tête valide, fichiers référencés présents',
  async verifier({ dossier }) {
    const suivis = fichiersSuivis(dossier);
    if (!suivis.includes(SKILL)) throw new Ecart(`${SKILL} n'est pas dans le dépôt.`);

    const autres = suivis.filter((f) => /(^|\/)SKILL\.md$/.test(f) && f !== SKILL);
    if (autres.length) throw new Ecart(`/${NOM} doit être la seule skill du dépôt ; trouvé aussi : ${autres.join(', ')}`);

    const entete = lireEntete(lireTexte(dossier, SKILL) ?? '');
    if (!entete) throw new Ecart(`${SKILL} n'a pas d'en-tête (--- … ---).`);
    const { name, description } = entete.champs;
    if (name !== NOM) throw new Ecart(`name vaut « ${name ?? ''} » au lieu de « ${NOM} ».`);
    if (!description) throw new Ecart('description est vide.');
    if (description.length > 1024) throw new Ecart(`description fait ${description.length} caractères (1 024 au plus).`);

    // Les chemins cités entre accents graves ou en lien, relatifs à la racine de l'atelier.
    const cites = new Set();
    for (const m of entete.corps.matchAll(/`([^`\s]+\/[^`\s]+)`|\]\(([^)\s]+)\)/g)) {
      const chemin = (m[1] ?? m[2]).replace(/^\.\//, '').replace(/[#?].*$/, '');
      if (/^(https?:|mailto:)/.test(chemin) || chemin.includes('<') || chemin.includes('*')) continue;
      if (/^(proposition|sources|klass|\.claude)\//.test(chemin)) cites.add(chemin.replace(/\/$/, ''));
    }
    for (const attendu of ATTENDUS) {
      if (!cites.has(attendu)) throw new Ecart(`La skill ne référence pas ${attendu}.`);
    }
    const manquants = [...cites].filter((c) => !existsSync(join(dossier, c)));
    if (manquants.length) throw new Ecart(`Fichiers référencés absents : ${manquants.join(', ')}`);
    return `En-tête valide ; ${cites.size} fichiers référencés, tous présents (${[...cites].join(', ')}).`;
  },
};
