# Parcours Proposition

Ici, on rédige des **propositions commerciales** pour la Brûlerie Caravelle, on les rend en PDF aux couleurs Klass, et on les note avec une grille. Le CLAUDE.md de la racine s'applique aussi : `sources/` est la source de vérité, et les portes à sens unique demandent l'accord de l'associé.

## Ce qu'il y a dans ce dossier

| Chemin | Contenu |
|---|---|
| `exemple/proposition.md` | Une proposition d'exemple pour la Brûlerie Caravelle. Elle montre la mise en forme que le rendu comprend. |
| `outils/rendre.mjs` | Le rendu : Markdown → PDF A4 Klass → une image PNG par page. |
| `grille-proposition.md` | La grille : 7 dimensions notées de 1 à 5, avec leurs ancres. |
| `<prénom>/proposition.md` | La proposition d'un associé, sur sa branche (par exemple `camille/proposition.md`). |

## Installer (une fois par ordinateur)

L'associé ne tape aucune commande : c'est toi qui installes. Dans `proposition/`, lance `npm install`. Il faut Node.js 20 ou plus récent.

L'installation télécharge aussi le **navigateur intégré** du rendu, un Chrome sans fenêtre fourni par Playwright (environ 120 Mo). Il sert à produire le PDF puis les images des pages, et ne remplace pas le Chrome de l'associé. Le téléchargement est le même sur Mac et sous Windows. S'il a échoué, relance-le avec `npx playwright install --only-shell chromium` depuis `proposition/`. On n'utilise pas Poppler (`pdftoppm`) : il est absent par défaut sur Mac et sous Windows.

## Rédiger

- Une nouvelle proposition se rédige dans `proposition/<prénom>/proposition.md`, à partir de `sources/`. Ne pars pas du texte de l'exemple : on noterait alors l'exemple, et pas ce que l'associé a briefé. Il sert seulement à voir la forme.
- La forme que le rendu comprend : un titre `#`, les lignes **Pour**, **De** et **Objet**, des sections `##`, des listes et des tableaux. Dans un tableau, `---:` aligne une colonne de montants à droite. N'ajoute ni logo, ni couleurs, ni polices : le rendu pose la charte Klass.
- Les prix viennent de `sources/katalyx/tarifs.md`, toujours hors taxes, avec le total TTC. Une information absente des sources s'écrit `[à demander : …]` dans le texte, et tu le signales à l'associé : c'est lui qui la demandera.
- Tiens la longueur que donne le brief ; à défaut, trois pages. La proposition gagnée de `sources/propositions-passees/` en faisait trois ; la perdue, quatorze.

## Les yeux : rendre et regarder

Depuis `proposition/` : `npm run rendre -- <prénom>/proposition.md`. Le rendu prend quelques secondes et écrit, à côté de la proposition, un dossier `rendu/` avec `proposition.pdf` et `page-1.png`, `page-2.png`…

Ouvre ensuite les images : c'est exactement ce que la cliente verra. Un tableau coupé, un titre seul en bas de page, un texte qui déborde ne se voient que là. Corrige la source Markdown, jamais le PDF, puis rends à nouveau.

Les associés sont sur Claude Pro, avec un quota limité : garde les boucles courtes. Au plus deux tours « rendre, regarder, corriger », puis montre le résultat à l'associé.

## La grille

`grille-proposition.md` explique comment noter : **un juge par dimension**, chacun dans un contexte neuf (un sous-agent), qui ne reçoit que sa dimension, les images des pages et les sources indiquées, et qui cite le passage ou répond « Inconnu ». Les notes vont dans `<prénom>/notes-grille.md`.

Ne note que les dimensions que l'associé demande. Sans précision, prends les trois marquées ★ : chaque juge coûte du quota.

## Git, Drive et la PR « relis-moi »

- Le dossier `rendu/` n'entre pas dans Git : le PDF final circule par Drive ou Chat, et c'est l'associé qui l'envoie. Envoyer une proposition au client est une porte à sens unique.
- Dans Git, on garde la source (`proposition.md`) et les notes (`notes-grille.md`).
- Une PR « relis-moi » s'ouvre vers `main` quand la proposition part bientôt chez le client. Sa description dit à l'associé qui relit ce qui part, quand, et ce sur quoi on veut son avis. Ne la fusionne pas : c'est la décision de celui qui relit.
