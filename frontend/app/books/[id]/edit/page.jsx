'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import BookForm from '../../../../components/BookForm';

export default function EditBookPage() {
  const { id } = useParams();
  const router = useRouter();
  const [book, setBook] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getBook(id)
      .then(setBook)
      .catch((err) => setError(err.message));
  }, [id]);

  async function handleUpdate(values) {
    await api.updateBook(id, values);
    router.push(`/books/${id}`);
  }

  return (
    <>
      <Link href={`/books/${id}`} className="back">
        ← Back to book
      </Link>
      <h1>Edit book</h1>
      {error && <div className="alert error">{error}</div>}
      {!book && !error && <p className="muted">Loading…</p>}
      {book && <BookForm initial={book} submitLabel="Save changes" onSubmit={handleUpdate} />}
    </>
  );
}

