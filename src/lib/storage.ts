import fs from 'fs';
import path from 'path';
import { Order, InventoryItem } from './types';
import { PRODUCTS } from './products';

const DATA_DIR = path.join(process.cwd(), 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const INVENTORY_FILE = path.join(DATA_DIR, 'inventory.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readOrders(): Order[] {
  ensureDataDir();
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, '[]', 'utf-8');
    return [];
  }
  const content = fs.readFileSync(ORDERS_FILE, 'utf-8');
  return JSON.parse(content) as Order[];
}

export function writeOrders(orders: Order[]): void {
  ensureDataDir();
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
}

export function readInventory(): InventoryItem[] {
  ensureDataDir();
  if (!fs.existsSync(INVENTORY_FILE)) {
    const defaultInventory: InventoryItem[] = PRODUCTS.map((p) => ({
      productId: p.id,
      availableUnits: 0,
    }));
    fs.writeFileSync(INVENTORY_FILE, JSON.stringify(defaultInventory, null, 2), 'utf-8');
    return defaultInventory;
  }
  const content = fs.readFileSync(INVENTORY_FILE, 'utf-8');
  return JSON.parse(content) as InventoryItem[];
}

export function writeInventory(inventory: InventoryItem[]): void {
  ensureDataDir();
  fs.writeFileSync(INVENTORY_FILE, JSON.stringify(inventory, null, 2), 'utf-8');
}
