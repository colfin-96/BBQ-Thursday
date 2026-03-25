import { NextRequest, NextResponse } from 'next/server';
import { readOrders, writeOrders } from '@/lib/storage';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const orders = readOrders();
  const order = orders.find((o) => o.id === params.id);
  if (!order) {
    return NextResponse.json({ error: 'Bestellung nicht gefunden' }, { status: 404 });
  }
  return NextResponse.json(order);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const orders = readOrders();
  const index = orders.findIndex((o) => o.id === params.id);
  if (index === -1) {
    return NextResponse.json({ error: 'Bestellung nicht gefunden' }, { status: 404 });
  }
  orders[index] = { ...orders[index], ...body };
  writeOrders(orders);
  return NextResponse.json(orders[index]);
}
