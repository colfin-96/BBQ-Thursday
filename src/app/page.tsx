'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product, InventoryItem } from '@/lib/types';
import { PRODUCTS } from '@/lib/products';

function formatPrice(euros: number): string {
  return euros.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}

export default function BestellFormular() {
  const router = useRouter();
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/inventar')
      .then((r) => r.json())
      .then(setInventory)
      .catch(() => {});
  }, []);

  function getAvailable(productId: string): number {
    return inventory.find((i) => i.productId === productId)?.availableUnits ?? 0;
  }

  function pricePerUnit(product: Product): number {
    return product.pricePerPackage / product.unitsPerPackage;
  }

  function total(): number {
    return PRODUCTS.reduce((sum, p) => {
      const qty = quantities[p.id] ?? 0;
      return sum + qty * pricePerUnit(p);
    }, 0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const items = PRODUCTS.map((p) => ({
        productId: p.id,
        quantity: quantities[p.id] ?? 0,
      })).filter((i) => i.quantity > 0);

      if (items.length === 0) {
        setError('Bitte mindestens ein Produkt auswählen.');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/bestellungen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName, customerEmail, items }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Fehler beim Bestellen');
        setLoading(false);
        return;
      }
      const order = await res.json();
      router.push(`/bestellung/${order.id}`);
    } catch {
      setError('Netzwerkfehler. Bitte versuche es erneut.');
      setLoading(false);
    }
  }

  const totalAmount = total();

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🛒 Bestellformular</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal data */}
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Deine Daten</h3>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Name *</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Max Mustermann"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">E-Mail *</label>
            <input
              type="email"
              required
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="max@beispiel.de"
            />
          </div>
        </div>

        {/* Products */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Produkte</h3>
          <div className="space-y-4">
            {PRODUCTS.map((product) => {
              const available = getAvailable(product.id);
              const qty = quantities[product.id] ?? 0;
              const unitPrice = pricePerUnit(product);
              const subtotal = qty * unitPrice;
              const isLow = available > 0 && available <= 3;
              const isOut = available === 0;

              return (
                <div
                  key={product.id}
                  className={`border rounded-lg p-4 ${isOut ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{product.name}</div>
                      <div className="text-sm text-gray-500 mt-0.5">
                        {product.unitsPerPackage} Stück – {formatPrice(product.pricePerPackage)}/Packung
                        &nbsp;·&nbsp;
                        {formatPrice(unitPrice)}/Stück
                      </div>
                      <div className="text-sm mt-1">
                        {isOut ? (
                          <span className="text-red-500 font-medium">Ausverkauft</span>
                        ) : isLow ? (
                          <span className="text-amber-500 font-medium">Noch {available} verfügbar</span>
                        ) : (
                          <span className="text-green-600">{available} verfügbar</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={qty === 0}
                        onClick={() => setQuantities((q) => ({ ...q, [product.id]: Math.max(0, (q[product.id] ?? 0) - 1) }))}
                        className="w-8 h-8 rounded-full border font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-30"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-semibold">{qty}</span>
                      <button
                        type="button"
                        disabled={isOut || qty >= available}
                        onClick={() => setQuantities((q) => ({ ...q, [product.id]: (q[product.id] ?? 0) + 1 }))}
                        className="w-8 h-8 rounded-full border font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {qty > 0 && (
                    <div className="text-sm text-orange-600 font-medium mt-2 text-right">
                      {qty} × {formatPrice(unitPrice)} = {formatPrice(subtotal)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Total */}
        {totalAmount > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex justify-between items-center">
            <span className="font-semibold text-gray-700">Gesamtbetrag:</span>
            <span className="text-2xl font-bold text-orange-600">{formatPrice(totalAmount)}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || totalAmount === 0}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
        >
          {loading ? 'Wird bestellt...' : 'Jetzt bestellen 🍖'}
        </button>
      </form>
    </div>
  );
}
