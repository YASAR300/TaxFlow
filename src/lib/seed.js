/**
 * seed.js — Seed sample Indian business data
 * Usage: node src/lib/seed.js
 *
 * Seeds:
 *   • 1 seller profile  (default business)
 *   • 2 clients
 *
 * Safe to run multiple times — checks for existing records by GSTIN/business name.
 */

'use strict';

const path = require('path');
const fs   = require('fs');

// ── Load .env.local ───────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.resolve(__dirname, '../../.env.local');
  if (!fs.existsSync(envPath)) return;
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
 * Strip libpq-only params (channel_binding) that pg driver doesn't support.
 */
function buildConnectionString(raw) {
  try {
    const url = new URL(raw);
    url.searchParams.delete('channel_binding');
    if (!url.searchParams.has('sslmode')) url.searchParams.set('sslmode', 'require');
    return url.toString();
  } catch {
    return raw;
  }
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
    total_invoiced: 0,
    invoice_count : 0,
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
    total_invoiced: 0,
    invoice_count : 0,
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function seed() {
  const rawUrl = process.env.DATABASE_URL;

  if (!rawUrl) {
    console.error('❌  DATABASE_URL is not set.');
    process.exit(1);
  }

  const databaseUrl = buildConnectionString(rawUrl);

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  console.log('\n🌱  Starting database seed...\n');

  try {
    await client.connect();
    console.log('✅  Connected to Neon PostgreSQL\n');

    // ── Seller Profile ───────────────────────────────────────────────────────
    const existingSeller = await client.query(
      `SELECT id FROM seller_profiles WHERE gstin = $1 OR business_name = $2 LIMIT 1`,
      [sellerProfile.gstin, sellerProfile.business_name]
    );

    if (existingSeller.rowCount > 0) {
      console.log(`  ⏭  Seller profile already exists — skipping: ${sellerProfile.business_name}`);
    } else {
      await client.query(
        `INSERT INTO seller_profiles
          (business_name, owner_name, address, city, state, state_code,
           pin_code, gstin, pan, email, phone, website, logo_url, is_default)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [
          sellerProfile.business_name,
          sellerProfile.owner_name,
          sellerProfile.address,
          sellerProfile.city,
          sellerProfile.state,
          sellerProfile.state_code,
          sellerProfile.pin_code,
          sellerProfile.gstin,
          sellerProfile.pan,
          sellerProfile.email,
          sellerProfile.phone,
          sellerProfile.website,
          sellerProfile.logo_url,
          sellerProfile.is_default,
        ]
      );
      console.log(`  ✅  Seller profile created: ${sellerProfile.business_name}`);
    }

    // ── Clients ──────────────────────────────────────────────────────────────
    for (const cl of clients) {
      const existingClient = await client.query(
        `SELECT id FROM clients WHERE gstin = $1 OR business_name = $2 LIMIT 1`,
        [cl.gstin, cl.business_name]
      );

      if (existingClient.rowCount > 0) {
        console.log(`  ⏭  Client already exists — skipping: ${cl.business_name}`);
      } else {
        await client.query(
          `INSERT INTO clients
            (business_name, contact_name, address, city, state, state_code,
             pin_code, gstin, pan, email, phone, total_invoiced, invoice_count)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
          [
            cl.business_name,
            cl.contact_name,
            cl.address,
            cl.city,
            cl.state,
            cl.state_code,
            cl.pin_code,
            cl.gstin,
            cl.pan,
            cl.email,
            cl.phone,
            cl.total_invoiced,
            cl.invoice_count,
          ]
        );
        console.log(`  ✅  Client created: ${cl.business_name}`);
      }
    }

    // ── Summary ──────────────────────────────────────────────────────────────
    const sellerCount = await client.query(`SELECT COUNT(*) FROM seller_profiles`);
    const clientCount = await client.query(`SELECT COUNT(*) FROM clients`);

    console.log('\n──────────────────────────────────────────');
    console.log(`  seller_profiles : ${sellerCount.rows[0].count} row(s)`);
    console.log(`  clients         : ${clientCount.rows[0].count} row(s)`);
    console.log('──────────────────────────────────────────');
    console.log('\n🎉  Seed completed successfully!\n');

  } catch (err) {
    console.error('❌  Seed failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
