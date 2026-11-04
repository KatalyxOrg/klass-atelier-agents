import { Composition } from 'remotion';
import { Presentation } from './Presentation.jsx';
import { FORMAT } from './contenu.js';

// La composition « Presentation » dure 20 secondes : 600 images à 30 images par seconde.
export const Racine = () => (
  <Composition
    id="Presentation"
    component={Presentation}
    durationInFrames={FORMAT.secondes * FORMAT.fps}
    fps={FORMAT.fps}
    width={FORMAT.largeur}
    height={FORMAT.hauteur}
  />
);
