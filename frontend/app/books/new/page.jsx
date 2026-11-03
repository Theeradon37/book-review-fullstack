'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../lib/api';
import BookForm from '../../../components/BookForm';

export default function NewBookPage() {
  const router = useRouter();

  async function handleCreate(values) {
    const book = await api.createBook(values);
    router.push(`/books/${book.id}`);
  }

  return (
    <>
      <Link href="/" className="back">
        ← Back to books
      </Link>
      <h1>Add a book</h1>
      <BookForm submitLabel="Create book" onSubmit={handleCreate} />
    </>
  );
}

