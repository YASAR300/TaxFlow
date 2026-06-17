import sql from '@/lib/db';
import { getCorsResponse, getErrorResponse, handleOptions } from '@/utils/apiHelper';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET() {
  try {
    const profiles = await sql`SELECT * FROM seller_profiles WHERE is_default = true LIMIT 1`;
    return getCorsResponse(profiles[0] || null);
  } catch (error) {
    console.error('Error fetching default seller profile:', error);
    return getErrorResponse('Internal Server Error', 500);
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      business_name, owner_name, address, city, state,
      state_code, pin_code, gstin, pan, email, phone,
      website, logo_url
    } = body;

    if (!business_name) {
      return getErrorResponse('Business name is required', 400);
    }

    const existing = await sql`SELECT id FROM seller_profiles WHERE is_default = true LIMIT 1`;

    let saved;
    if (existing.length > 0) {
      const id = existing[0].id;
      const updated = await sql`
        UPDATE seller_profiles
        SET 
          business_name = ${business_name},
          owner_name = ${owner_name || null},
          address = ${address || null},
          city = ${city || null},
          state = ${state || null},
          state_code = ${state_code || null},
          pin_code = ${pin_code || null},
          gstin = ${gstin || null},
          pan = ${pan || null},
          email = ${email || null},
          phone = ${phone || null},
          website = ${website || null},
          logo_url = ${logo_url || null},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      saved = updated[0];
    } else {
      const inserted = await sql`
        INSERT INTO seller_profiles (
          business_name, owner_name, address, city, state,
          state_code, pin_code, gstin, pan, email, phone,
          website, logo_url, is_default
        ) VALUES (
          ${business_name}, ${owner_name || null}, ${address || null}, ${city || null}, ${state || null},
          ${state_code || null}, ${pin_code || null}, ${gstin || null}, ${pan || null}, ${email || null}, ${phone || null},
          ${website || null}, ${logo_url || null}, true
        )
        RETURNING *
      `;
      saved = inserted[0];
    }

    return getCorsResponse(saved, 201);
  } catch (error) {
    console.error('Error saving seller profile:', error);
    return getErrorResponse('Internal Server Error', 500);
  }
}
