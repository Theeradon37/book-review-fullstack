import Link from 'next/link';
import './globals.css';

export const metadata = {
  title: 'BookShelf — Book & Review',
  description: 'Manage books and reviews',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="container header-inner">
            <Link href="/" className="brand">
              📚 BookShelf
            </Link>
            <nav>
              <Link href="/">All books</Link>
              <Link href="/books/new" className="btn primary small">
                + Add book
              </Link>
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
        <footer className="site-footer">Book &amp; Review — Next.js + Express + Prisma</footer>
      </body>
    </html>
  );
}

