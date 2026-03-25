'use client';

import { useState, useEffect, useCallback } from 'react';
import { InventoryItem, Order } from '@/lib/types';
import { PRODUCTS, pricePerUnit } from '@/lib/products';
import { formatPrice, formatDateTime } from '@/lib/format';

export default function VerwaltungPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [packagesToAdd, setPackagesToAdd] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadData = useCallback(async () => {
    const [invRes, ordRes] = await Promise.all([
      fetch('/api/inventar'),
      fetch('/api/bestellungen'),
    ]);
    const [inv, ord] = await Promise.all([invRes.json(), ordRes.json()]);
    setInventory(inv);
    setOrders(ord);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  function getAvailable(productId: string): number {
    return inventory.find((i) => i.productId === productId)?.availableUnits ?? 0;
  }

  async function addPackages(productId: string) {
    const n = packagesToAdd[productId] ?? 1;
    if (n <= 0) return;
    await fetch('/api/inventar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, packagesToAdd: n }),
    });
    setMessage(`${n} Packung(en) hinzugefügt!`);
    setTimeout(() => setMessage(''), 3000);
    setPackagesToAdd((p) => ({ ...p, [productId]: 1 }));
    await loadData();
  }

  async function markPaid(orderId: string) {
    await fetch(`/api/bestellungen/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'paid' }),
    });
    await loadData();
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Lade Daten…</div>;

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const totalRevenue = orders.filter((o) => o.status === 'paid').reduce((s, o) => s + o.totalEuros, 0);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">🛠 Verwaltung</h2>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm">
          ✅ {message}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-4 text-center">
          <div className="text-3xl font-bold text-gray-800">{totalOrders}</div>
          <div className="text-sm text-gray-500 mt-1">Bestellungen gesamt</div>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <div className="text-3xl font-bold text-amber-600">{pendingOrders}</div>
          <div className="text-sm text-gray-500 mt-1">Ausstehend</div>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{formatPrice(totalRevenue)}</div>
          <div className="text-sm text-gray-500 mt-1">Eingenommen</div>
        </div>
      </div>

      {/* Inventory */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">📦 Inventar</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 pr-4">Produkt</th>
                <th className="pb-2 pr-4">Preis/Packung</th>
                <th className="pb-2 pr-4">Stück/Packung</th>
                <th className="pb-2 pr-4">Preis/Stück</th>
                <th className="pb-2 pr-4">Verfügbar</th>
                <th className="pb-2">Packungen hinzufügen</th>
              </tr>
            </thead>
            <tbody>
              {PRODUCTS.map((product) => {
                const available = getAvailable(product.id);
                const unitPrice = pricePerUnit(product);
                const packages = packagesToAdd[product.id] ?? 1;
                return (
                  <tr key={product.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{product.name}</td>
                    <td className="py-3 pr-4">{formatPrice(product.pricePerPackage)}</td>
                    <td className="py-3 pr-4">{product.unitsPerPackage}</td>
                    <td className="py-3 pr-4">{formatPrice(unitPrice)}</td>
                    <td className="py-3 pr-4">
                      <span className={available === 0 ? 'text-red-500 font-semibold' : available <= 3 ? 'text-amber-500 font-semibold' : 'text-green-600 font-semibold'}>
                        {available}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          value={packages}
                          onChange={(e) => setPackagesToAdd((p) => ({ ...p, [product.id]: parseInt(e.target.value) || 1 }))}
                          className="w-16 border rounded px-2 py-1 text-sm"
                        />
                        <button
                          onClick={() => addPackages(product.id)}
                          className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-3 py-1 rounded-lg transition-colors"
                        >
                          + Hinzufügen
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Orders */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">📋 Bestellungen</h3>
        {orders.length === 0 ? (
          <p className="text-gray-500 text-sm">Noch keine Bestellungen.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 pr-4">Nr.</th>
                  <th className="pb-2 pr-4">Name</th>
                  <th className="pb-2 pr-4">Datum</th>
                  <th className="pb-2 pr-4">Artikel</th>
                  <th className="pb-2 pr-4">Gesamt</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {[...orders].reverse().map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-mono text-xs text-gray-500">{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="py-3 pr-4 font-medium">{order.customerName}</td>
                    <td className="py-3 pr-4 text-gray-500">{formatDateTime(order.createdAt)}</td>
                    <td className="py-3 pr-4">
                      {order.items.map((item) => {
                        const p = PRODUCTS.find((x) => x.id === item.productId);
                        return p ? `${item.quantity}× ${p.name}` : item.productId;
                      }).join(', ')}
                    </td>
                    <td className="py-3 pr-4 font-semibold">{formatPrice(order.totalEuros)}</td>
                    <td className="py-3">
                      {order.status === 'paid' ? (
                        <span className="text-green-600 font-semibold">✅ Bezahlt</span>
                      ) : (
                        <button
                          onClick={() => markPaid(order.id)}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-2 py-1 rounded transition-colors"
                        >
                          Als bezahlt markieren
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
