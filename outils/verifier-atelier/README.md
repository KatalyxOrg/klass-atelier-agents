# verifier-atelier

Le contrôle technique de l'atelier, pour le formateur. Les associés n'en ont pas besoin.

Il clone le **dépôt distant** dans un dossier temporaire, installe tout depuis zéro, puis lance les points de contrôle un par un et **s'arrête au premier écart**. Les points sont lus dans le clone : on contrôle ce qui a été poussé, pas la copie locale.

```bash
npm run verifier-atelier                 # tous les points
npm run verifier-atelier -- 7 8          # seulement les points 7 et 8
npm run verifier-atelier -- --liste      # la liste des points
npm run verifier-atelier -- --branche main --garder
```

Options : `--source <url ou chemin>` (par défaut : le remote `origin`), `--branche <nom>` (par défaut : la branche courante), `--garder` (garde le clone temporaire).

Limite assumée : le contrôle est écrit en Node pour rester portable, mais il n'est exécuté que sous Linux, sur la machine du formateur.

## Les points

| N° | Point | Fichier |
|---|---|---|
| 1 | Installation des dépendances depuis zéro (chaque dossier suivi qui a un `package.json`) | `points/1-installation.mjs` |
| 2 | Rendu de la proposition : PDF d'au moins une page, une image PNG par page | à venir (parcours Proposition) |
| 3 | Vidéo de départ : 20 s à ±0,5 s, à la résolution attendue | à venir (parcours Vidéo) |
| 4 | Planche contact : présente, aux dimensions attendues | à venir (parcours Vidéo) |
| 5 | Skill `/proposition-klass` : en-tête valide, fichiers référencés présents | à venir (parcours Proposition) |
| 6 | Branche de démo pré-notée : sur le remote, une note par dimension | à venir (mise en ligne) |
| 7 | Prompt links : 8 000 caractères au plus, `repo`, `provider` et `model` attendus, aucun caractère invisible. Passe à vide tant qu'aucun lien n'est posé | `points/7-prompt-links.mjs` |
| 8 | Aucune mention de l'autre marque de Katalyx (contenu, chemins, messages de commit) | `points/8-aucune-mention.mjs` |

## Ajouter un point

Créez `points/<numéro>-<nom>.mjs`. Le lanceur découvre seul les fichiers du dossier : il n'y a rien d'autre à modifier.

```js
import { Ecart, executer, npm, fichiersSuivis, lireTexte } from '../outils.mjs';

export default {
  numero: 2,
  titre: 'Rendu de la proposition',
  requiert: [1],              // facultatif : points lancés avant celui-ci (ici, l'installation)
  async verifier({ dossier, source, branche, commit }) {
    // dossier : le clone vierge. Lever un Ecart en cas d'écart ; son message est affiché tel quel.
    if (!ok) throw new Ecart('Le PDF n\'a aucune page.');
    return 'PDF de 4 pages, 4 PNG'; // le bilan affiché en cas de succès
  },
};
```

- `executer(commande, args, { cwd })` lance une commande et lève un `Ecart` si elle échoue.
- `npm(args, { cwd })` lance npm de façon portable (Mac, Linux, Windows).
- `fichiersSuivis(dossier)` rend les fichiers suivis par Git ; `lireTexte(dossier, chemin)` rend leur texte, ou `null` pour un binaire.
- Un point qui a besoin des dépendances déclare `requiert: [1]` : `npm run verifier-atelier -- 2` lance alors aussi l'installation.
