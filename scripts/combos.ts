import * as fs from 'fs';
import * as path from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const combosPath = path.resolve(__dirname, '../combos.json');
const schemaPath = path.resolve(__dirname, '../schemas/combos-schema.json');

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

function isAlphabetized(obj: Record<string, any>): boolean {
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length - 1; i++) {
    if (keys[i].localeCompare(keys[i + 1], undefined, { numeric: true, sensitivity: 'base' }) > 0) {
      return false;
    }
  }
  return true;
}

function validateSchema(combos: Record<string, any>): boolean {
  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  const validate = ajv.compile(schema);
  const valid = validate(combos);
  if (!valid) {
    console.error('combos.json schema invalid:');
    validate.errors!.forEach(e => console.error(` ${e.instancePath} ${e.message}`));
  }
  return !!valid;
}

function checkAlphabetized(combos: Record<string, any>): boolean {
  function check(obj: Record<string, any>, p: string): boolean {
    if (!isAlphabetized(obj)) {
      const keys = Object.keys(obj);
      for (let i = 0; i < keys.length - 1; i++) {
        if (keys[i].localeCompare(keys[i + 1], undefined, { numeric: true, sensitivity: 'base' }) > 0) {
          console.error(`combos.json not alphabetized at ${p}: "${keys[i]}" before "${keys[i + 1]}"`);
          return false;
        }
      }
    }
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && obj[key] !== null) {
        if (!check(obj[key], `${p}.${key}`)) return false;
      }
    }
    return true;
  }
  return check(combos, 'root');
}

const SKIP_MIRROR = new Set([
  '2c-t-x', '2c-x', '5-meo-xxt', 'dox',
  'amphetamines', 'benzodiazepines', 'maois', 'nbomes', 'opioids', 'ssris', 'ghb/gbl',
]);

function mirrorInteractions(combos: Record<string, any>): { changed: boolean; combos: Record<string, any> } {
  let changed = false;
  const data: Record<string, any> = JSON.parse(JSON.stringify(combos));

  for (const [drugA, interactions] of Object.entries(data)) {
    if (SKIP_MIRROR.has(drugA)) continue;
    for (const [drugB, interaction] of Object.entries(interactions as Record<string, any>)) {
      if (!data[drugB]) continue;

      if (!data[drugB][drugA]) {
        data[drugB][drugA] = { ...interaction };
        changed = true;
        console.log(`+ mirror ${drugB} ↔ ${drugA}`);
      } else if (JSON.stringify(data[drugB][drugA]) !== JSON.stringify(interaction)) {
        console.log(`~ sync ${drugA} ↔ ${drugB}`);
        data[drugB][drugA] = { ...interaction };
        changed = true;
      }
    }
  }
  return { changed, combos: data };
}

function checkCombos(): boolean {
  const raw = fs.readFileSync(combosPath, 'utf8');
  const combos = JSON.parse(raw);

  let ok = true;
  if (!validateSchema(combos)) ok = false;
  if (!checkAlphabetized(combos)) ok = false;

  const { changed } = mirrorInteractions(combos);
  if (changed) {
    console.error('combos.json has unmirrored interactions — run `ts-node scripts/combos.ts --fix`');
    ok = false;
  }

  if (ok) console.log('OK: combos.json valid, alphabetized, mirrored');
  return ok;
}

function fixCombos(): void {
  const raw = fs.readFileSync(combosPath, 'utf8');
  const combos = JSON.parse(raw);

  const { combos: mirrored } = mirrorInteractions(combos);
  const sorted = deepSortKeys(mirrored);
  fs.writeFileSync(combosPath, JSON.stringify(sorted, null, 2) + '\n');
  console.log('combos.json fixed: mirrored + sorted');
}

const args = process.argv.slice(2);

if (args.includes('--check')) {
  if (!checkCombos()) process.exit(1);
} else if (args.includes('--fix')) {
  fixCombos();
} else {
  console.error('Usage: ts-node scripts/combos.ts [--check | --fix]');
  process.exit(1);
}
