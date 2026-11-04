import { AbsoluteFill, Img, Sequence, interpolate, useCurrentFrame, useVideoConfig, continueRender, delayRender } from 'remotion';
import { useEffect, useState } from 'react';
import { SCENES } from './contenu.js';
import logoSombre from '../../klass/svg/klass-lockup-on-dark.svg';
import bricolage from '../../klass/polices/BricolageGrotesque.ttf';
import schibsted from '../../klass/polices/SchibstedGrotesk.ttf';

// Charte Klass (voir klass/README.md).
const COULEURS = { encre: '#0B0B0B', orange: '#F06A49', blanc: '#FFFFFF' };
const TITRES = '"Bricolage Grotesque", system-ui, sans-serif';
const TEXTES = '"Schibsted Grotesk", system-ui, sans-serif';

// Attend que les polices de la charte soient chargées avant de dessiner la première image.
const usePolices = () => {
  const [attente] = useState(() => delayRender('Chargement des polices Klass'));
  useEffect(() => {
    const polices = [
      new FontFace('Bricolage Grotesque', `url(${bricolage})`, { weight: '200 800' }),
      new FontFace('Schibsted Grotesk', `url(${schibsted})`, { weight: '400 900' }),
    ];
    Promise.all(polices.map((p) => p.load())).then((chargees) => {
      chargees.forEach((p) => document.fonts.add(p));
      continueRender(attente);
    });
  }, [attente]);
};

const Scene = ({ titre, texte, numero, total }) => {
  const image = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const entree = interpolate(image, [0, fps / 2], [0, 1], { extrapolateRight: 'clamp' });
  const sortie = interpolate(image, [durationInFrames - fps / 3, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacite = Math.min(entree, sortie);
  return (
    <AbsoluteFill style={{ background: COULEURS.encre, color: COULEURS.blanc, padding: 96, justifyContent: 'center' }}>
      <div style={{ opacity: opacite, transform: `translateY(${(1 - entree) * 40}px)` }}>
        <div style={{ fontFamily: TEXTES, fontSize: 40, fontWeight: 600, color: COULEURS.orange, letterSpacing: 4 }}>
          {numero} / {total}
        </div>
        <h1 style={{ fontFamily: TITRES, fontSize: 150, fontWeight: 800, lineHeight: 1.05, margin: '24px 0' }}>{titre}</h1>
        <p style={{ fontFamily: TEXTES, fontSize: 56, lineHeight: 1.3, margin: 0, maxWidth: 800 }}>{texte}</p>
      </div>
    </AbsoluteFill>
  );
};

export const Presentation = () => {
  usePolices();
  const { fps } = useVideoConfig();
  let debut = 0;
  return (
    <AbsoluteFill style={{ background: COULEURS.encre }}>
      {SCENES.map((scene, i) => {
        const duree = Math.round(scene.secondes * fps);
        const de = debut;
        debut += duree;
        return (
          <Sequence key={i} from={de} durationInFrames={duree}>
            <Scene {...scene} numero={i + 1} total={SCENES.length} />
          </Sequence>
        );
      })}
      <Img src={logoSombre} style={{ position: 'absolute', left: 96, bottom: 96, height: 72 }} />
    </AbsoluteFill>
  );
};
