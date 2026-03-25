import { NextRequest, NextResponse } from 'next/server';
import { readInventory, writeInventory } from '@/lib/storage';
import { PRODUCTS } from '@/lib/products';

export async function GET() {
  const inventory = readInventory();
  const result = PRODUCTS.map((p) => {
    const inv = inventory.find((i) => i.productId === p.id);
    return inv ?? { productId: p.id, availableUnits: 0 };
  });
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { productId, packagesToAdd } = body as {
    productId: string;
    packagesToAdd: number;
  };

  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) {
    return NextResponse.json({ error: 'Unbekanntes Produkt' }, { status: 400 });
  }

  const inventory = readInventory();
  let inv = inventory.find((i) => i.productId === productId);
  if (!inv) {
    inv = { productId, availableUnits: 0 };
    inventory.push(inv);
  }
  inv.availableUnits += packagesToAdd * product.unitsPerPackage;
  writeInventory(inventory);

  return NextResponse.json(inv);
}
