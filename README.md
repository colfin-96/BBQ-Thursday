# BBQ Thursday – Bestellportal 🔥

A Next.js 14 order portal for BBQ Thursday events. Employees can order grilled goods in advance; admins manage inventory and track payments.

## Features

- **Order form** (`/`) – product selection with quantity picker, live total, inventory-aware
- **Order confirmation** (`/bestellung/[id]`) – order summary with PayPal payment button
- **Admin panel** (`/verwaltung`) – inventory management, order overview, mark-as-paid

## Products

| Product | Package Price | Units/Package |
|---------|--------------|---------------|
| Bratwurst | €5.99 | 10 |
| Vegane Wurst | €7.99 | 10 |
| Nackensteak | €9.99 | 5 |
| Putensteak | €8.99 | 5 |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the order form.

## Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_PAYPAL_LINK=https://paypal.me/your-username
```

## Tech Stack

- [Next.js 14](https://nextjs.org/) App Router
- TypeScript
- Tailwind CSS
- JSON file storage (`data/orders.json`, `data/inventory.json`)
- System fonts (no external font requests required)
