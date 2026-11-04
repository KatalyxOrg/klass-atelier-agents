# Illustrations de la page support

Les vrais rendus de l'atelier, allégés pour la page `index.html`. Ils viennent **uniquement** de la proposition d'exemple et de la vidéo de départ, telles qu'elles sont sur `main` : jamais de la branche de démo `demo/proposition-notee`, pour garder sa révélation pendant la séance.

| Fichier | D'où il vient |
|---|---|
| `proposition-exemple-page-1.jpg` à `-3.jpg` | Les pages de `proposition/exemple/proposition.md`, rendues par `proposition/outils/rendre.mjs`, réduites à 620 px de large. |
| `video-depart-planche-contact.jpg` | La planche contact de la vidéo de départ (`video/`, avant tout brief), produite par `npm run rendre` puis `npm run planche`, réduite à 900 px de large. |

Pour les refaire après un changement de la proposition d'exemple ou de la vidéo de départ, demandez à l'agent : rendre l'exemple et la vidéo de départ, puis réduire les images avec ffmpeg aux mêmes largeurs et aux mêmes noms. Les schémas, eux, sont dessinés en SVG directement dans `index.html`.
