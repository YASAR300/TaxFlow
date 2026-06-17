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
        SELECT * FROM clients
        WHERE business_name ILIKE ${term}
           OR gstin ILIKE ${term}
           OR email ILIKE ${term}
        ORDER BY business_name ASC
      `;
    } else {
      clients = await sql`
        SELECT * FROM clients
        ORDER BY business_name ASC
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
      business_name, contact_name, address, city, state,
      state_code, pin_code, gstin, pan, email, phone
    } = body;

    if (!business_name) {
      return getErrorResponse('Business name is required', 400);
    }

    let existingClient = null;
    if (gstin && gstin.trim()) {
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
