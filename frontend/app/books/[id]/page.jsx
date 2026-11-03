'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, averageRating, formatDate } from '../../../lib/api';
import { Stars } from '../../../components/Stars';
import ReviewSection from '../../../components/ReviewSection';

export default function BookDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      setBook(await api.getBook(id)); // ได้หนังสือ + reviews ซ้อนมาด้วย
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete() {
    if (!confirm(`Delete "${book.title}" and all its reviews?`)) return;
    try {
      await api.deleteBook(book.id);
      router.push('/');
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p className="muted">Loading…</p>;
  if (error && !book) {
    return (
      <>
        <Link href="/" className="back">
          ← Back to books
        </Link>
        <div className="alert error">{error}</div>
      </>
    );
  }

  const avg = averageRating(book.reviews);

  return (
    <>
      <Link href="/" className="back">
        ← Back to books
      </Link>
      {error && <div className="alert error">{error}</div>}

      <section className="detail">
        {book.coverUrl ? (
          <img className="detail-cover" src={book.coverUrl} alt={`Cover of ${book.title}`} />
        ) : (
          <div className="detail-cover placeholder">📚</div>
        )}

        <div>
          <h1>{book.title}</h1>
          <p className="author">by {book.author}</p>
          <p className="muted">Published {formatDate(book.publishedAt)}</p>
          <div className="rating-row big">
            <Stars value={avg} />
            <span className="muted">
              {book.reviews.length ? `${avg.toFixed(1)} from ${book.reviews.length} review(s)` : 'No reviews yet'}
            </span>
          </div>
          <div className="actions">
            <Link className="btn" href={`/books/${book.id}/edit`}>
              Edit book
            </Link>
            <button className="btn danger" onClick={handleDelete}>
              Delete book
            </button>
          </div>
        </div>
      </section>

      <ReviewSection bookId={book.id} reviews={book.reviews} onChanged={load} />
    </>
  );
}

