export interface Product {
  id: string;
  name: string;
  pricePerPackage: number;
  unitsPerPackage: number;
}

export interface InventoryItem {
  productId: string;
  availableUnits: number;
}

export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalEuros: number;
  createdAt: string;
  status: 'pending' | 'paid';
}
