# Grille Vidéo

Les critères de la vidéo de 20 secondes de la Brûlerie Caravelle. Elle compte **quatre dimensions** : lisibilité, charte, rythme, message. Chacune est notée **1, 3 ou 5**, et une ancre dit à quoi ressemble chaque note.

| Note | Sens |
|---|---|
| **5** | Prête : on peut la montrer à la cliente |
| **3** | Acceptable, mais un défaut précis à corriger |
| **1** | À refaire : le défaut gêne la compréhension |

Quand on ne peut pas répondre avec ce qu'on a sous les yeux, la réponse est **Inconnu**. Elle vaut mieux qu'une note devinée : elle dit ce qu'il manque.

## Qui note, avec quoi

Chaque dimension est notée par **un juge séparé** : un sous-agent au contexte neuf. Il ne connaît ni le brief, ni le raisonnement de celui qui a fabriqué la vidéo. Il reçoit seulement :

- la **planche contact** (`out/planche-contact.png`) : 10 vignettes, une toutes les 2 secondes, lues de gauche à droite puis de haut en bas (case 1 à 1 s, case 2 à 3 s… case 10 à 19 s) ;
- la **dimension** à noter, avec ses trois ancres ;
- les **pièces propres à la dimension**, indiquées ci-dessous.

Il répond dans cette forme :

```
Dimension : <nom>
Note : 1, 3, 5 ou Inconnu
Cases citées : <les numéros de cases et, pour chacune, ce qu'on y lit ou ce qu'on y voit>
Raison : <deux phrases au plus>
```

Une note sans case citée n'est pas recevable. La planche ne montre que des images fixes : tout ce qui dépend du mouvement (une entrée en fondu, une vitesse) se note **Inconnu**.

## 1. Lisibilité

*Un texte se lit-il d'un coup d'œil sur un téléphone ?* Pièces : la planche seule.

| Note | Ancre |
|---|---|
| **1** | Du texte est coupé par le bord de l'image, ou trop petit pour être lu dans sa vignette, ou gris sur fond sombre : on ne comprend pas ce que dit au moins une scène. |
| **3** | Tout se lit, mais au prix d'un effort dans au moins une case : une phrase de plus de 12 mots, un texte tout près d'un bord, deux textes de taille presque égale qui se concurrencent. |
| **5** | Dans chaque case, le texte se lit d'un coup d'œil, avec un contraste net et des marges. Une scène porte une seule idée, en 12 mots au plus. |

## 2. Charte

*La vidéo suit-elle la charte Klass ?* Pièces : la planche et les règles de la charte (`klass/README.md`).

| Note | Ancre |
|---|---|
| **1** | Des couleurs hors charte (un autre orange, un dégradé multicolore), ou une police de système, ou un logo absent, déformé, recoloré, ou en version claire sur fond sombre. |
| **3** | La palette et les polices sont reconnaissables, avec un écart : un logo très petit ou collé au bord, un titre dans la police du texte, un orange trop sombre sur le fond sombre. |
| **5** | Seulement l'encre, l'orange, le papier et le blanc. Titres dans la police de titre de la charte, texte dans sa police de texte. Le logo `-on-dark` est entier, non déformé, avec de l'espace autour, et présent de la même façon dans toutes les cases. |

## 3. Rythme

*Le temps est-il bien réparti sur les 20 secondes ?* Pièces : la planche et la liste des scènes avec leur durée (`src/contenu.js`).

| Note | Ancre |
|---|---|
| **1** | La vidéo ne fait pas 20 secondes, ou une scène dure plus de 10 secondes, ou quatre cases qui se suivent sont identiques (plus de 6 secondes sans rien de neuf) : le temps n'est pas travaillé. |
| **3** | La vidéo fait 20 secondes et les scènes se distinguent, mais une scène est trop courte pour son texte (moins d'une seconde pour 3 mots), ou la première case ne dit pas encore de quoi on parle, ou la fin s'étire sans rien ajouter. |
| **5** | 20 secondes exactement. Chaque scène dure assez pour que son texte se lise à voix basse (au moins une seconde pour 3 mots) et apporte une idée neuve par rapport à la précédente. La première case pose le sujet, la dernière clôt. |

## 4. Message

*La vidéo dit-elle ce que la cliente veut qu'elle dise ?* Pièces : la planche, le point « La vidéo » de la section « Ce qu'ils veulent » dans `sources/client/notes-appel-2026-10-29.md` et `sources/client/fiche-client.md`.

| Note | Ancre |
|---|---|
| **1** | On ne comprend pas qui est la brûlerie, ou l'abonnement n'est pas annoncé. Ou la vidéo contient un chiffre, un nom ou un prix qu'on ne trouve pas dans les sources (par exemple un tarif de Katalyx). |
| **3** | On comprend qui parle et ce qui est annoncé, mais un des deux reste vague : le café « torréfié à Nantes », demandé par Hugo, n'apparaît pas, ou le ton s'éloigne de la fiche client (jargon, « solutions »). |
| **5** | En 20 secondes, on sait **qui** (la Brûlerie Caravelle, à Nantes), **ce qui la distingue** (torréfié à Nantes) et **ce qui est annoncé** (l'abonnement), puis **quoi faire** ensuite. Chaque chiffre et chaque nom se retrouve dans les sources, dans le ton chaleureux et précis de la fiche. |

## Lire les résultats

La cible est **5 sur les quatre dimensions**. Un **3** appelle une correction précise, citée par le juge. Un **Inconnu** n'est pas une mauvaise note : on donne au juge la pièce qui lui manquait, ou un humain regarde à sa place la partie que la planche ne montre pas.

Attention à un piège : à force de corriger pour la grille, on finit par optimiser la grille et non la vidéo. Un humain regarde donc la vidéo elle-même, de temps en temps, avant qu'elle parte.
