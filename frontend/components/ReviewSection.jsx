'use client';

import { useState } from 'react';
import { api } from '../lib/api';
import { Stars, StarInput } from './Stars';

export default function ReviewSection({ bookId, reviews, onChanged }) {
  // ฟอร์มเพิ่มรีวิว
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // สถานะการแก้ไขรีวิว
  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editContent, setEditContent] = useState('');

  async function addReview(e) {
    e.preventDefault();
    setError('');
    if (!content.trim()) return setError('Please write something');
    setBusy(true);
    try {
      await api.createReview(bookId, { rating, content });
      setContent('');
      setRating(5);
      await onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function startEdit(r) {
    setEditingId(r.id);
    setEditRating(r.rating);
    setEditContent(r.content);
    setError('');
  }

  async function saveEdit(id) {
    setError('');
    if (!editContent.trim()) return setError('Please write something');
    try {
      await api.updateReview(id, { rating: editRating, content: editContent });
      setEditingId(null);
      await onChanged();
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeReview(id) {
    if (!confirm('Delete this review?')) return;
    try {
      await api.deleteReview(id);
      await onChanged();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="reviews">
      <h2>Reviews ({reviews.length})</h2>

      {error && <div className="alert error">{error}</div>}

      <form className="review-form" onSubmit={addReview}>
        <h3>Write a review</h3>
        <StarInput value={rating} onChange={setRating} />
        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What did you think about this book?"
        />
        <button className="btn primary" disabled={busy}>
          {busy ? 'Posting…' : 'Post review'}
        </button>
      </form>

      {reviews.length === 0 ? (
        <p className="muted">No reviews yet. Be the first!</p>
      ) : (
        <ul className="review-list">
          {reviews.map((r) => (
            <li key={r.id} className="review">
              {editingId === r.id ? (
                <div className="review-edit">
                  <StarInput value={editRating} onChange={setEditRating} />
                  <textarea rows={3} value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                  <div className="actions">
                    <button className="btn small primary" onClick={() => saveEdit(r.id)}>
                      Save
                    </button>
                    <button className="btn small" onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Stars value={r.rating} />
                  <p className="review-content">{r.content}</p>
                  <div className="actions">
                    <button className="btn small" onClick={() => startEdit(r)}>
                      Edit
                    </button>
                    <button className="btn small danger" onClick={() => removeReview(r.id)}>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

