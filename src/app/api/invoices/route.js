import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const invoices = await sql`SELECT * FROM invoices ORDER BY created_at DESC`;
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Database error in GET /api/invoices:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    return NextResponse.json({ message: 'Invoice creation endpoint reached', data: body }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/invoices:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
