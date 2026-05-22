# Split drugs.json into per-drug files — Design

Date: 2026-05-23

## Problem

`drugs.json` is a single 1.6 MB / ~40k-line file holding all 555 drugs. Editing one
drug means touching the giant file, producing noisy diffs and merge conflicts. We want
each drug in its own standardized, schema-validated file so a contributor can edit
`src/data/lsd.json` in isolation.

Constraint: the API and several downstream services consume `drugs.json` directly from
GitHub. `drugs.json` must remain a committed, browsable artifact. It becomes a generated
build product — CI is its only author.

## Decisions

- **Source of truth:** per-drug files (`src/data/*.json`) for human-edited fields, plus
  `combos.json` for interactions. `drugs.json` is generated from both.
- **Combos excluded from per-drug files.** Interactions live only in `combos.json`. The
  build injects them into `drugs.json`. Editors of a per-drug file never touch combos.
- **`drugs.json` stays committed** (not gitignored). Downstream consumers keep fetching
  it unchanged. CI regenerates and commits it.
- **New `schemas/drug-schema.json`** validates a single drug object (no combos block).
  Existing `drugs-schema.json` is untouched and still validates the assembled file.
- **Filenames map 1:1 to drug keys.** Verified: zero drug keys contain filesystem-unsafe
  chars; only commas (`1,4-butanediol`), which are legal filenames. The drug's `name`
  field remains the canonical key (safety net); `validate` enforces `name == filename`.
- **Pre-commit via Husky.** Auto-installs on `npm install` through the `prepare` script.
- **Fork PRs:** CI auto-commits the regenerated `drugs.json` only for same-repo branches.
  Fork PRs (head repo != base repo) cannot be pushed to with the default `GITHUB_TOKEN`,
  so they are validated with a stale-check that fails and comments, telling the
  contributor to run `npm run build` locally and commit.

## Architecture

```
src/data/
  1,4-butanediol.json
  ghb.json
  lsd.json
  ...                       # 555 files, one drug each, NO combos block
schemas/
  drug-schema.json          # NEW: single drug, no combos
  drugs-schema.json         # unchanged: assembled drugs.json (has combos)
  combos-schema.json        # unchanged
scripts/
  splitDrugs.ts             # NEW: one-time migration, drugs.json -> src/data/*.json
  drugs.ts                  # NEW: per-drug concern (validate + build drugs.json)
  combos.ts                 # NEW: combos concern (validate + mirror)
  index.ts                  # unchanged exports
  combosToDrugs.ts          # DELETED (logic split into drugs.ts + combos.ts)
.husky/
  pre-commit                # runs npm run validate
```

### Data flow

```
edit src/data/lsd.json  ──┐
                          ├─► drugs.ts --build ─► drugs.json (alphabetical, minimal diff)
combos.json ──────────────┘    (injects combos per drug, deep-sorts keys)
```

Build order: `combos.ts --fix` first (mirror interactions in combos.json), then
`drugs.ts --build` (inject the now-consistent combos). CI runs combos check before
drugs build.

## Components

### schemas/drug-schema.json (new)

- Top-level type = one Drug object (not a map).
- Copy the `Drug` definition and all sub-definitions from `drugs-schema.json`
  (Dose, Dosage, Duration, Links, Properties, Category, Unit, Sources).
- Omit the `combos` property entirely.
- `additionalProperties: false` — rejects a stray `combos` block or any typo'd field.
- `required: [name, pretty_name, properties]` (matches existing Drug schema).

### scripts/splitDrugs.ts (new, run-once)

- Read `drugs.json`. For each `[key, drug]`:
  - strip `combos`
  - deep-sort keys (reuse `deepSortKeys`)
  - write `src/data/${key}.json`, `JSON.stringify(_, null, 2)`
- Guard: throw on filename collision or unsafe char (none today, but assert).
- After running, the migration script may be kept as a dev util or deleted; not part of
  the steady-state pipeline.

### scripts/drugs.ts (new) — per-drug concern

Flags:
- `--check`: validate each `src/data/*.json`:
  1. valid JSON
  2. matches `drug-schema.json` (ajv + ajv-formats, `additionalProperties: false`)
  3. keys alphabetized (reuse the `localeCompare(..., { numeric: true })` comparator)
  4. `name` field == filename (minus `.json`)
  Exit 1 with a per-file report on any failure.
- `--build`: read all per-drug files (canonical key = `name`), inject combos from
  `combos.json` per drug, assemble the map, `deepSortKeys`, write `drugs.json`
  (`JSON.stringify(_, null, 2)`).
- `--check-build`: run `--build`, then `git diff --exit-code drugs.json`. Used for fork
  PRs — nonzero exit means the committed `drugs.json` is stale.

### scripts/combos.ts (new) — combos concern

Carries over the existing combosToDrugs logic MINUS all drugs.json writing:
- validate `combos.json` against `combos-schema.json`
- keep `combos.json` alphabetized
- reverse-interaction mirroring: if A↔B status/note/sources differ between the two
  directions, mirror them so both directions match.
Flags:
- `--check`: validate + alphabetization + assert mirrored; exit 1 on mismatch (CI gate).
- `--fix`: apply mirroring and re-sort, write `combos.json`.

### npm scripts

```json
"validate": "ts-node scripts/drugs.ts --check && ts-node scripts/combos.ts --check",
"build":    "ts-node scripts/combos.ts --fix && ts-node scripts/drugs.ts --build",
"prepare":  "husky"
```

### .husky/pre-commit

Runs `npm run validate` (fast: schema + alphabetization + name check on per-drug files
and combos). Does NOT build — that is CI's job.

### CI — .github/workflows/validate.yml

1. `npm ci`
2. `ts-node scripts/combos.ts --check`
3. `ts-node scripts/drugs.ts --check`
4. branch logic:
   - same-repo (`github.event.pull_request.head.repo.full_name == github.repository`):
     `npm run build` → if `drugs.json` changed, commit + push to the PR branch.
   - fork: `ts-node scripts/drugs.ts --check-build` → fail + comment if `drugs.json` is
     stale, instructing the contributor to run `npm run build` and commit.
5. Keep the existing assign-PR step.

## Error Handling

- `--check` reports every failing file with the specific failure (bad JSON / schema
  error / unsorted keys / name mismatch), then exits 1.
- `splitDrugs.ts` asserts no filename collisions before writing anything.
- Fork PR stale `drugs.json` produces an actionable comment, not a silent failure.

## Testing

- Round-trip: run `splitDrugs.ts` then `drugs.ts --build`; assert the rebuilt
  `drugs.json` deep-equals the original (modulo key ordering already enforced by
  deepSortKeys). This proves the split is lossless.
- Negative cases for `--check`: a file with an extra property, a misordered key, a
  `name`/filename mismatch, malformed JSON — each must exit 1.
- `combos.ts --check` on a deliberately de-mirrored combos.json must exit 1.

## Migration Steps (high level)

1. Add `schemas/drug-schema.json`.
2. Add `scripts/splitDrugs.ts`; run it; commit the 555 `src/data/*.json` files.
3. Add `scripts/drugs.ts` and `scripts/combos.ts`; delete `combosToDrugs.ts`; update
   `package.json compare` references.
4. Add Husky + `.husky/pre-commit`; wire `prepare`.
5. Update `.github/workflows/validate.yml`.
6. Verify `drugs.json` rebuilt from per-drug files is byte-identical (after sort) to the
   committed one.

## Out of Scope

- Gitignoring `drugs.json` (rejected — downstream consumers need it).
- Splitting `combos.json` into per-combo files.
- Changing the public shape of `drugs.json` consumed by the API.
