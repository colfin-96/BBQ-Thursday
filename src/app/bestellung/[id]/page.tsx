import { notFound } from 'next/navigation';
import Link from 'next/link';
import { readOrders } from '@/lib/storage';
import { getProduct, pricePerUnit } from '@/lib/products';
import { formatPrice, formatDateTime } from '@/lib/format';

export default function BestellungPage({ params }: { params: { id: string } }) {
  const orders = readOrders();
  const order = orders.find((o) => o.id === params.id);
  if (!order) notFound();

  const paypalLink = process.env.NEXT_PUBLIC_PAYPAL_LINK ?? '#';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
        <span className="text-3xl">✅</span>
        <div>
          <div className="font-bold text-green-800">Bestellung aufgenommen!</div>
          <div className="text-green-600 text-sm">Bitte überweise den Betrag via PayPal.</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Bestellübersicht</h2>

        <div className="text-sm text-gray-500 space-y-1">
          <div><span className="font-medium">Bestellnummer:</span> {order.id.slice(0, 8).toUpperCase()}</div>
          <div><span className="font-medium">Name:</span> {order.customerName}</div>
          <div><span className="font-medium">E-Mail:</span> {order.customerEmail}</div>
          <div><span className="font-medium">Datum:</span> {formatDateTime(order.createdAt)}</div>
          <div>
            <span className="font-medium">Status:</span>{' '}
            <span className={order.status === 'paid' ? 'text-green-600 font-semibold' : 'text-amber-600 font-semibold'}>
              {order.status === 'paid' ? 'Bezahlt' : 'Ausstehend'}
            </span>
          </div>
        </div>

        <hr />

        <h3 className="font-semibold text-gray-700">Bestellte Artikel</h3>
        <div className="space-y-2">
          {order.items.map((item) => {
            const product = getProduct(item.productId);
            if (!product) return null;
            const unitPrice = pricePerUnit(product);
            const subtotal = unitPrice * item.quantity;
            return (
              <div key={item.productId} className="flex justify-between text-sm">
                <span>{item.quantity} × {product.name}</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
            );
          })}
        </div>

        <hr />

        <div className="flex justify-between items-center">
          <span className="font-bold text-gray-700 text-lg">Gesamt</span>
          <span className="font-bold text-2xl text-orange-600">{formatPrice(order.totalEuros)}</span>
        </div>
      </div>

      {order.status !== 'paid' && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6 text-center space-y-3">
          <p className="text-gray-700 font-medium">Bitte überweise <strong>{formatPrice(order.totalEuros)}</strong> via PayPal:</p>
          <a
            href={`${paypalLink}/${order.totalEuros}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#0070ba] hover:bg-[#005ea6] text-white font-bold py-3 px-8 rounded-xl transition-colors"
          >
            💳 Mit PayPal bezahlen
          </a>
          <p className="text-xs text-gray-500">
            Betrag: {formatPrice(order.totalEuros)} · Verwendungszweck: {order.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
      )}

      <div className="mt-6 text-center">
        <Link href="/" className="text-orange-600 hover:underline text-sm">
          ← Neue Bestellung aufgeben
        </Link>
      </div>
    </div>
  );
}
