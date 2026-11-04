/* Klass by Katalyx — mécanique des pages support d'atelier (avec page.css).
 *
 * - Une étape affichée à la fois : chaque <section class="etape" id="…" data-court="…">
 *   de <main> ; la frise des étapes est fabriquée dans [data-frise]. Une <section class="annexe">
 *   s'affiche de la même façon, sans numéro dans la frise.
 * - Le sélecteur de parcours : les boutons [data-choix-parcours="<clé>"] (ou "tous") masquent
 *   les éléments [data-parcours] des autres parcours. Le choix est retenu dans le navigateur.
 * - Deux modes : lecture, et présentation (fond encre, une vue à la fois). Chaque <div class="bloc">
 *   d'une étape est une vue ; la présentation n'en garde que h3, figure, ul.cles et .pres.
 *   Le bouton [data-bouton-mode] ou la touche P bascule ; Échap revient à la lecture.
 * - Flèches du clavier : la vue suivante (présentation) ou l'étape suivante (lecture).
 * - Paramètres d'adresse, pratiques pour partager une vue : ?mode=presentation, ?parcours=video,
 *   ?diapo=3, suivis de l'ancre de l'étape (#verification).
 */
(() => {
  'use strict';

  const racine = document.documentElement;
  racine.classList.add('js');
  const parametres = new URLSearchParams(location.search);

  // Le stockage peut manquer (navigation privée, réglages) : la page marche sans lui.
  const memoire = (zone) => ({
    lire(cle) { try { return window[zone].getItem(cle); } catch { return null; } },
    ecrire(cle, valeur) { try { window[zone].setItem(cle, valeur); } catch { /* sans mémoire */ } },
  });
  const local = memoire('localStorage');
  const session = memoire('sessionStorage');
  const CLE_PARCOURS = 'klass-page:parcours';
  const CLE_MODE = 'klass-page:mode';

  const pages = [...document.querySelectorAll('main section.etape, main section.annexe')];
  const etapes = pages.filter((s) => s.classList.contains('etape'));
  if (pages.length === 0) return;

  const titreDe = (section) => section.dataset.court || section.querySelector('h2')?.textContent.trim() || section.id;
  const numeroDe = (section) => (etapes.includes(section) ? String(etapes.indexOf(section) + 1) : '');

  // ── La frise ──────────────────────────────────────────────────────────
  const frise = document.querySelector('[data-frise]');
  const liensFrise = new Map();
  if (frise) {
    const liste = document.createElement('ol');
    for (const section of pages) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${section.id}`;
      if (etapes.includes(section)) {
        a.innerHTML = `<span class="num"></span><span class="nom"></span>`;
        a.querySelector('.num').textContent = numeroDe(section);
        a.title = `${numeroDe(section)}. ${titreDe(section)}`;
      } else {
        li.className = 'annexe';
        a.innerHTML = `<span class="nom"></span>`;
      }
      a.querySelector('.nom').textContent = titreDe(section);
      li.append(a);
      liste.append(li);
      liensFrise.set(section, a);
    }
    frise.append(liste);
  }

  // Le numéro dans l'en-tête de chaque étape
  for (const section of etapes) {
    const numero = section.querySelector('.entete-etape .numero');
    if (numero && !numero.textContent.trim()) numero.textContent = numeroDe(section);
  }

  // ── Le pied de chaque étape : précédente, suivante ────────────────────
  pages.forEach((section, i) => {
    const suite = document.createElement('nav');
    suite.className = 'suite';
    suite.setAttribute('aria-label', 'Étapes voisines');
    const lien = (cible, classe, texte) => {
      const a = document.createElement('a');
      a.href = `#${cible.id}`;
      a.className = classe;
      a.textContent = texte;
      suite.append(a);
    };
    const nom = (s) => (numeroDe(s) ? `${numeroDe(s)}. ${titreDe(s)}` : titreDe(s));
    if (pages[i - 1]) lien(pages[i - 1], 'precedente', `← ${nom(pages[i - 1])}`);
    if (pages[i + 1]) lien(pages[i + 1], 'suivante', `${nom(pages[i + 1])} →`);
    section.append(suite);
  });

  // ── Le parcours ───────────────────────────────────────────────────────
  const boutonsParcours = [...document.querySelectorAll('[data-choix-parcours]')];
  const parcoursConnus = new Set(boutonsParcours.map((b) => b.dataset.choixParcours));

  function appliquerParcours(choix) {
    if (!parcoursConnus.has(choix)) choix = 'tous';
    racine.dataset.parcours = choix;
    for (const el of document.querySelectorAll('[data-parcours]')) {
      el.classList.toggle('hors-parcours', choix !== 'tous' && el.dataset.parcours !== choix);
    }
    for (const b of boutonsParcours) b.setAttribute('aria-pressed', String(b.dataset.choixParcours === choix));
  }

  // ── Affichage d'une étape, et de la vue courante en présentation ──────
  let courante = null;
  let vue = 0;
  const enPresentation = () => racine.classList.contains('presentation');
  const vuesDe = (section) => [...section.querySelectorAll(':scope > .bloc')].filter((b) => !b.classList.contains('hors-parcours'));

  const compteur = document.createElement('div');
  compteur.className = 'commandes-diapo';
  compteur.innerHTML = '<button type="button" data-aller="-1" aria-label="Vue précédente">‹</button><span class="compteur" aria-live="polite"></span><button type="button" data-aller="1" aria-label="Vue suivante">›</button>';
  document.body.append(compteur);
  compteur.addEventListener('click', (e) => {
    const bouton = e.target.closest('[data-aller]');
    if (bouton) aller(Number(bouton.dataset.aller));
  });

  function majVue() {
    const vues = vuesDe(courante);
    vue = Math.max(0, Math.min(vue, vues.length - 1));
    for (const b of courante.querySelectorAll(':scope > .bloc')) b.classList.remove('courant');
    if (vues[vue]) vues[vue].classList.add('courant');
    const total = vues.length || 1;
    compteur.querySelector('.compteur').textContent = `${numeroDe(courante) ? `${numeroDe(courante)}. ` : ''}${titreDe(courante)} · ${vue + 1} / ${total}`;
  }

  function afficher(section, { vue: n = 0, cible = null, defiler = true } = {}) {
    const change = section !== courante;
    courante = section;
    vue = n;
    for (const p of pages) p.classList.toggle('active', p === section);
    const index = pages.indexOf(section);
    pages.forEach((p, i) => {
      const a = liensFrise.get(p);
      if (!a) return;
      a.classList.toggle('vue', i < index);
      if (p === section) a.setAttribute('aria-current', 'step');
      else a.removeAttribute('aria-current');
    });
    liensFrise.get(section)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    if (enPresentation()) {
      if (cible) {
        const bloc = cible.closest('.bloc');
        const i = vuesDe(section).indexOf(bloc);
        if (i >= 0) vue = i;
      }
      majVue();
      if (defiler) window.scrollTo(0, 0);
    } else if (defiler) {
      if (cible && cible !== section) cible.scrollIntoView();
      else if (change || !cible) window.scrollTo(0, 0);
    }
  }

  function sectionDepuisAncre() {
    const id = decodeURIComponent(location.hash.slice(1));
    const cible = id ? document.getElementById(id) : null;
    const section = cible?.closest('section.etape, section.annexe') ?? pages[0];
    return { section, cible };
  }

  function marquerAncre(section) {
    if (location.hash !== `#${section.id}`) history.replaceState(null, '', `${location.pathname}${location.search}#${section.id}`);
  }

  function aller(sens) {
    const i = pages.indexOf(courante);
    if (enPresentation()) {
      const vues = vuesDe(courante);
      if (vue + sens >= 0 && vue + sens < vues.length) {
        vue += sens;
        majVue();
        window.scrollTo(0, 0);
        return;
      }
      const autre = pages[i + sens];
      if (!autre) return;
      afficher(autre, { vue: sens > 0 ? 0 : Math.max(0, vuesDe(autre).length - 1) });
      marquerAncre(autre);
      return;
    }
    const autre = pages[i + sens];
    if (!autre) return;
    afficher(autre);
    marquerAncre(autre);
  }

  // ── Les deux modes ────────────────────────────────────────────────────
  const boutonsMode = [...document.querySelectorAll('[data-bouton-mode]')];

  function appliquerMode(mode) {
    const presentation = mode === 'presentation';
    let depuis = 0;
    if (presentation && courante && !enPresentation()) {
      // On présente à partir de la vue que l'on était en train de lire.
      vuesDe(courante).forEach((b, i) => { if (b.getBoundingClientRect().top < window.innerHeight * 0.4) depuis = i; });
    }
    racine.classList.toggle('presentation', presentation);
    session.ecrire(CLE_MODE, presentation ? 'presentation' : 'lecture');
    for (const b of boutonsMode) {
      b.setAttribute('aria-pressed', String(presentation));
      const libelle = b.querySelector('[data-libelle]');
      if (libelle) libelle.textContent = presentation ? 'Lecture' : 'Présenter';
    }
    if (!courante) return;
    if (presentation) {
      vue = depuis;
      majVue();
      window.scrollTo(0, 0);
    } else {
      const bloc = vuesDe(courante)[vue];
      if (bloc && vue > 0) bloc.scrollIntoView();
      else window.scrollTo(0, 0);
    }
  }

  // ── Démarrage ─────────────────────────────────────────────────────────
  const parcoursDemande = parametres.get('parcours');
  if (parcoursDemande && parcoursConnus.has(parcoursDemande)) local.ecrire(CLE_PARCOURS, parcoursDemande);
  appliquerParcours(parcoursDemande || local.lire(CLE_PARCOURS) || 'tous');

  const modeDemande = parametres.get('mode') || session.lire(CLE_MODE);
  racine.classList.toggle('presentation', modeDemande === 'presentation');
  appliquerMode(modeDemande === 'presentation' ? 'presentation' : 'lecture');

  const depart = sectionDepuisAncre();
  const diapo = Math.max(0, (Number(parametres.get('diapo')) || 1) - 1);
  afficher(depart.section, { vue: diapo, cible: depart.cible, defiler: Boolean(depart.cible) });

  window.addEventListener('hashchange', () => {
    const { section, cible } = sectionDepuisAncre();
    afficher(section, { cible });
  });

  for (const b of boutonsParcours) {
    b.addEventListener('click', () => {
      local.ecrire(CLE_PARCOURS, b.dataset.choixParcours);
      appliquerParcours(b.dataset.choixParcours);
      if (enPresentation()) majVue();
    });
  }
  for (const b of boutonsMode) {
    b.addEventListener('click', () => appliquerMode(enPresentation() ? 'lecture' : 'presentation'));
  }

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target;
    if (t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    const presentation = enPresentation();
    switch (e.key) {
      case 'p': case 'P':
        appliquerMode(presentation ? 'lecture' : 'presentation');
        break;
      case 'Escape':
        if (!presentation) return;
        appliquerMode('lecture');
        break;
      case 'ArrowRight': case 'PageDown':
        if (!presentation && e.key === 'PageDown') return;
        aller(1);
        break;
      case ' ':
        if (!presentation) return;
        aller(e.shiftKey ? -1 : 1);
        break;
      case 'ArrowLeft': case 'PageUp':
        if (!presentation && e.key === 'PageUp') return;
        aller(-1);
        break;
      default:
        return;
    }
    e.preventDefault();
  });
})();
