// ตัวช่วยเรียก backend ทั้งหมดอยู่ที่ไฟล์นี้ที่เดียว
const BASE = '/api'; // ถูก rewrite ไปที่ backend (ดู next.config.mjs)

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, { cache: 'no-store', ...options });
  if (res.status === 204) return null;

  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    /* ไม่มี body */
  }
  if (!res.ok) {
    const message = data?.errors?.join(', ') || data?.error || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

const withJson = (method, body) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const api = {
  // Books
  listBooks: () => request('/books'),
  getBook: (id) => request(`/books/${id}`),
  createBook: (data) => request('/books', withJson('POST', data)),
  updateBook: (id, data) => request(`/books/${id}`, withJson('PUT', data)),
  deleteBook: (id) => request(`/books/${id}`, { method: 'DELETE' }),

  // Reviews
  createReview: (bookId, data) => request(`/books/${bookId}/reviews`, withJson('POST', data)),
  updateReview: (id, data) => request(`/reviews/${id}`, withJson('PUT', data)),
  deleteReview: (id) => request(`/reviews/${id}`, { method: 'DELETE' }),

  // Upload (multipart/form-data ห้ามตั้ง Content-Type เอง เบราว์เซอร์ใส่ boundary ให้)
  uploadImage: (file) => {
    const form = new FormData();
    form.append('file', file);
    return request('/upload', { method: 'POST', body: form });
  },
};

export function averageRating(reviews = []) {
  if (!reviews.length) return 0;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}

export function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

