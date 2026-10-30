/**
 * Genera src/data/bodyPaths.ts con las siluetas del cuerpo (de frente y de
 * espaldas) de MuscleMap (https://github.com/melihcolpan/MuscleMap, licencia
 * MIT), que trae los trazos SVG dentro de ficheros Swift.
 *
 * Solo se usa la figura masculina y los músculos principales: los subgrupos
 * (pecho superior, deltoide frontal...) se solapan con ellos y se descartan.
 *
 * Uso:
 *   git clone https://github.com/melihcolpan/MuscleMap /ruta/MuscleMap
 *   node scripts/generate-body-paths.js /ruta/MuscleMap
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'data', 'bodyPaths.ts');

const SUBGROUPS = new Set([
  'upperChest',
  'lowerChest',
  'innerQuad',
  'outerQuad',
  'upperAbs',
  'lowerAbs',
  'frontDeltoid',
  'upperTrapezius',
  'lowerTrapezius',
  'rearDeltoid',
  'hair',
]);

// BodyViewBox.maleFront / maleBack de MuscleMap.
const VIEW_BOXES = { front: '0 95 727 1280', back: '718 95 727 1280' };

function parsePaths(repo, file) {
  const source = fs.readFileSync(path.join(repo, 'Sources', 'MuscleMap', 'Data', file), 'utf-8');
  const parts = [];
  const block = /BodyPartPathData\(\s*slug:\s*\.(\w+)([\s\S]*?)\n\s{8}\)/g;
  let match;
  while ((match = block.exec(source))) {
    const [, slug, body] = match;
    if (SUBGROUPS.has(slug)) continue;
    const group = name => {
      const found = new RegExp(`${name}:\\s*\\[([\\s\\S]*?)\\]`).exec(body);
      return found ? [...found[1].matchAll(/"([^"]+)"/g)].map(m => m[1]) : [];
    };
    parts.push({ slug, paths: [...group('common'), ...group('left'), ...group('right')] });
  }
  if (!parts.length) throw new Error(`No se ha encontrado ningún trazo en ${file}`);
  return parts;
}

function main() {
  const repo = process.argv[2];
  if (!repo) {
    console.error('Uso: node scripts/generate-body-paths.js /ruta/a/MuscleMap');
    process.exit(1);
  }
  const license = fs.readFileSync(path.join(repo, 'LICENSE'), 'utf-8').trim();
  const figures = {
    front: parsePaths(repo, 'MaleFrontPaths.swift'),
    back: parsePaths(repo, 'MaleBackPaths.swift'),
  };

  const out = `// Generado por scripts/generate-body-paths.js: no editar a mano.
//
// Siluetas de MuscleMap (https://github.com/melihcolpan/MuscleMap):
//
${license
  .split('\n')
  .map(line => `// ${line}`.trimEnd())
  .join('\n')}

export type BodySide = 'front' | 'back';

export interface BodyPart {
  slug: string;
  paths: string[];
}

export const BODY_VIEW_BOXES: Record<BodySide, string> = ${JSON.stringify(VIEW_BOXES)};

export const BODY_PARTS: Record<BodySide, BodyPart[]> = ${JSON.stringify(figures)};
`;
  fs.writeFileSync(OUTPUT_PATH, out, 'utf-8');
  for (const side of ['front', 'back']) {
    console.log(`${side}: ${figures[side].map(p => p.slug).join(', ')}`);
  }
  console.log(`Guardado en ${OUTPUT_PATH}`);
}

main();
