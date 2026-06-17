import sql from '@/lib/db';
import { getCorsResponse, getErrorResponse, handleOptions } from '@/utils/apiHelper';

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(req) {
  try {
    // Cascade delete/truncate all user data tables in Neon Postgres
    await sql`TRUNCATE TABLE invoice_items CASCADE`;
    await sql`TRUNCATE TABLE invoices CASCADE`;
    await sql`TRUNCATE TABLE clients CASCADE`;
    await sql`TRUNCATE TABLE seller_profiles CASCADE`;

    return getCorsResponse({ 
      success: true, 
      message: 'Account data database rows wiped successfully.' 
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    return getErrorResponse('Failed to delete account tables.', 500);
  }
}
