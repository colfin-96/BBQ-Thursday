import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 'bratwurst',
    name: 'Bratwurst',
    pricePerPackage: 5.99,
    unitsPerPackage: 10,
  },
  {
    id: 'vegane-wurst',
    name: 'Vegane Wurst',
    pricePerPackage: 7.99,
    unitsPerPackage: 10,
  },
  {
    id: 'nackensteak',
    name: 'Nackensteak',
    pricePerPackage: 9.99,
    unitsPerPackage: 5,
  },
  {
    id: 'putensteak',
    name: 'Putensteak',
    pricePerPackage: 8.99,
    unitsPerPackage: 5,
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function pricePerUnit(product: Product): number {
  return product.pricePerPackage / product.unitsPerPackage;
}
