'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '../lib/api';
import BookCard from '../components/BookCard';

export default function HomePage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      setBooks(await api.listBooks());
    } catch (err) {
      setError(`Cannot load books: ${err.message}. Is the backend running?`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(book) {
    if (!confirm(`Delete "${book.title}" and all its reviews?`)) return;
    try {
      await api.deleteBook(book.id);
      setBooks((prev) => prev.filter((b) => b.id !== book.id));
    } catch (err) {
      setError(err.message);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return books;
    return books.filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
  }, [books, query]);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>All books</h1>
          <p className="muted">{books.length} book(s) in your shelf</p>
        </div>
        <input
          className="search"
          type="search"
          placeholder="Search title or author…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {error && <div className="alert error">{error}</div>}
      {loading && <p className="muted">Loading…</p>}

      {!loading && !error && books.length === 0 && (
        <div className="empty">
          <p>Your shelf is empty.</p>
          <Link href="/books/new" className="btn primary">
            Add your first book
          </Link>
        </div>
      )}

      {!loading && books.length > 0 && filtered.length === 0 && <p className="muted">No books match &ldquo;{query}&rdquo;.</p>}

      <div className="grid">
        {filtered.map((book) => (
          <BookCard key={book.id} book={book} onDelete={handleDelete} />
        ))}
      </div>
    </>
  );
}

