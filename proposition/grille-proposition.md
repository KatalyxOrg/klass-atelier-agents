# La grille Proposition

La grille sert à **noter une proposition commerciale** dimension par dimension. Elle donne à l'agent un critère concret pour juger son travail, au lieu d'un vague « c'est bien ».

Avec le rendu des pages en images (les **yeux**), elle forme **des yeux et une grille**.

## Comment on note

- **Un juge par dimension**, chacun dans un **contexte neuf** (un sous-agent ou un nouveau thread) qui n'a pas vu la conversation de l'auteur. Pourquoi : un juge qui a suivi la rédaction connaît les intentions de l'auteur et note ce qu'il a voulu écrire, pas ce que le client lira.
- Le juge reçoit **seulement** : sa dimension (le texte de sa section ci-dessous), les **images des pages** (`rendu/page-1.png`, `page-2.png`…), et les fichiers de `sources/` indiqués pour sa dimension. Il note ce que le client verra : les images, pas le Markdown.
- Il rend **une note de 1 à 5**, ou **« Inconnu »** quand ce qu'il a reçu ne suffit pas pour noter. « Inconnu » est une bonne réponse : une note devinée fausserait tout le reste.
- Il **cite le passage** sur lequel il fonde sa note (la page et la phrase), puis donne en une phrase ce qu'il faudrait changer pour gagner un point.
- Les ancres 1, 3 et 5 décrivent ce que vaut chaque note. Un 2 ou un 4 se place entre deux ancres.

**Pour la démo**, on n'en prend que trois, marquées ★ : un juge par dimension, c'est déjà trois sous-agents.

**Le calibrage.** Une bonne grille donne une meilleure note à l'ancienne proposition **gagnée** (`sources/propositions-passees/2025-03-fromagerie-dufresne-gagnee.md`) qu'à la **perdue** (`sources/propositions-passees/2026-05-domaine-trois-chenes-perdue.md`). Si ce n'est pas le cas pour une dimension, c'est la dimension qu'il faut réécrire, pas la proposition.

---

## 1. Compréhension du besoin ★

*Sources du juge : `sources/client/brief-client.md`, `sources/client/notes-appel-2026-10-29.md`.*

La proposition montre-t-elle que nous avons compris **ce que veut ce client-ci**, avec ses mots et ses chiffres ?

| Note | Ancre |
|---|---|
| **1** | Le besoin réel n'apparaît pas, ou la proposition répond à un autre besoin (par exemple, refaire la boutique alors que la cliente ne le veut pas). |
| **3** | Les demandes sont listées, mais en termes génériques : on ne retrouve ni les chiffres du client, ni ses inquiétudes. |
| **5** | Le besoin est repris avec les mots et les chiffres du client (abonnés, temps perdu, objectif), et ses inquiétudes (prix ferme, calendrier, jargon) trouvent une réponse. Ce qu'il ne veut pas est respecté. |

## 2. Valeur chiffrée

*Sources du juge : `sources/client/notes-appel-2026-10-29.md`, `sources/client/fiche-client.md`.*

Le client voit-il **ce qu'il y gagne**, en chiffres qui viennent de lui ?

| Note | Ancre |
|---|---|
| **1** | Aucun bénéfice chiffré, ou des chiffres absents des sources (« +200 % de conversion »). |
| **3** | Des bénéfices nommés, mais sans chiffre, ou avec un seul chiffre isolé. |
| **5** | Deux ou trois bénéfices chiffrés, tous tirés des sources ou calculés à partir d'elles (par exemple, le temps passé chaque mois sur une tâche, rapporté à l'année), et reliés à l'objectif du client. |

## 3. Preuves

*Sources du juge : `sources/katalyx/references.md`.*

La proposition prouve-t-elle que nous savons faire, avec des références **réelles et proches** du besoin ?

| Note | Ancre |
|---|---|
| **1** | Aucune référence, ou une référence absente de `sources/katalyx/references.md`, ou un résultat déformé. |
| **3** | Une référence exacte, mais éloignée du besoin ou sans résultat chiffré. |
| **5** | Une référence par grand volet du projet, chacune proche du métier ou du besoin du client, avec ses résultats chiffrés exacts et, si elle existe, la citation autorisée. |

## 4. Clarté du prix et du périmètre ★

*Sources du juge : `sources/katalyx/tarifs.md`, `sources/katalyx/offres.md`, `sources/client/notes-appel-2026-10-29.md`.*

Le client sait-il **exactement ce qu'il achète, et combien** ?

| Note | Ancre |
|---|---|
| **1** | Un prix global sans détail, ou « selon le périmètre final », ou un prix absent de `sources/katalyx/tarifs.md`. |
| **3** | Un prix détaillé par offre, mais un total faux, une mention HT ou TTC manquante, ou ce qui n'est pas compris passé sous silence. |
| **5** | Un tableau par offre, aux prix exacts des tarifs ; un total juste, HT avec le TTC ; le prix ferme et les conditions de paiement ; ce qui n'est **pas** compris est écrit. Le total se situe par rapport au budget du client. |

## 5. Prochaines étapes datées

*Sources du juge : `sources/client/brief-client.md`, `sources/client/notes-appel-2026-10-29.md`, `sources/katalyx/tarifs.md` (délais et fermeture).*

Le client sait-il **quoi faire, et quand** ? Le calendrier tient-il debout ?

| Note | Ancre |
|---|---|
| **1** | Aucune date, ou « le planning sera affiné plus tard ». |
| **3** | Des dates, mais un calendrier qui ne tient pas (délais des offres non respectés, fermeture de fin d'année oubliée), ou aucune prochaine étape pour le client. |
| **5** | Un calendrier daté, cohérent avec les délais des offres et la fermeture, qui tient les dates du client (lancement, décision) ; une prochaine étape simple, avec sa date. |

## 6. Ton et charte Klass ★

*Sources du juge : `sources/client/fiche-client.md` (le ton), `klass/README.md` (la charte). Ici, le juge lit surtout les images.*

La proposition parle-t-elle **comme le client aime qu'on lui parle**, et ressemble-t-elle à un document Klass ?

| Note | Ancre |
|---|---|
| **1** | Du jargon (« omnicanal », « data-driven », « solutions »), plus de place pour nous que pour le client, ou une mise en page hors charte (logo absent ou déformé, couleurs étrangères, texte qui déborde). |
| **3** | Un ton correct avec quelques mots creux, ou une mise en page propre avec un défaut visible (tableau coupé, titre seul en bas de page). |
| **5** | Clair, chaleureux, sans jargon, au vouvoiement ; le client est le sujet des phrases. Logo, couleurs et polices Klass ; aucun défaut de mise en page sur les images. |

## 7. Longueur

*Sources du juge : `sources/propositions-passees/2025-03-fromagerie-dufresne-gagnee.md` (le repère). Le juge compte les images.*

La longueur sert-elle la décision du client ?

| Note | Ancre |
|---|---|
| **1** | Plus de 6 pages, ou des pages entières sur nous (méthode, valeurs, équipe). |
| **3** | 4 à 6 pages, ou des répétitions et des paragraphes qui n'aident pas à décider. |
| **5** | 3 pages ou moins ; chaque section aide le client à décider. |

---

## Le fichier de notes

Les notes se rangent dans `notes-grille.md`, à côté de la proposition notée, une ligne par dimension :

| Dimension | Note | Passage cité (page) | Pour gagner un point |
|---|---|---|---|
| 1. Compréhension du besoin | 4 | « … » (p. 1) | … |
| 4. Clarté du prix et du périmètre | Inconnu | — | Ce qui manquait pour noter |
