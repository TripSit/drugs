import * as fs from 'fs';
import * as path from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

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

function checkObjectAlpha(obj: Record<string, any>): string[] {
  const failures: string[] = [];
  if (!isAlphabetized(obj)) {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length - 1; i++) {
      if (keys[i].localeCompare(keys[i + 1], undefined, { numeric: true, sensitivity: 'base' }) > 0) {
        failures.push(`key "${keys[i]}" comes before "${keys[i + 1]}" but shouldn't`);
        break;
      }
    }
  }
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && obj[key] !== null) {
      const nested = checkObjectAlpha(obj[key]);
      nested.forEach(msg => failures.push(`${key} → ${msg}`));
    }
  }
  return failures;
}

function checkDrugs(): boolean {
  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);
  const schemaPath = path.resolve(__dirname, '../schemas/drug-schema.json');
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  const validate = ajv.compile(schema);

  const dataDir = path.resolve(__dirname, '../src/data');
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json')).sort();

  let allValid = true;

  for (const filename of files) {
    const filePath = path.join(dataDir, filename);
    const errors: string[] = [];

    let drug: any;
    try {
      drug = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      console.error(`FAIL [${filename}] invalid JSON: ${(e as Error).message}`);
      allValid = false;
      continue;
    }

    if (!validate(drug)) {
      validate.errors!.forEach(err => {
        errors.push(`schema: ${err.instancePath} ${err.message}`);
      });
    }

    const alphaErrors = checkObjectAlpha(drug);
    alphaErrors.forEach(msg => errors.push(`alpha: ${msg}`));

    const expectedName = filename.replace(/\.json$/, '');
    if (drug.name !== expectedName) {
      errors.push(`name mismatch: file is "${filename}" but drug.name is "${drug.name}"`);
    }

    if (errors.length > 0) {
      console.error(`FAIL [${filename}]`);
      errors.forEach(e => console.error(`  ${e}`));
      allValid = false;
    }
  }

  if (allValid) {
    console.log(`OK: all ${files.length} drug files valid`);
  }
  return allValid;
}

function buildDrugs(): void {
  const dataDir = path.resolve(__dirname, '../src/data');
  const combosPath = path.resolve(__dirname, '../combos.json');
  const outPath = path.resolve(__dirname, '../drugs.json');

  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
  const combos: Record<string, any> = JSON.parse(fs.readFileSync(combosPath, 'utf8'));

  const assembled: Record<string, any> = {};

  for (const filename of files) {
    const drug: any = JSON.parse(fs.readFileSync(path.join(dataDir, filename), 'utf8'));
    const key: string = drug.name;

    const drugCombos: Record<string, any> = {};
    if (combos[key]) {
      Object.assign(drugCombos, combos[key]);
    }

    const entry: Record<string, any> = { ...drug };
    if (Object.keys(drugCombos).length > 0) {
      entry.combos = drugCombos;
    }

    assembled[key] = deepSortKeys(entry);
  }

  const sorted = deepSortKeys(assembled);
  fs.writeFileSync(outPath, JSON.stringify(sorted, null, 2) + '\n');
  console.log(`Built drugs.json with ${Object.keys(sorted).length} drugs`);
}

function checkBuild(): boolean {
  buildDrugs();
  const { execSync } = require('child_process');
  try {
    execSync('git diff --exit-code drugs.json', { stdio: 'inherit' });
    console.log('drugs.json is up-to-date');
    return true;
  } catch {
    console.error('drugs.json is stale — run `npm run build` locally and commit it');
    return false;
  }
}

const args = process.argv.slice(2);

if (args.includes('--check')) {
  if (!checkDrugs()) process.exit(1);
} else if (args.includes('--build')) {
  buildDrugs();
} else if (args.includes('--check-build')) {
  if (!checkBuild()) process.exit(1);
} else {
  console.error('Usage: ts-node scripts/drugs.ts [--check | --build | --check-build]');
  process.exit(1);
}
