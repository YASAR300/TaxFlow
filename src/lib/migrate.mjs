/**
 * migrate.mjs — Run database schema migrations via Neon HTTP driver
 * Usage: node src/lib/migrate.mjs
 *
 * Uses @neondatabase/serverless (HTTP transport) — works even when
 * outbound TCP port 5432 is blocked by a firewall or ISP.
 */

import { neon } from '@neondatabase/serverless';
import { readFileSync, existsSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

// ── Load .env.local ───────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = resolve(__dirname, '../../.env.local');
  if (!existsSync(envPath)) {
    console.warn('⚠  .env.local not found.');
    return;
  }
  const lines = readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key   = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌  DATABASE_URL is not set.');
  process.exit(1);
}

// ── SQL splitter (handles $$...$$ dollar-quote blocks) ────────────────────────
function splitStatements(sql) {
  const statements = [];
  let current = '';
  let inDollarQuote = false;
  let i = 0;

  while (i < sql.length) {
    if (sql[i] === '$' && sql[i + 1] === '$') {
      inDollarQuote = !inDollarQuote;
      current += '$$';
      i += 2;
      continue;
    }
    if (sql[i] === ';' && !inDollarQuote) {
      current += ';';
      const trimmed = current.trim();
      if (trimmed && trimmed !== ';') statements.push(trimmed);
      current = '';
      i++;
      continue;
    }
    current += sql[i];
    i++;
  }
  const leftover = current.trim();
  if (leftover && leftover !== ';') statements.push(leftover);

  // Remove statements that are purely SQL comments (no actual SQL keywords)
  return statements.filter(stmt => {
    const noComments = stmt.replace(/--[^\n]*/g, '').trim().replace(/;$/, '').trim();
    return noComments.length > 0;
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function migrate() {
  const schemaPath = join(__dirname, 'schema.sql');
  if (!existsSync(schemaPath)) {
    console.error('❌  schema.sql not found at:', schemaPath);
    process.exit(1);
  }

  const schemaSql  = readFileSync(schemaPath, 'utf8');
  const statements = splitStatements(schemaSql);

  console.log('\n🚀  Starting database migration (HTTP transport)...\n');

  // neon() returns a tagged-template SQL function.
  // Calling sql(string) executes a raw query string over HTTP — no TCP needed.
  const sql = neon(DATABASE_URL);

  let successCount = 0;
  let errorCount   = 0;

  for (const stmt of statements) {
    const preview = stmt.replace(/\s+/g, ' ').slice(0, 80);
    try {
      await sql.query(stmt);
      console.log(`  ✔  ${preview}...`);
      successCount++;
    } catch (err) {
      console.error(`  ✘  FAILED: ${preview}...`);
      console.error(`     Reason: ${err.message}\n`);
      errorCount++;
    }
  }

  console.log('\n──────────────────────────────────────────');
  console.log(`  Statements executed : ${successCount + errorCount}`);
  console.log(`  ✅ Succeeded         : ${successCount}`);
  if (errorCount > 0) console.log(`  ❌ Failed            : ${errorCount}`);
  console.log('──────────────────────────────────────────\n');

  // Verify all 4 tables exist
  const result = await sql.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('seller_profiles','clients','invoices','invoice_items')
    ORDER BY table_name;
  `);

  const found    = (result.rows || result).map(r => r.table_name);
  const expected = ['clients', 'invoice_items', 'invoices', 'seller_profiles'];
  console.log('📋  Tables verified in database:');
  for (const t of expected) {
    console.log(`  ${found.includes(t) ? '✅' : '❌'}  ${t}`);
  }
  console.log();

  if (errorCount === 0) {
    console.log('🎉  Migration completed successfully!\n');
  } else {
    console.log('⚠   Migration completed with errors. Check output above.\n');
    process.exit(1);
  }
}

migrate().catch(err => {
  console.error('❌  Unexpected error:', err.message || err);
  process.exit(1);
});
