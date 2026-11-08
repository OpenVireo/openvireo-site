#!/usr/bin/env node
// Checks the comparison data behind /compare/ (data/compare/).
//
//   npm run check:compare            errors: a product without a value for some row, an unknown row or `v`,
//                                    a competitor value without `source` or `checked`; warnings: stale values
//   npm run check:compare -- --strict  stale values are errors too (the weekly workflow runs this)
//
// "Stale" means `checked` is more than MAX_AGE_DAYS old: prices and features change, and the pages promise
// that every fact was checked recently.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const MAX_AGE_DAYS = 90;
const KINDS = new Set(['yes', 'no', 'partial', 'na', 'text']);
const strict = process.argv.includes('--strict');
const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'compare');
const load = (file) => parse(readFileSync(join(dir, file), 'utf8'));

const products = load('products.yaml');
const { groups, rows } = load('rows.yaml');
const groupIds = new Set(groups.map((g) => g.id));
const rowIds = new Set(rows.map((r) => r.id));
const errors = [];
const warnings = [];
const today = new Date();

for (const row of rows) {
  if (!groupIds.has(row.group)) errors.push(`rows.yaml: row ${row.id} has unknown group ${row.group}`);
}

for (const product of products) {
  const file = `values/${product.id}.yaml`;
  let values;
  try {
    values = load(file);
  } catch (e) {
    errors.push(`${file}: ${e.message}`);
    continue;
  }
  for (const id of rowIds) {
    if (!values[id]) errors.push(`${file}: no value for ${id}`);
  }
  for (const [id, val] of Object.entries(values)) {
    const where = `${file}: ${id}`;
    if (!rowIds.has(id)) errors.push(`${where}: not a row in rows.yaml`);
    if (!KINDS.has(val.v)) errors.push(`${where}: v must be one of ${[...KINDS].join(', ')} (got ${JSON.stringify(val.v)})`);
    if (!val.note) errors.push(`${where}: no note`);
    if (product.self) continue;
    if (!val.source) errors.push(`${where}: no source`);
    if (!val.checked) {
      errors.push(`${where}: no checked date`);
      continue;
    }
    const checked = new Date(val.checked);
    if (Number.isNaN(checked.getTime())) {
      errors.push(`${where}: checked is not a date (${val.checked})`);
      continue;
    }
    const age = Math.floor((today - checked) / 86400000);
    if (age > MAX_AGE_DAYS) {
      (strict ? errors : warnings).push(`${where}: last checked ${val.checked}, ${age} days ago (source: ${val.source})`);
    }
  }
}

for (const w of warnings) console.warn(`warning: ${w}`);
for (const e of errors) console.error(`error: ${e}`);
if (errors.length) process.exit(1);
console.log(`compare data OK: ${products.length} products, ${rows.length} rows${warnings.length ? `, ${warnings.length} stale` : ''}`);
