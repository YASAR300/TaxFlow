import sql from '@/lib/db';
import { getCorsResponse, getErrorResponse, handleOptions } from '@/utils/apiHelper';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    let clients;
    if (search) {
      const term = `%${search}%`;
      clients = await sql`
        SELECT 
          c.id, c.business_name, c.contact_name, c.address, c.city, c.state, c.state_code, c.pin_code, c.gstin, c.pan, c.email, c.phone, c.created_at, c.updated_at,
          COALESCE(COUNT(CASE WHEN i.status != 'cancelled' THEN 1 END), 0)::integer AS invoice_count,
          COALESCE(SUM(CASE WHEN i.status != 'cancelled' THEN i.grand_total ELSE 0 END), 0)::float AS total_invoiced
        FROM clients c
        LEFT JOIN invoices i ON 
          (c.gstin IS NOT NULL AND c.gstin = i.buyer_data->>'gstin') 
          OR (c.email IS NOT NULL AND c.email = i.buyer_data->>'email') 
          OR (c.business_name = i.buyer_data->>'business_name')
        WHERE c.business_name ILIKE ${term}
           OR c.gstin ILIKE ${term}
           OR c.email ILIKE ${term}
        GROUP BY c.id
        ORDER BY c.business_name ASC
      `;
    } else {
      clients = await sql`
        SELECT 
          c.id, c.business_name, c.contact_name, c.address, c.city, c.state, c.state_code, c.pin_code, c.gstin, c.pan, c.email, c.phone, c.created_at, c.updated_at,
          COALESCE(COUNT(CASE WHEN i.status != 'cancelled' THEN 1 END), 0)::integer AS invoice_count,
          COALESCE(SUM(CASE WHEN i.status != 'cancelled' THEN i.grand_total ELSE 0 END), 0)::float AS total_invoiced
        FROM clients c
        LEFT JOIN invoices i ON 
          (c.gstin IS NOT NULL AND c.gstin = i.buyer_data->>'gstin') 
          OR (c.email IS NOT NULL AND c.email = i.buyer_data->>'email') 
          OR (c.business_name = i.buyer_data->>'business_name')
        GROUP BY c.id
        ORDER BY c.business_name ASC
      `;
    }

    return getCorsResponse(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return getErrorResponse('Internal Server Error', 500);
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      id, business_name, contact_name, address, city, state,
      state_code, pin_code, gstin, pan, email, phone
    } = body;

    if (!business_name) {
      return getErrorResponse('Business name is required', 400);
    }

    let existingClient = null;
    if (id) {
      const results = await sql`SELECT * FROM clients WHERE id = ${id} LIMIT 1`;
      if (results.length > 0) {
        existingClient = results[0];
      }
    }

    if (!existingClient && gstin && gstin.trim()) {
      const results = await sql`SELECT * FROM clients WHERE gstin = ${gstin.trim()} LIMIT 1`;
      if (results.length > 0) {
        existingClient = results[0];
      }
    }

    let saved;
    if (existingClient) {
      const updated = await sql`
        UPDATE clients
        SET
          business_name = ${business_name},
          contact_name = ${contact_name || null},
          address = ${address || null},
          city = ${city || null},
          state = ${state || null},
          state_code = ${state_code || null},
          pin_code = ${pin_code || null},
          gstin = ${gstin || null},
          pan = ${pan || null},
          email = ${email || null},
          phone = ${phone || null},
          updated_at = NOW()
        WHERE id = ${existingClient.id}
        RETURNING *
      `;
      saved = updated[0];
    } else {
      const inserted = await sql`
        INSERT INTO clients (
          business_name, contact_name, address, city, state,
          state_code, pin_code, gstin, pan, email, phone
        ) VALUES (
          ${business_name}, ${contact_name || null}, ${address || null}, ${city || null}, ${state || null},
          ${state_code || null}, ${pin_code || null}, ${gstin ? gstin.trim() : null}, ${pan || null}, ${email || null}, ${phone || null}
        )
        RETURNING *
      `;
      saved = inserted[0];
    }

    return getCorsResponse(saved, 201);
  } catch (error) {
    console.error('Error saving client:', error);
    return getErrorResponse('Internal Server Error', 500);
  }
}
