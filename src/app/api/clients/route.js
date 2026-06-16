import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const clients = await sql`SELECT * FROM clients ORDER BY name ASC`;
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Database error in GET /api/clients:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    return NextResponse.json({ message: 'Client saved endpoint reached', data: body }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/clients:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
