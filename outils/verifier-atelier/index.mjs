#!/usr/bin/env node
// verifier-atelier : le contrôle technique de l'atelier Klass.
//
// Il clone le dépôt distant dans un dossier temporaire, puis lance les points
// de contrôle un par un et s'arrête au premier écart. Les points sont lus dans
// le clone (outils/verifier-atelier/points/), pas dans la copie locale : on
// contrôle ce qui a été poussé.
//
//   npm run verifier-atelier                 tous les points
//   npm run verifier-atelier -- 7 8          seulement les points 7 et 8
//   npm run verifier-atelier -- --liste      la liste des points
//   options : --source <url ou chemin>  --branche <nom>  --garder

import { mkdtempSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Ecart, executer } from './outils.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
const RACINE_LOCALE = resolve(ICI, '..', '..');
const CHEMIN_POINTS = join('outils', 'verifier-atelier', 'points');

function lireArguments(argv) {
  const options = { numeros: [], source: null, branche: null, garder: false, liste: false, aide: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--source') options.source = argv[++i];
    else if (a === '--branche') options.branche = argv[++i];
    else if (a === '--garder') options.garder = true;
    else if (a === '--liste') options.liste = true;
    else if (a === '--aide' || a === '-h' || a === '--help') options.aide = true;
    else if (/^\d+$/.test(a)) options.numeros.push(Number(a));
    else throw new Ecart(`Argument inconnu : « ${a} ». Essayez --aide.`);
  }
  return options;
}

async function chargerPoints(dossierPoints) {
  if (!existsSync(dossierPoints)) {
    throw new Ecart(`Dossier des points introuvable : ${dossierPoints}`);
  }
  const fichiers = readdirSync(dossierPoints).filter((f) => f.endsWith('.mjs')).sort();
  const points = [];
  for (const fichier of fichiers) {
    const module = await import(pathToFileURL(join(dossierPoints, fichier)).href);
    const point = module.default;
    if (!point || !Number.isInteger(point.numero) || typeof point.titre !== 'string' || typeof point.verifier !== 'function') {
      throw new Ecart(`${fichier} doit exporter par défaut { numero, titre, verifier }.`);
    }
    if (points.some((p) => p.numero === point.numero)) {
      throw new Ecart(`Deux fichiers portent le point ${point.numero}.`);
    }
    points.push({ requiert: [], ...point, fichier });
  }
  return points.sort((a, b) => a.numero - b.numero);
}

/** Les points demandés, plus ceux dont ils ont besoin (par exemple l'installation). */
function selectionner(points, numeros) {
  if (numeros.length === 0) return points;
  const parNumero = new Map(points.map((p) => [p.numero, p]));
  const retenus = new Set();
  const ajouter = (n) => {
    const p = parNumero.get(n);
    if (!p) {
      const existants = points.map((x) => x.numero).join(', ');
      throw new Ecart(`Le point ${n} n'existe pas (encore) dans ce dépôt. Points disponibles : ${existants}.`);
    }
    if (retenus.has(n)) return;
    retenus.add(n);
    p.requiert.forEach(ajouter);
  };
  numeros.forEach(ajouter);
  return points.filter((p) => retenus.has(p.numero));
}

function prevenirSiNonPousse(branche) {
  const etat = executer('git', ['status', '--porcelain'], { cwd: RACINE_LOCALE, toleree: true }).stdout.trim();
  if (etat) {
    console.log('⚠ Des modifications locales ne sont pas commitées : elles ne sont pas contrôlées.');
  }
  const enAvance = executer('git', ['rev-list', '--count', `origin/${branche}..HEAD`], { cwd: RACINE_LOCALE, toleree: true });
  if (enAvance.code === 0 && Number(enAvance.stdout.trim()) > 0) {
    console.log(`⚠ ${enAvance.stdout.trim()} commit(s) locaux ne sont pas poussés : ils ne sont pas contrôlés.`);
  }
}

async function main() {
  const options = lireArguments(process.argv.slice(2));

  if (options.aide) {
    console.log(`verifier-atelier : contrôle l'atelier depuis un clone vierge du dépôt distant.

  npm run verifier-atelier                 tous les points
  npm run verifier-atelier -- 7 8          seulement certains points
  npm run verifier-atelier -- --liste      la liste des points

  --source <url ou chemin>   dépôt à cloner (par défaut : le remote origin)
  --branche <nom>            branche à cloner (par défaut : la branche courante)
  --garder                   garde le clone temporaire après le contrôle`);
    return;
  }

  if (options.liste) {
    const points = await chargerPoints(join(RACINE_LOCALE, CHEMIN_POINTS));
    for (const p of points) {
      const besoin = p.requiert.length ? ` (lance aussi : ${p.requiert.join(', ')})` : '';
      console.log(`${p.numero}. ${p.titre}${besoin}`);
    }
    return;
  }

  const source = options.source
    ?? executer('git', ['remote', 'get-url', 'origin'], { cwd: RACINE_LOCALE }).stdout.trim();
  const branche = options.branche
    ?? executer('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: RACINE_LOCALE }).stdout.trim();
  if (!options.source) prevenirSiNonPousse(branche);

  const temporaire = mkdtempSync(join(tmpdir(), 'verifier-atelier-'));
  const dossier = join(temporaire, 'depot');
  let reussi = false;
  try {
    console.log(`Clone vierge de ${source} (branche ${branche})…`);
    executer('git', ['clone', '--quiet', '--branch', branche, source, dossier]);
    const commit = executer('git', ['rev-parse', '--short', 'HEAD'], { cwd: dossier }).stdout.trim();
    console.log(`Commit contrôlé : ${commit}\n`);

    const points = selectionner(await chargerPoints(join(dossier, CHEMIN_POINTS)), options.numeros);
    const contexte = { dossier, source, branche, commit };

    for (const point of points) {
      console.log(`▶ Point ${point.numero} — ${point.titre}`);
      const debut = Date.now();
      try {
        const bilan = await point.verifier(contexte);
        const duree = ((Date.now() - debut) / 1000).toFixed(1);
        console.log(`  ✔ ${bilan ?? 'OK'} (${duree} s)`);
      } catch (erreur) {
        const message = erreur instanceof Ecart ? erreur.message : (erreur?.stack ?? String(erreur));
        console.log(`  ✘ ${message.split('\n').join('\n    ')}`);
        console.log(`\n✘ verifier-atelier : écart au point ${point.numero}. Contrôle arrêté.`);
        process.exitCode = 1;
        return;
      }
    }
    reussi = true;
    const liste = points.map((p) => p.numero).join(', ');
    console.log(`\n✔ verifier-atelier : ${points.length} point(s) en succès (${liste}), branche ${branche}, commit ${commit}.`);
  } finally {
    if (options.garder) {
      console.log(`Clone gardé dans : ${dossier}`);
    } else {
      rmSync(temporaire, { recursive: true, force: true, maxRetries: 3 });
    }
    if (!reussi && process.exitCode !== 1) process.exitCode = 1;
  }
}

main().catch((erreur) => {
  const message = erreur instanceof Ecart ? erreur.message : (erreur?.stack ?? String(erreur));
  console.error(`✘ verifier-atelier : ${message}`);
  process.exitCode = 1;
});
