import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const seller = await sql`SELECT * FROM seller_defaults LIMIT 1`;
    if (seller.length === 0) {
      return NextResponse.json(null);
    }
    return NextResponse.json(seller[0]);
  } catch (error) {
    console.error('Database error in GET /api/seller:', error);
    return NextResponse.json(null, { status: 200 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    return NextResponse.json({ message: 'Seller defaults saved endpoint reached', data: body });
  } catch (error) {
    console.error('Error in POST /api/seller:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
