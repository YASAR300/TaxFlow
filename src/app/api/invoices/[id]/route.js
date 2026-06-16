import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request, { params }) {
  const { id } = params;
  try {
    const invoices = await sql`SELECT * FROM invoices WHERE id = ${id}`;
    if (invoices.length === 0) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    return NextResponse.json(invoices[0]);
  } catch (error) {
    console.error(`Database error in GET /api/invoices/${id}:`, error);
    return NextResponse.json({ error: 'Invoice not found or database error' }, { status: 404 });
  }
}

export async function PUT(request, { params }) {
  const { id } = params;
  try {
    const body = await request.json();
    return NextResponse.json({ message: `Invoice ${id} update endpoint reached`, data: body });
  } catch (error) {
    console.error(`Error in PUT /api/invoices/${id}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    return NextResponse.json({ message: `Invoice ${id} delete endpoint reached` });
  } catch (error) {
    console.error(`Error in DELETE /api/invoices/${id}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
