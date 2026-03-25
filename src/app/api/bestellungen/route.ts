import { NextRequest, NextResponse } from 'next/server';
import { readOrders, writeOrders, readInventory, writeInventory } from '@/lib/storage';
import { Order, OrderItem } from '@/lib/types';
import { getProduct, pricePerUnit } from '@/lib/products';
import { randomUUID } from 'crypto';

export async function GET() {
  const orders = readOrders();
  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { customerName, customerEmail, items } = body as {
    customerName: string;
    customerEmail: string;
    items: OrderItem[];
  };

  if (!customerName || !customerEmail || !items || items.length === 0) {
    return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 });
  }

  // Check inventory
  const inventory = readInventory();
  for (const item of items) {
    if (item.quantity <= 0) continue;
    const inv = inventory.find((i) => i.productId === item.productId);
    if (!inv || inv.availableUnits < item.quantity) {
      return NextResponse.json(
        { error: `Nicht genug Vorrat für ${item.productId}` },
        { status: 400 }
      );
    }
  }

  // Calculate total
  let totalEuros = 0;
  for (const item of items) {
    if (item.quantity <= 0) continue;
    const product = getProduct(item.productId);
    if (!product) {
      return NextResponse.json({ error: `Unbekanntes Produkt: ${item.productId}` }, { status: 400 });
    }
    totalEuros += pricePerUnit(product) * item.quantity;
  }
  totalEuros = Math.round(totalEuros * 100) / 100;

  // Deduct from inventory
  const filteredItems = items.filter((i) => i.quantity > 0);
  for (const item of filteredItems) {
    const inv = inventory.find((i) => i.productId === item.productId);
    if (inv) {
      inv.availableUnits -= item.quantity;
    }
  }
  writeInventory(inventory);

  // Create order
  const order: Order = {
    id: randomUUID(),
    customerName,
    customerEmail,
    items: filteredItems,
    totalEuros,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };

  const orders = readOrders();
  orders.push(order);
  writeOrders(orders);

  return NextResponse.json(order, { status: 201 });
}
