# Atelier Klass — Faire travailler des agents en confiance

Ce dossier est l'atelier d'un cours **Klass by Katalyx**. Les personnes qui y travaillent avec toi sont des associés de Katalyx. Ils produisent du contenu (propositions commerciales, plans, vidéos) et ne sont pour la plupart pas développeurs.

## Comment travailler avec eux

- Réponds en français, simplement, sans jargon technique. Quand tu lances une commande, dis en une phrase ce qu'elle fait et pourquoi.
- Ils ne tapent pas de commandes : c'est toi qui installes, rends les fichiers et utilises Git pour eux.
- Livre ce qui est demandé, au périmètre demandé. Si deux lectures de la demande mènent à des travaux très différents, pose la question avant de commencer.
- Si on te demande la page support, ouvre `index.html` dans le navigateur (`open index.html` sur Mac, `start index.html` sous Windows).

## Ne devine pas, va chercher dans `sources/`

`sources/` est la **source de vérité** de l'atelier : le client fictif (Brûlerie Caravelle), son brief, les notes d'appel, nos offres, nos tarifs, nos références et deux anciennes propositions. Son `README.md` dit où se trouve chaque chose.

Un chiffre, un prix, un nom, une date ou une référence vient de là. S'il n'y est pas, ne le complète pas avec une valeur plausible : écris qu'il manque et demande-le. Pourquoi : un chiffre inventé dans une proposition est exactement l'erreur qu'un client remarque, et c'est la réputation de l'associé qui est en jeu, pas la tienne.

## Les portes à sens unique : demande-moi avant

Tu travailles en Full access : tu peux tout faire dans ce dossier sans demander. Tout ce qui reste dans le dossier est une **porte à double sens** : Git permet de revenir en arrière, alors avance.

Certaines actions sortent du dossier et ne se rattrapent pas. Ce sont des **portes à sens unique**. Avant l'une d'elles, arrête-toi, dis ce que tu t'apprêtes à faire, et attends mon accord :

- **envoyer quelque chose au client** (une proposition, une vidéo, un lien) ;
- **publier** (réseaux sociaux, site, dépôt rendu public) ;
- **envoyer un e-mail** ou un message, quel que soit l'outil ;
- **modifier un Drive** ou tout autre document partagé à travers un connecteur ;
- **annoncer un prix** à quelqu'un hors de l'équipe.

Pourquoi : le retour en arrière de Git et de T3 Code n'annule pas un e-mail envoyé ni une publication. Ce n'est pas un manque de confiance, c'est du contexte : l'associé est responsable du résultat, il veut voir passer ces moments-là.

## La charte Klass

Tout ce qui se voit (page, PDF, vidéo) suit la charte du kit `klass/` (voir `klass/README.md`) :
- couleurs : encre `#0B0B0B`, orange `#E85431` (`#F06A49` sur fond sombre), papier `#F2F2F2` ;
- polices : *Bricolage Grotesque* pour les titres, *Schibsted Grotesk* pour le texte ;
- logo : les SVG de `klass/svg/`, sans le déformer ni le recolorer, la variante `-on-dark` sur fond sombre.

## L'organisation du dossier

| Chemin | Contenu |
|---|---|
| `index.html` | La page support de la séance |
| `sources/` | La source de vérité |
| `proposition/` | Le parcours Proposition, avec son propre `CLAUDE.md` |
| `video/` | Le parcours Vidéo, avec son propre `CLAUDE.md` |
| `klass/` | Le kit de la charte Klass |
| `outils/` | Les outils du formateur, dont `verifier-atelier` ; les associés n'en ont pas besoin |

## Git et les relectures

- **Pendant la séance**, chaque associé travaille sur sa branche nominative (par exemple `prenom/proposition` ou `prenom/video`), que tu crées au début de l'exercice 1. C'est son **brouillon parallèle** : il ne gêne personne.
- **En dehors de la séance**, on travaille directement sur `main`.
- Une **PR « relis-moi »** ne s'ouvre qu'avant une porte à sens unique, pour qu'un associé relise. Ouvre-la quand on te le demande, mais ne la fusionne pas : c'est la décision de l'associé qui relit.
- Les fichiers lourds (PDF finaux, MP4) ne vont pas dans Git : ils circulent par Drive ou Chat.

## Le vocabulaire de l'atelier

On dit **briefer** (donner à l'agent ce qu'un nouveau collaborateur brillant mais sans contexte aurait besoin de savoir), pas « prompter ». Les autres termes (**échelle de confiance**, **meat proxy**, **des yeux et une grille**, **porte à sens unique**, **brouillon parallèle**, **PR « relis-moi »**, **source de vérité**, **escalade brief → contexte permanent → skill**, **context not control**) sont expliqués dans `index.html`. Emploie-les tels quels.
