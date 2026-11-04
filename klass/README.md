# Kit Klass

La charte de Klass by Katalyx, copiée pour ce dépôt. Elle s'applique à la page support, au PDF de la proposition et à la vidéo.

## Les règles

- **Couleurs** (celles de katalyx.fr) : encre `#0B0B0B`, orange `#E85431` (sur fond sombre : `#F06A49`), papier `#F2F2F2`, blanc `#FFFFFF`. Les variables sont dans `brand.css` : `--klass-ink`, `--klass-orange`, `--klass-paper`…
- **Polices** : *Bricolage Grotesque* pour les titres, *Schibsted Grotesk* pour le texte. Les fichiers sont dans `polices/` (licence SIL Open Font License 1.1), déclarés par `polices.css`.
- **Logo** : toujours le SVG si l'outil l'accepte.
  - Couverture, page de titre : `svg/klass-lockup.svg` (sur fond sombre : `svg/klass-lockup-on-dark.svg`).
  - En-tête, pied de page, barre de navigation : `svg/klass-lockup-compact.svg` (ou `-on-dark`).
  - Symbole seul : `svg/klass-symbol.svg` ; icône et favicon : `svg/klass-app-icon.svg`, `favicon.ico`.
  - Des PNG de secours sont dans `png/`.
- **Zone de protection** : autour du logo, un espace vide d'au moins la moitié de la hauteur du symbole.
- **Tailles minimales** : lockup complet à 32 px de haut au moins (en dessous, prendre le lockup compact) ; symbole à 16 px au moins.
- **À ne pas faire** : déformer le logo, recolorer le « _ » autrement qu'en orange, poser la version claire sur un fond sombre, ajouter une ombre ou un contour.

## En HTML

```html
<link rel="icon" href="klass/favicon.ico">
<link rel="stylesheet" href="klass/brand.css">
<link rel="stylesheet" href="klass/polices.css">
<img src="klass/svg/klass-lockup.svg" alt="Klass by Katalyx" height="48">
```

Ces fichiers viennent de la charte maîtresse de Klass : on ne les modifie pas ici.
