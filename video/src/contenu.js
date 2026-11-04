// Le contenu de la vidéo : c'est le fichier à modifier en priorité.
// La mise en page est dans Presentation.jsx.

// Format de la vidéo. Vertical (1080 × 1920) pour Instagram.
// Pour un format carré : 1080 × 1080. Pour les écrans : 1920 × 1080.
export const FORMAT = {
  largeur: 1080,
  hauteur: 1920,
  fps: 30,
  secondes: 20,
};

// Les scènes se suivent. La somme de leurs durées doit faire FORMAT.secondes.
// Aujourd'hui : 5 scènes de 4 secondes, avec un texte provisoire à remplacer.
export const SCENES = [
  { secondes: 4, titre: 'Scène 1', texte: 'Texte provisoire : à remplacer' },
  { secondes: 4, titre: 'Scène 2', texte: 'Texte provisoire : à remplacer' },
  { secondes: 4, titre: 'Scène 3', texte: 'Texte provisoire : à remplacer' },
  { secondes: 4, titre: 'Scène 4', texte: 'Texte provisoire : à remplacer' },
  { secondes: 4, titre: 'Scène 5', texte: 'Texte provisoire : à remplacer' },
];
