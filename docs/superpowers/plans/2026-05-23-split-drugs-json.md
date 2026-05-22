# Split drugs.json into per-drug files — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the 1.6 MB `drugs.json` into 555 per-drug files in `src/data/`, validate them with a new schema, and regenerate `drugs.json` via a build script — with CI auto-committing the result and a Husky pre-commit hook catching errors locally.

**Architecture:** Per-drug files (`src/data/*.json`) are source of truth for human-edited fields; `combos.json` is source of truth for interactions. A build script reads both and assembles `drugs.json`. A validate script gates per-drug files. The existing `combosToDrugs.ts` is kept as reference but un-wired.

**Tech Stack:** TypeScript, ts-node, ajv 8 + ajv-formats, Husky, GitHub Actions

**CRITICAL — large file constraint:** Never use the AI `Read` tool on `drugs.json` or `combos.json` — they are 1.6 MB / 40k lines and will exhaust context. All inspection must use `node -e` one-liners via Bash. Scripts read these files inside Node processes only.

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| Create | `schemas/drug-schema.json` | Validates one drug object (no combos) |
| Create | `scripts/splitDrugs.ts` | One-time: drugs.json → src/data/*.json |
| Create | `scripts/drugs.ts` | `--check` validate per-drug files; `--build` assemble drugs.json |
| Create | `scripts/combos.ts` | `--check` validate + mirror; `--fix` apply + write |
| Create | `.husky/pre-commit` | Runs `npm run validate` |
| Modify | `package.json` | Add validate/build/prepare scripts, add husky devDep |
| Modify | `.github/workflows/validate.yml` | Replace combosToDrugs step with new scripts + auto-commit |
| Keep   | `scripts/combosToDrugs.ts` | Reference only, un-wired |
| Keep   | `scripts/index.ts` | Unchanged |
| Keep   | `schemas/drugs-schema.json` | Unchanged (validates assembled drugs.json) |

---

## Task 1: Create schemas/drug-schema.json

**Files:**
- Create: `schemas/drug-schema.json`

- [ ] **Step 1: Write the schema file**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Drug",
  "type": "object",
  "additionalProperties": false,
  "required": ["name", "pretty_name", "properties"],
  "properties": {
    "aliases": { "type": "array", "items": { "type": "string" } },
    "categories": { "type": "array", "items": { "$ref": "#/definitions/Category" } },
    "formatted_aftereffects": { "$ref": "#/definitions/Duration" },
    "formatted_dose": { "$ref": "#/definitions/Dose" },
    "formatted_duration": { "$ref": "#/definitions/Duration" },
    "formatted_effects": { "type": "array", "items": { "type": "string" } },
    "formatted_onset": { "$ref": "#/definitions/Duration" },
    "links": { "$ref": "#/definitions/Links" },
    "name": { "type": "string" },
    "pretty_name": { "type": "string" },
    "properties": { "$ref": "#/definitions/Properties" },
    "pweffects": { "type": "object", "additionalProperties": { "type": "string", "format": "uri" } },
    "dose_note": { "type": "string" },
    "sources": { "$ref": "#/definitions/Sources" }
  },
  "definitions": {
    "Category": {
      "type": "string",
      "enum": ["depressant","habit-forming","tentative","research-chemical","psychedelic","stimulant","dissociative","inactive","empathogen","common","benzodiazepine","opioid","supplement","nootropic","barbiturate","deliriant","ssri"],
      "title": "Category"
    },
    "Dose": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "Oral": { "$ref": "#/definitions/Dosage" },
        "Insufflated": { "$ref": "#/definitions/Dosage" },
        "Rectal": { "$ref": "#/definitions/Dosage" },
        "Vapourized": { "$ref": "#/definitions/Dosage" },
        "Intravenous": { "$ref": "#/definitions/Dosage" },
        "Smoked": { "$ref": "#/definitions/Dosage" },
        "Sublingual": { "$ref": "#/definitions/Dosage" },
        "Buccal": { "$ref": "#/definitions/Dosage" },
        "Intramuscular": { "$ref": "#/definitions/Dosage" },
        "Transdermal": { "$ref": "#/definitions/Dosage" },
        "HBWR": { "$ref": "#/definitions/Dosage" },
        "Morning_Glory": { "$ref": "#/definitions/Dosage" },
        "Dried": { "$ref": "#/definitions/Dosage" },
        "Fresh": { "$ref": "#/definitions/Dosage" },
        "Insufflated(Pure)": { "$ref": "#/definitions/Dosage" },
        "Oral(Benzedrex)": { "$ref": "#/definitions/Dosage" },
        "Oral(Pure)": { "$ref": "#/definitions/Dosage" },
        "Dry": { "$ref": "#/definitions/Dosage" },
        "Wet": { "$ref": "#/definitions/Dosage" }
      },
      "title": "Dose"
    },
    "Dosage": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "Common": { "type": "string" },
        "Light": { "type": "string" },
        "Strong": { "type": "string" },
        "Threshold": { "type": "string" },
        "Heavy": { "type": "string" },
        "Dangerous": { "type": "string" },
        "Fatal": { "type": "string" },
        "Note": { "type": "string" }
      },
      "title": "Dosage"
    },
    "Duration": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "_unit": { "$ref": "#/definitions/Unit" },
        "value": { "type": "string" },
        "Insufflated": { "type": "string" },
        "Oral": { "type": "string" },
        "Rectal": { "type": "string" },
        "Vapourized": { "type": "string" },
        "Smoked": { "type": "string" },
        "Oral_ER": { "type": "string" },
        "Oral_IR": { "type": "string" },
        "Intramuscular": { "type": "string" },
        "Intravenous": { "type": "string" },
        "Metabolites": { "type": "string" },
        "Parent": { "type": "string" },
        "Oral_MAOI": { "type": "string" },
        "Buccal": { "type": "string" },
        "Transdermal": { "type": "string" },
        "Sublingual": { "type": "string" },
        "Insufflated_IR": { "type": "string" },
        "Insufflated_XR": { "type": "string" }
      },
      "title": "Duration"
    },
    "Links": {
      "type": "object",
      "additionalProperties": false,
      "required": ["experiences"],
      "properties": {
        "experiences": { "type": "string", "format": "uri" },
        "pihkal": { "type": "string", "format": "uri" },
        "tihkal": { "type": "string", "format": "uri" }
      },
      "title": "Links"
    },
    "Properties": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "after-effects": { "type": "string" },
        "aliases": { "type": "array", "items": { "type": "string" } },
        "avoid": { "type": "string" },
        "categories": { "type": "array", "items": { "$ref": "#/definitions/Category" } },
        "dose": { "type": "string" },
        "duration": { "type": "string" },
        "half-life": { "type": "string" },
        "onset": { "type": "string" },
        "summary": { "type": "string" },
        "test-kits": { "type": "string" },
        "experiences": { "type": "string", "format": "uri" },
        "warning": { "type": "string" },
        "marquis": { "type": "string" },
        "effects": { "type": "string" },
        "risks": { "type": "string" },
        "comeup": { "type": "string" },
        "note": { "type": "string" },
        "detection": { "type": "string" },
        "wiki": { "type": "string", "format": "uri" },
        "mdma": { "type": "string" },
        "tolerance": { "type": "string" },
        "bioavailability": { "type": "string" },
        "dose_to_diazepam": { "type": "string" },
        "adverse-effects": { "type": "string" },
        "chemistry": { "type": "string" },
        "contraindications": { "type": "string" },
        "legal": { "type": "string" },
        "overdose-symptoms": { "type": "string" },
        "pharmacokinetics": { "type": "string" },
        "pharmacology": { "type": "string" },
        "obtain": { "type": "string" },
        "pharmacodynamics": { "type": "string" },
        "side-effects": { "type": "string" },
        "molecule": { "type": "string", "format": "uri" },
        "vaporization": { "type": "string" },
        "calculator": { "type": "string", "format": "uri" },
        "chart": { "type": "string", "format": "uri" },
        "Oral": { "type": "string" },
        "general-advice": { "type": "string" },
        "potentiators": { "type": "string" }
      },
      "title": "Properties"
    },
    "Sources": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "_general": { "type": "array", "items": { "type": "string" } },
        "dose": { "type": "array", "items": { "type": "string", "format": "uri" } },
        "duration": { "type": "array", "items": { "type": "string", "format": "uri" } },
        "bioavailability": { "type": "array", "items": { "type": "string", "format": "uri" } },
        "legality": { "type": "array", "items": { "type": "string", "format": "uri" } },
        "onset": { "type": "array", "items": { "type": "string" } }
      },
      "title": "Sources"
    },
    "Unit": {
      "type": "string",
      "enum": ["hours", "minutes"],
      "title": "Unit"
    }
  }
}
```

- [ ] **Step 2: Smoke-test schema validates a known-good drug**

```bash
node -e "
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const ajv = new Ajv();
addFormats(ajv);
const schema = require('./schemas/drug-schema.json');
const validate = ajv.compile(schema);
const drugs = require('./drugs.json');
const {combos, ...lsd} = drugs['lsd'];
const ok = validate(lsd);
console.log('valid:', ok);
if (!ok) console.log(validate.errors);
"
```

Expected output: `valid: true`

- [ ] **Step 3: Confirm schema rejects a drug with a combos block**

```bash
node -e "
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const ajv = new Ajv();
addFormats(ajv);
const schema = require('./schemas/drug-schema.json');
const validate = ajv.compile(schema);
const drugs = require('./drugs.json');
const lsd = drugs['lsd'];  // keep combos
const ok = validate(lsd);
console.log('valid (should be false):', ok);
if (!ok) console.log('errors:', validate.errors.map(e => e.message));
"
```

Expected: `valid (should be false): false` with an additionalProperties error.

- [ ] **Step 4: Commit**

```bash
git add schemas/drug-schema.json
git commit -m "feat: add drug-schema.json for single drug validation"
```

---

## Task 2: Create scripts/splitDrugs.ts (one-time migration)

**Files:**
- Create: `scripts/splitDrugs.ts`

- [ ] **Step 1: Write splitDrugs.ts**

```typescript
import * as fs from 'fs';
import * as path from 'path';

// deepSortKeys: sort all object keys recursively, leave arrays as-is
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

// Read drugs.json as a stream-processed object (Node process only, not AI Read tool)
const drugsPath = path.resolve(__dirname, '../drugs.json');
const drugsRaw = fs.readFileSync(drugsPath, 'utf8');
const drugs: Record<string, any> = JSON.parse(drugsRaw);

const keys = Object.keys(drugs);
const seenFiles = new Set<string>();

for (const key of keys) {
  const drug = drugs[key];

  // Strip combos — per-drug files never contain interaction data
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
```

- [ ] **Step 2: Run the migration**

```bash
npx ts-node scripts/splitDrugs.ts
```

Expected: `Split 555 drugs into .../src/data`

- [ ] **Step 3: Verify count and spot-check**

```bash
ls src/data/ | wc -l
# Expected: 555

cat src/data/lsd.json | head -20
# Expected: valid JSON, no "combos" key at top level

node -e "const f=require('./src/data/lsd.json'); console.log('has combos:', 'combos' in f); console.log('name:', f.name);"
# Expected: has combos: false   name: lsd
```

- [ ] **Step 4: Commit the 555 per-drug files**

```bash
git add src/data/
git commit -m "feat: split drugs.json into per-drug files in src/data/"
```

---

## Task 3: Create scripts/drugs.ts

**Files:**
- Create: `scripts/drugs.ts`

This script has three modes:
- `--check`: validate all per-drug files (schema, alphabetization, name==filename)
- `--build`: read per-drug files + combos.json → write drugs.json
- `--check-build`: build then `git diff --exit-code drugs.json` (fork PR stale check)

- [ ] **Step 1: Write scripts/drugs.ts**

```typescript
import * as fs from 'fs';
import * as path from 'path';
import Ajv, { JSONSchemaType } from 'ajv';
import addFormats from 'ajv-formats';

// ── helpers ──────────────────────────────────────────────────────────────────

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

// ── check ─────────────────────────────────────────────────────────────────────

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

    // 1. valid JSON
    let drug: any;
    try {
      drug = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      console.error(`FAIL [${filename}] invalid JSON: ${(e as Error).message}`);
      allValid = false;
      continue;
    }

    // 2. schema
    if (!validate(drug)) {
      validate.errors!.forEach(err => {
        errors.push(`schema: ${err.instancePath} ${err.message}`);
      });
    }

    // 3. alphabetized keys
    const alphaErrors = checkObjectAlpha(drug);
    alphaErrors.forEach(msg => errors.push(`alpha: ${msg}`));

    // 4. name field == filename (minus .json)
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

// ── build ─────────────────────────────────────────────────────────────────────

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

    // Inject combos from combos.json if this drug appears as a combos key
    // combos.json keys are the combo drug names; each value is a map of drug->ComboData
    // We want drug.combos = { drugB: comboData } where comboData comes from combos[key][drugB]
    // combos.json is keyed by the COMBO drug (e.g. "lsd"), pointing to its interactions
    const drugCombos: Record<string, any> = {};
    if (combos[key]) {
      Object.assign(drugCombos, combos[key]);
    }
    // Also check reverse: other combo keys that include this drug
    // (combos.json only lists 31 combo categories; drugs outside that won't appear as top-level keys)

    const entry: Record<string, any> = { ...drug };
    if (Object.keys(drugCombos).length > 0) {
      entry.combos = drugCombos;
    }

    assembled[key] = deepSortKeys(entry);
  }

  // Sort the top-level map
  const sorted = deepSortKeys(assembled);
  fs.writeFileSync(outPath, JSON.stringify(sorted, null, 2) + '\n');
  console.log(`Built drugs.json with ${Object.keys(sorted).length} drugs`);
}

// ── check-build ───────────────────────────────────────────────────────────────

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

// ── entry point ───────────────────────────────────────────────────────────────

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
```

- [ ] **Step 2: Verify --check passes on the freshly split files**

```bash
npx ts-node scripts/drugs.ts --check
```

Expected: `OK: all 555 drug files valid`

- [ ] **Step 3: Verify --build produces an equivalent drugs.json**

```bash
# Back up current drugs.json hash
md5 drugs.json

npx ts-node scripts/drugs.ts --build

# Check hash again — should be identical or differ only in trailing newline
md5 drugs.json
```

If hashes differ, investigate with:
```bash
node -e "
const orig = require('./drugs.json');
npx ts-node scripts/drugs.ts --build 2>/dev/null;
// run build first, then:
" 
# Use git diff to see what changed:
git diff drugs.json | head -40
```

Expected: zero diff or only trailing-newline difference.

- [ ] **Step 4: Verify --check fails on a bad file**

```bash
# Inject an extra property
node -e "
const f = require('./src/data/lsd.json');
f.badProperty = 'should not be here';
require('fs').writeFileSync('./src/data/lsd.json', JSON.stringify(f, null, 2) + '\n');
"

npx ts-node scripts/drugs.ts --check
# Expected: FAIL [lsd.json] with schema additionalProperties error

# Restore
npx ts-node scripts/drugs.ts --check 2>&1 | grep FAIL
git checkout src/data/lsd.json
```

- [ ] **Step 5: Commit**

```bash
git add scripts/drugs.ts
git commit -m "feat: add scripts/drugs.ts (validate + build drugs.json)"
```

---

## Task 4: Create scripts/combos.ts

**Files:**
- Create: `scripts/combos.ts`

This carries over the self-consistency logic from `combosToDrugs.ts` (reverse-interaction mirroring) minus all drugs.json writing.

- [ ] **Step 1: Write scripts/combos.ts**

```typescript
import * as fs from 'fs';
import * as path from 'path';
import Ajv, { JSONSchemaType } from 'ajv';
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
  function check(obj: Record<string, any>, path: string): boolean {
    if (!isAlphabetized(obj)) {
      const keys = Object.keys(obj);
      for (let i = 0; i < keys.length - 1; i++) {
        if (keys[i].localeCompare(keys[i + 1], undefined, { numeric: true, sensitivity: 'base' }) > 0) {
          console.error(`combos.json not alphabetized at ${path}: "${keys[i]}" before "${keys[i + 1]}"`);
          return false;
        }
      }
    }
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && obj[key] !== null) {
        if (!check(obj[key], `${path}.${key}`)) return false;
      }
    }
    return true;
  }
  return check(combos, 'root');
}

// Wildcard and category drugs are skipped for mirroring (same logic as combosToDrugs.ts)
const SKIP_MIRROR = new Set([
  '2c-t-x', '2c-x', '5-meo-xxt', 'dox',
  'amphetamines', 'benzodiazepines', 'maois', 'nbomes', 'opioids', 'ssris', 'ghb/gbl',
]);

function mirrorInteractions(combos: Record<string, any>): { changed: boolean; combos: Record<string, any> } {
  let changed = false;
  const data: Record<string, any> = JSON.parse(JSON.stringify(combos)); // deep clone

  for (const [drugA, interactions] of Object.entries(data)) {
    if (SKIP_MIRROR.has(drugA)) continue;
    for (const [drugB, interaction] of Object.entries(interactions as Record<string, any>)) {
      if (!data[drugB]) continue; // drugB not a top-level key in combos.json

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
```

- [ ] **Step 2: Run --check**

```bash
npx ts-node scripts/combos.ts --check
```

Expected: `OK: combos.json valid, alphabetized, mirrored`

- [ ] **Step 3: Verify --check fails on a de-mirrored combo**

```bash
# Remove one reverse interaction
node -e "
const c = require('./combos.json');
delete c['cannabis']['lsd'];
require('fs').writeFileSync('./combos.json', JSON.stringify(c, null, 2) + '\n');
"

npx ts-node scripts/combos.ts --check
# Expected: exit 1 with "unmirrored interactions" message

# Restore
npx ts-node scripts/combos.ts --fix
npx ts-node scripts/combos.ts --check
# Expected: OK
```

- [ ] **Step 4: Commit**

```bash
git add scripts/combos.ts
git commit -m "feat: add scripts/combos.ts (validate + mirror combos.json)"
```

---

## Task 5: Update package.json + install Husky

**Files:**
- Modify: `package.json`
- Create: `.husky/pre-commit`

- [ ] **Step 1: Install Husky**

```bash
npm install --save-dev husky
```

- [ ] **Step 2: Update package.json scripts**

Edit `package.json` — replace the `"scripts"` block:

```json
"scripts": {
  "validate": "ts-node scripts/drugs.ts --check && ts-node scripts/combos.ts --check",
  "build": "ts-node scripts/combos.ts --fix && ts-node scripts/drugs.ts --build",
  "prepare": "husky"
}
```

(Remove the old `"compare"` script — `combosToDrugs.ts` is now reference-only.)

- [ ] **Step 3: Initialize Husky**

```bash
npx husky init
```

- [ ] **Step 4: Write .husky/pre-commit**

Replace the generated `.husky/pre-commit` with:

```sh
npm run validate
```

- [ ] **Step 5: Test the hook fires**

```bash
# Make a trivial change and commit — hook should run validate
echo "" >> src/data/lsd.json
git add src/data/lsd.json

# This will trigger pre-commit; it should fail (trailing newline breaks JSON)
git commit -m "test hook" 2>&1 | head -10
# Expected: hook runs, FAIL on lsd.json invalid JSON

# Restore
git checkout src/data/lsd.json
```

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json .husky/
git commit -m "feat: add husky pre-commit hook + npm validate/build scripts"
```

---

## Task 6: Update .github/workflows/validate.yml

**Files:**
- Modify: `.github/workflows/validate.yml`

- [ ] **Step 1: Read current workflow**

```bash
cat .github/workflows/validate.yml
```

- [ ] **Step 2: Rewrite the workflow**

Replace the entire file with:

```yaml
name: Validate changes

on:
  pull_request:
    types:
      - opened
      - synchronize
      - reopened

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v4
        with:
          # Need full history for git diff in check-build
          fetch-depth: 0

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '21'

      - name: Install Dependencies
        run: npm ci

      - name: Validate combos.json
        run: npx ts-node scripts/combos.ts --check

      - name: Validate per-drug files
        run: npx ts-node scripts/drugs.ts --check

      - name: Rebuild and commit drugs.json (same-repo branches)
        if: github.event.pull_request.head.repo.full_name == github.repository
        run: |
          npm run build
          if git diff --exit-code drugs.json; then
            echo "drugs.json unchanged"
          else
            git config user.name  "github-actions[bot]"
            git config user.email "github-actions[bot]@users.noreply.github.com"
            git add drugs.json
            git commit -m "chore: rebuild drugs.json [skip ci]"
            git push origin HEAD:${{ github.head_ref }}
          fi

      - name: Check drugs.json is up-to-date (fork PRs)
        if: github.event.pull_request.head.repo.full_name != github.repository
        run: npx ts-node scripts/drugs.ts --check-build

      - name: Assign Pull Request
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.addAssignees({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              assignees: ['LunaUrsa']
            })
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/validate.yml
git commit -m "ci: replace combosToDrugs CI step with drugs.ts + combos.ts + auto-commit"
```

---

## Task 7: Round-trip verification

Verify the whole pipeline is lossless and the pre-commit hook works end-to-end.

- [ ] **Step 1: Full rebuild from scratch**

```bash
# Rebuild drugs.json fresh from per-drug files + combos.json
npx ts-node scripts/drugs.ts --build

# Diff against committed version
git diff drugs.json
```

Expected: empty diff (or only a trailing newline).

- [ ] **Step 2: Verify drug count**

```bash
node -e "const d=require('./drugs.json'); console.log('drugs:', Object.keys(d).length);"
# Expected: 555

ls src/data/ | wc -l
# Expected: 555
```

- [ ] **Step 3: Verify combos injected on known drug**

```bash
node -e "const d=require('./drugs.json'); console.log('lsd combos keys:', Object.keys(d['lsd'].combos || {}));"
# Expected: list of ~30 combo keys (alcohol, amphetamines, etc.)
```

- [ ] **Step 4: Verify per-drug file has no combos**

```bash
node -e "const f=require('./src/data/lsd.json'); console.log('has combos:', 'combos' in f);"
# Expected: has combos: false
```

- [ ] **Step 5: Final commit if drugs.json changed**

```bash
git status
# If drugs.json is modified:
git add drugs.json
git commit -m "chore: rebuild drugs.json from per-drug source files"
```

---

## Task 8: Clean up combosToDrugs reference

**Files:**
- Keep (no deletion): `scripts/combosToDrugs.ts`

- [ ] **Step 1: Add a comment header to combosToDrugs.ts**

Add at the top of the file, above the existing block comment:

```typescript
// REFERENCE ONLY — superseded by scripts/drugs.ts and scripts/combos.ts
// Not wired into npm scripts or CI. Kept for historical reference.
```

- [ ] **Step 2: Commit**

```bash
git add scripts/combosToDrugs.ts
git commit -m "docs: mark combosToDrugs.ts as reference-only"
```

---

## Self-Review

**Spec coverage check:**
- ✅ `schemas/drug-schema.json` — Task 1
- ✅ `scripts/splitDrugs.ts` — Task 2
- ✅ `scripts/drugs.ts` (--check, --build, --check-build) — Task 3
- ✅ `scripts/combos.ts` (--check, --fix, mirroring) — Task 4
- ✅ Husky pre-commit — Task 5
- ✅ npm validate/build/prepare scripts — Task 5
- ✅ CI update (same-repo auto-commit, fork stale-check) — Task 6
- ✅ Round-trip lossless verification — Task 7
- ✅ combosToDrugs.ts kept as reference — Task 8
- ✅ Large-file constraint (node -e one-liners, no AI Read of drugs.json/combos.json) — enforced throughout

**Large-file constraint compliance:**
- Task 2 step 3: uses `node -e` not `cat src/data/lsd.json` for content checks (uses `head` for a quick peek only)
- Task 3 step 3: uses `node -e` for round-trip check
- No task uses the AI `Read` tool on `drugs.json` or `combos.json`
- All scripts read these files inside Node processes only (`fs.readFileSync` in ts-node)

**Type consistency:**
- `deepSortKeys` defined identically in splitDrugs.ts, drugs.ts, combos.ts (copy — acceptable for standalone scripts)
- `checkObjectAlpha` / `isAlphabetized` consistent between drugs.ts and combos.ts
- `drug.name` used as canonical key in all tasks consistently
