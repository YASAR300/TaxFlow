/**
 * seed.mjs — Seed sample Indian business data
 * Usage: node src/lib/seed.mjs
 *
 * Uses @neondatabase/serverless (HTTP transport) — works even when
 * outbound TCP port 5432 is blocked by a firewall or ISP.
 */

import { neon } from '@neondatabase/serverless';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

// ── Load .env.local ───────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = resolve(__dirname, '../../.env.local');
  if (!existsSync(envPath)) return;
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

// ── Helpers ───────────────────────────────────────────────────────────────────
// sql.query(string, params?) → { rows: [...] }
// We wrap it to always return the rows array directly.
function makeDb(sql) {
  return async (query, params = []) => {
    const result = await sql.query(query, params);
    return result.rows ?? result;
  };
}

// ── Seed data ─────────────────────────────────────────────────────────────────

const sellerProfile = {
  business_name : 'Sharma Enterprises Pvt. Ltd.',
  owner_name    : 'Rajesh Sharma',
  address       : '42, Industrial Area, Phase II',
  city          : 'New Delhi',
  state         : 'Delhi',
  state_code    : '07',
  pin_code      : '110020',
  gstin         : '07AABCS1234A1Z5',
  pan           : 'AABCS1234A',
  email         : 'billing@sharmaenterprises.in',
  phone         : '+91-9810012345',
  website       : 'https://www.sharmaenterprises.in',
  logo_url      : null,
  is_default    : true,
};

const clients = [
  {
    business_name : 'Mehta & Sons Trading Co.',
    contact_name  : 'Ankit Mehta',
    address       : '15, Linking Road, Bandra West',
    city          : 'Mumbai',
    state         : 'Maharashtra',
    state_code    : '27',
    pin_code      : '400050',
    gstin         : '27AABCM5678B2Z1',
    pan           : 'AABCM5678B',
    email         : 'accounts@mehtasons.com',
    phone         : '+91-9820056789',
  },
  {
    business_name : 'Bangalore Tech Solutions LLP',
    contact_name  : 'Priya Nair',
    address       : '301, Brigade Road, MG Road Area',
    city          : 'Bengaluru',
    state         : 'Karnataka',
    state_code    : '29',
    pin_code      : '560001',
    gstin         : '29AABCB9012C3Z7',
    pan           : 'AABCB9012C',
    email         : 'finance@bangaloretechsol.com',
    phone         : '+91-9741023456',
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function seed() {
  const sql = neon(DATABASE_URL);
  const db  = makeDb(sql);

  console.log('\n🌱  Starting database seed (HTTP transport)...\n');

  // ── Seller Profile ──────────────────────────────────────────────────────────
  const existingSeller = await db(
    `SELECT id FROM seller_profiles WHERE gstin = $1 OR business_name = $2 LIMIT 1`,
    [sellerProfile.gstin, sellerProfile.business_name]
  );

  if (existingSeller.length > 0) {
    console.log(`  ⏭  Seller already exists — skipping: ${sellerProfile.business_name}`);
  } else {
    await db(
      `INSERT INTO seller_profiles
        (business_name, owner_name, address, city, state, state_code,
         pin_code, gstin, pan, email, phone, website, logo_url, is_default)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [
        sellerProfile.business_name, sellerProfile.owner_name,
        sellerProfile.address,       sellerProfile.city,
        sellerProfile.state,         sellerProfile.state_code,
        sellerProfile.pin_code,      sellerProfile.gstin,
        sellerProfile.pan,           sellerProfile.email,
        sellerProfile.phone,         sellerProfile.website,
        sellerProfile.logo_url,      sellerProfile.is_default,
      ]
    );
    console.log(`  ✅  Seller profile created: ${sellerProfile.business_name}`);
  }

  // ── Clients ─────────────────────────────────────────────────────────────────
  for (const cl of clients) {
    const existing = await db(
      `SELECT id FROM clients WHERE gstin = $1 OR business_name = $2 LIMIT 1`,
      [cl.gstin, cl.business_name]
    );

    if (existing.length > 0) {
      console.log(`  ⏭  Client already exists — skipping: ${cl.business_name}`);
    } else {
      await db(
        `INSERT INTO clients
          (business_name, contact_name, address, city, state, state_code,
           pin_code, gstin, pan, email, phone, total_invoiced, invoice_count)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [
          cl.business_name, cl.contact_name,
          cl.address,       cl.city,
          cl.state,         cl.state_code,
          cl.pin_code,      cl.gstin,
          cl.pan,           cl.email,
          cl.phone,         0,
          0,
        ]
      );
      console.log(`  ✅  Client created: ${cl.business_name}`);
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────────────
  const [sellerRow] = await db(`SELECT COUNT(*) AS count FROM seller_profiles`);
  const [clientRow] = await db(`SELECT COUNT(*) AS count FROM clients`);

  console.log('\n──────────────────────────────────────────');
  console.log(`  seller_profiles : ${sellerRow.count} row(s)`);
  console.log(`  clients         : ${clientRow.count} row(s)`);
  console.log('──────────────────────────────────────────');
  console.log('\n🎉  Seed completed successfully!\n');
}

seed().catch(err => {
  console.error('❌  Seed failed:', err.message || err);
  process.exit(1);
});
