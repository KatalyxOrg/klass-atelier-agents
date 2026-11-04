# Parcours Vidéo : une vidéo de 20 secondes pour la Brûlerie Caravelle

Ce dossier est celui du parcours Vidéo de l'atelier Klass. Tu y travailles avec un associé de Katalyx qui n'est pas développeur. Il te briefe ; toi, tu fabriques la vidéo avec le projet Remotion qui est déjà prêt ici. Ce fichier s'ajoute au `CLAUDE.md` de la racine : la charte Klass, les portes à sens unique et la règle « ne devine pas » y sont déjà.

## Ce qu'on fabrique

Une vidéo de **20 secondes** qui présente la Brûlerie Caravelle (le client fictif de l'atelier) et annonce son abonnement. Elle sera diffusée sur Instagram et sur l'écran des boutiques, qui ont déjà leur propre musique : donc **ni voix, ni musique**. Le sens passe par le texte, la couleur, le mouvement et le rythme.

## Va chercher dans `sources/`

Tout ce que la vidéo affirme vient de `sources/`, jamais de ta mémoire ni d'une valeur plausible. Pour cette vidéo, on lit surtout :

- `sources/client/fiche-client.md` : qui est la Brûlerie Caravelle, ses chiffres, son ton, ses produits ;
- `sources/client/notes-appel-2026-10-29.md` : la section « La vidéo » dit ce que la cliente veut, et ce qui compte pour Hugo (on doit voir que le café est torréfié à Nantes) ;
- `sources/client/brief-client.md` : la demande d'origine.

Quand un chiffre, un nom ou une date manque, écris le texte sans lui et dis à l'associé qu'il manque, en une phrase : il décidera. Pourquoi : un chiffre inventé dans une vidéo qui part chez le client, c'est la réputation de l'associé.

Cette vidéo s'adresse aux clients de la brûlerie, pas à la brûlerie. **Les tarifs de Katalyx n'y figurent donc jamais**, et aucune photo n'existe dans `sources/` : on n'en invente pas, la vidéo se compose de texte, de couleurs, de formes et du logo Klass.

## Le projet de départ

Le projet Remotion est prêt : dépendances déclarées, kit Klass branché, composition de 20 secondes qui tourne déjà. **Tu modifies la composition, tu ne reconstruis pas le projet.** Pourquoi : l'associé travaille avec un abonnement Claude Pro, et chaque boucle courte compte.

| Fichier | À quoi il sert |
|---|---|
| `src/contenu.js` | Le contenu : les scènes, leur durée, leurs textes, le format de l'image. **On commence par là.** |
| `src/Presentation.jsx` | La mise en page : couleurs, polices, animations, logo. On le modifie quand le brief demande autre chose que du texte provisoire. |
| `src/Racine.jsx` | La déclaration de la composition `Presentation` (20 s, 30 images par seconde). On n'y touche pas, sauf pour changer le format. |
| `scripts/` | Les scripts de rendu et de planche contact. On n'y touche pas. |

- Le format de départ est **vertical, 1080 × 1920** (Instagram). Les formats carré et horizontal existent dans l'offre de Katalyx : on ne les produit que si le brief les demande, en changeant `FORMAT` dans `src/contenu.js`.
- La somme des durées des scènes fait **20 secondes**, à 30 images par seconde.
- Reste dans `video/src/`. N'ajoute pas de dépendance, ne modifie pas `klass/` ni `sources/`.
- Les polices (*Bricolage Grotesque* pour les titres, *Schibsted Grotesk* pour le texte), les couleurs et le logo viennent du kit `klass/` : le projet les charge déjà. Sur fond sombre : le logo `-on-dark` et l'orange `#F06A49`.

## Installer

Il faut Node.js (version 20 ou plus récente) et ffmpeg sur l'ordinateur. Le check d'environnement de l'accueil de la séance les installe ; s'il en manque un, dis-le à l'associé en une phrase, sans improviser une autre installation.

Depuis ce dossier `video/`, deux commandes, identiques sur Mac et sous Windows :

1. `npm ci` installe les dépendances aux versions exactes fixées par `package-lock.json` (Remotion et React). Compte environ une minute.
2. `npm run navigateur` télécharge le **navigateur intégré** de Remotion (environ 120 Mo), celui qui dessine les images de la vidéo. Sans lui, le premier rendu s'arrête pour le télécharger. On le fait une fois pour toutes, pendant la présentation de la séance plutôt qu'au moment de l'exercice.

Ces deux commandes n'écrivent rien dans les fichiers suivis par Git (les dossiers `node_modules/` et `out/` sont ignorés).

## Les yeux : rendre, puis regarder

- `npm run rendre` rend la composition en `out/video.mp4`. Le rendu complet dure environ une minute ; le premier est plus long. Regroupe tes modifications pour ne pas rendre à chaque détail.
- `npm run planche` fabrique `out/planche-contact.png`, **la planche contact** : une seule image de 10 vignettes, une toutes les 2 secondes, lues de gauche à droite puis de haut en bas. La case 1 est à 1 s, la case 2 à 3 s, la case 3 à 5 s… la case 10 à 19 s.
- Quand tu rends la vidéo, génère aussi la planche et ouvre l'image : c'est ainsi que tu vois ton travail, comme un monteur qui lit sa planche. Décris ce que tu y vois (texte coupé, texte illisible, logo mal placé, scène vide, deux scènes identiques à la suite) et corrige à partir de ces observations.
- Ne lance pas `npm run studio` : il ouvre une interface interactive dont l'associé n'a pas besoin ici.
- Le MP4 et la planche restent dans `out/`, **hors de Git** : les rendus finaux circulent par Drive ou Chat. Pour montrer la vidéo à l'associé, ouvre le fichier `out/video.mp4` avec le lecteur de l'ordinateur.

## Une grille, notée par des juges séparés

`grille-video.md` donne les critères de la vidéo : quatre dimensions (lisibilité, charte, rythme, message), chacune notée 1, 3 ou 5 avec une ancre qui dit à quoi ressemble chaque note. Quand le brief la mentionne, **vise les ancres 5 dès la composition**.

Pour la noter, on ne s'en remet pas à la même tête qui a fabriqué la vidéo : chaque dimension que le brief demande est notée par **un juge séparé**, c'est-à-dire un sous-agent au contexte neuf à qui tu donnes uniquement la planche contact, la dimension à noter et ses ancres (pour le rythme, aussi la liste des scènes de `src/contenu.js`). Il répond par une note ou par « Inconnu », et cite les cases de la planche qui justifient sa réponse. Tu lui donnes ces éléments, jamais ton raisonnement. Tu ne lances pas d'autre sous-agent : l'associé a un quota limité.

Tu corriges d'après les notes et leurs citations, avec un budget fixe : **une boucle de correction**, sauf si l'associé en demande une autre. Garde les notes dans le message de PR ou dans ta réponse, pas dans des fichiers du dépôt.

## Git et les portes à sens unique

- Pendant la séance, tu travailles sur la branche nominative de l'associé (`prenom/video`) : tu la crées au début de l'exercice 1, à partir de `main`. Demande-lui son prénom si tu ne le connais pas.
- Les rendus lourds (MP4, planche) ne vont **jamais** dans Git. Une PR « relis-moi » contient les sources (`src/`) ; sa description dit où se trouve le MP4 (« chez moi, je le passe par Chat ») et rappelle les notes de la grille.
- Une PR « relis-moi » s'ouvre à la demande de l'associé, avant une porte à sens unique. Tu ne la fusionnes pas : la décision revient à la personne qui relit.
- **Rien n'est envoyé au client, publié ni posté par toi** : ni la vidéo, ni un lien, ni un message. Tu t'arrêtes, tu dis ce qui est prêt, et l'associé décide. La vidéo « part chez le client demain » : elle n'est pas partie.
