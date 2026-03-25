import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BBQ Thursday – Bestellportal',
  description: 'Bestelle deine Grillwaren für den nächsten BBQ-Donnerstag',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="font-sans">
        <header className="bg-orange-600 text-white py-4 shadow-md">
          <div className="max-w-4xl mx-auto px-4 flex items-center gap-3">
            <span className="text-3xl">🔥</span>
            <div>
              <h1 className="text-2xl font-bold">BBQ Thursday</h1>
              <p className="text-orange-200 text-sm">Grillbestellung</p>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
        <footer className="border-t mt-12 py-6 text-center text-gray-500 text-sm">
          BBQ Thursday – Guten Hunger! 🍖
        </footer>
      </body>
    </html>
  );
}
