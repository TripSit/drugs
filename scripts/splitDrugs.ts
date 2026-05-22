import * as fs from 'fs';
import * as path from 'path';

function deepSortKeys<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => deepSortKeys(item)) as unknown as T;
  }
  if (value !== null && typeof value === 'object') {
    const sorted: Record<string, any> = {};
    Object.keys(value as Record<string, any>)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
      .forEach((key) => {
        sorted[key] = deepSortKeys((value as Record<string, any>)[key]);
      });
    return sorted as T;
  }
  return value;
}

const outDir = path.resolve(__dirname, '../src/data');
fs.mkdirSync(outDir, { recursive: true });

const drugsPath = path.resolve(__dirname, '../drugs.json');
const drugsRaw = fs.readFileSync(drugsPath, 'utf8');
const drugs: Record<string, any> = JSON.parse(drugsRaw);

const keys = Object.keys(drugs);
const seenFiles = new Set<string>();

for (const key of keys) {
  const drug = drugs[key];

  const { combos: _combos, ...drugWithoutCombos } = drug;

  const sorted = deepSortKeys(drugWithoutCombos);
  const filename = `${key}.json`;
  const outPath = path.join(outDir, filename);

  if (seenFiles.has(filename)) {
    throw new Error(`Filename collision: ${filename}`);
  }
  seenFiles.add(filename);

  fs.writeFileSync(outPath, JSON.stringify(sorted, null, 2) + '\n');
}

console.log(`Split ${keys.length} drugs into ${outDir}`);
