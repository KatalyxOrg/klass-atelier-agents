---
name: proposition-klass
description: Prépare une proposition commerciale Katalyx de bout en bout pour la Brûlerie Caravelle, à partir de sources/ - rédaction en Markdown, rendu PDF aux couleurs Klass, lecture des pages en images, notes de la grille par des juges isolés. À utiliser seulement quand l'associé l'appelle par son nom (/proposition-klass, ou $ dans T3 Code) ; quand il rédige son propre brief, on suit son brief.
---

# /proposition-klass

Le déroulé que nous suivons pour chaque proposition commerciale. L'associé peut ajouter après la commande son prénom et ce qui change cette fois (une offre en moins, une longueur, un ton) : `$ARGUMENTS`. Ce qu'il écrit là prime sur ce déroulé.

Le contexte permanent s'applique toujours : `CLAUDE.md` (source de vérité, portes à sens unique, charte) et `proposition/CLAUDE.md` (installation, forme du Markdown, rendu, Git).

## 1. Lire la source de vérité

Lis, dans cet ordre :
- `sources/client/brief-client.md` et `sources/client/notes-appel-2026-10-29.md` : ce que veut la cliente, ses chiffres, ses inquiétudes, ses dates ;
- `sources/client/fiche-client.md` : qui elle est, qui décide, son ton ;
- `sources/katalyx/offres.md` et `sources/katalyx/tarifs.md` : ce que nous vendons, à quel prix, en quels délais ;
- `sources/katalyx/references.md` : nos preuves ;
- `sources/propositions-passees/` : ce qui a fait gagner la première et perdre la seconde.

Un chiffre, un prix, une date ou un nom absent de ces fichiers ne s'invente pas : écris `[à demander : …]` et note-le pour l'associé.

## 2. Rédiger

Écris `proposition/<prénom>/proposition.md` (le prénom de l'associé ; s'il ne l'a pas donné, prends « brouillon » à la place). Le plan qui a gagné, dans cet ordre :
1. Ce que vous nous avez dit : le besoin, avec les mots et les chiffres de la cliente.
2. Ce que nous proposons, et ce que nous ne faisons pas.
3. Ce que vous y gagnez, en chiffres tirés des sources.
4. Le prix : un tableau par offre, le total HT et TTC, le prix ferme, les conditions.
5. Le calendrier : des dates, compatibles avec les délais des offres et la fermeture de fin d'année.
6. Pourquoi nous : les références proches, avec leurs résultats.
7. La prochaine étape, datée.

Trois pages au plus, au vouvoiement, sans jargon : la cliente nous a dit ne pas avoir compris la moitié des mots de la dernière proposition reçue.

## 3. Rendre et regarder

Depuis `proposition/` : `npm run rendre -- <prénom>/proposition.md`. Le script `proposition/outils/rendre.mjs` écrit `rendu/proposition.pdf` et une image par page, `rendu/page-1.png`, `page-2.png`…

Ouvre chaque image. Relève ce que la cliente verrait de travers : tableau coupé, titre seul en bas de page, texte qui déborde, page presque vide, plus de trois pages. Corrige le Markdown, puis rends à nouveau. Deux tours au plus : le quota de l'associé est limité.

## 4. Noter avec la grille

La grille est `proposition/grille-proposition.md`. Prends les trois dimensions marquées ★, sauf si l'associé en demande d'autres.

Pour chaque dimension, lance **un sous-agent distinct**, en parallèle, avec ce brief et rien d'autre :

> Tu notes **une seule dimension** d'une proposition commerciale que tu n'as pas vu rédiger. Voici la dimension et ses ancres : [colle ici la section de la grille]. Les pages, telles que la cliente les verra : [chemins des images]. Les sources utiles : [les fichiers indiqués pour la dimension]. Rends une note de 1 à 5, ou « Inconnu » si ce que tu as reçu ne suffit pas ; la phrase qui fonde ta note, avec sa page ; et ce qu'il faudrait changer pour gagner un point, en une phrase. Ne modifie aucun fichier.

Range les réponses dans `proposition/<prénom>/notes-grille.md`, au format du bas de la grille. Ne corrige pas la proposition d'après les notes sans l'accord de l'associé : c'est lui qui juge si une note dit vrai.

## 5. Rendre compte

Réponds à l'associé en quelques lignes : le chemin du PDF, le nombre de pages, les notes par dimension, et la liste des `[à demander : …]`.

Arrête-toi là. Envoyer la proposition à la cliente, la déposer sur un Drive ou annoncer le prix sont des portes à sens unique : c'est l'associé qui décide, et qui le fait.
