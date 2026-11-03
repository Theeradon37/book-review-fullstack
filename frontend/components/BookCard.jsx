'use client';

import Link from 'next/link';
import { Stars } from './Stars';
import { averageRating, formatDate } from '../lib/api';

export default function BookCard({ book, onDelete }) {
  const reviews = book.reviews || [];
  const avg = averageRating(reviews);

  return (
    <article className="card">
      <Link href={`/books/${book.id}`} className="cover-link">
        {book.coverUrl ? (
          <img className="cover" src={book.coverUrl} alt={`Cover of ${book.title}`} />
        ) : (
          <div className="cover placeholder">📚</div>
        )}
      </Link>

      <div className="card-body">
        <h3>
          <Link href={`/books/${book.id}`}>{book.title}</Link>
        </h3>
        <p className="muted">{book.author}</p>
        <p className="muted small">Published {formatDate(book.publishedAt)}</p>

        <div className="rating-row">
          <Stars value={avg} />
          <span className="muted small">
            {reviews.length ? `${avg.toFixed(1)} (${reviews.length})` : 'No reviews yet'}
          </span>
        </div>

        <div className="actions">
          <Link className="btn small" href={`/books/${book.id}`}>
            View
          </Link>
          <Link className="btn small" href={`/books/${book.id}/edit`}>
            Edit
          </Link>
          <button className="btn small danger" onClick={() => onDelete(book)}>
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

