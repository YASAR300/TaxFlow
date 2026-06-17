/**
 * migrate.js — Run database schema migrations
 * Usage: node src/lib/migrate.js
 *
 * Uses `pg` (CommonJS) so it can run directly with Node without transpilation.
 * DATABASE_URL is loaded from .env.local automatically.
 */

'use strict';

const path = require('path');
const fs   = require('fs');

// ── Load .env.local manually ──────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.resolve(__dirname, '../../.env.local');
  if (!fs.existsSync(envPath)) {
    console.warn('⚠  .env.local not found — make sure DATABASE_URL is set.');
    return;
  }
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
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

const { Client } = require('pg');

/**
 * Parse a postgres:// URL into a plain pg.Client config object.
 * We do this manually so we never pass conflicting sslmode/ssl options —
 * the pg driver silently fails with an empty error when they conflict.
 */
function parseDbUrl(raw) {
  const url = new URL(raw);
  return {
    host     : url.hostname,
    port     : parseInt(url.port || '5432', 10),
    database : url.pathname.replace(/^\//, ''),
    user     : decodeURIComponent(url.username),
    password : decodeURIComponent(url.password),
    ssl      : { rejectUnauthorized: false }, // Neon requires SSL; skip cert check
  };
}

async function migrate() {
  const rawUrl = process.env.DATABASE_URL;

  if (!rawUrl) {
    console.error('❌  DATABASE_URL environment variable is not set.');
    process.exit(1);
  }

  let clientConfig;
  try {
    clientConfig = parseDbUrl(rawUrl);
  } catch (parseErr) {
    console.error('❌  Failed to parse DATABASE_URL:', parseErr.message);
    process.exit(1);
  }

  const schemaPath = path.join(__dirname, 'schema.sql');
  if (!fs.existsSync(schemaPath)) {
    console.error('❌  schema.sql not found at:', schemaPath);
    process.exit(1);
  }

  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  console.log('\n🚀  Starting database migration...');
  console.log(`    Host: ${clientConfig.host}`);
  console.log(`    DB  : ${clientConfig.database}\n`);

  const client = new Client(clientConfig);

  try {
    await client.connect();
    console.log('✅  Connected to Neon PostgreSQL\n');

    const statements = splitStatements(schemaSql);
    let successCount = 0;
    let errorCount   = 0;

    for (const stmt of statements) {
      const preview = stmt.replace(/\s+/g, ' ').slice(0, 80);
      try {
        await client.query(stmt);
        console.log(`  ✔  ${preview}...`);
        successCount++;
      } catch (err) {
        console.error(`  ✘  FAILED: ${preview}...`);
        console.error(`     Reason: ${err.message || JSON.stringify(err)}\n`);
        errorCount++;
      }
    }

    console.log('\n──────────────────────────────────────────');
    console.log(`  Statements executed : ${successCount + errorCount}`);
    console.log(`  ✅ Succeeded         : ${successCount}`);
    if (errorCount > 0) console.log(`  ❌ Failed            : ${errorCount}`);
    console.log('──────────────────────────────────────────\n');

    // Verify all 4 tables exist
    const { rows } = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('seller_profiles','clients','invoices','invoice_items')
      ORDER BY table_name;
    `);
    const found    = rows.map(r => r.table_name);
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
  } catch (err) {
    // Log full error — err.message is sometimes empty for SSL/auth failures
    console.error('❌  Migration failed:', err.message || err.code || JSON.stringify(err));
    if (err.stack) console.error(err.stack);
    process.exit(1);
  } finally {
    try { await client.end(); } catch (_) { /* ignore */ }
  }
}

/**
 * Splits SQL into individual statements while correctly handling dollar-quoted
 * function bodies ($$...$$) so interior semicolons are preserved.
 */
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

  return statements;
}

migrate();
