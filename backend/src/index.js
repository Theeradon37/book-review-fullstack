// โหลดค่าจากไฟล์ .env (Node 20.12+)
try { process.loadEnvFile(); } catch (_) { /* ไม่มี .env ก็ใช้ค่า default */ }

const express = require('express');
const multer = require('multer');
const booksRouter = require('./routes/books');
const reviewsRouter = require('./routes/reviews');
const { router: uploadRouter, UPLOAD_DIR } = require('./routes/upload');

const app = express();

// CORS (เผื่อเรียก API ตรงจากเบราว์เซอร์ ไม่ผ่าน proxy ของ Next.js)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'Book & Review API is running' }));

app.use('/uploads', express.static(UPLOAD_DIR)); // เปิดดูรูปที่อัปโหลด
app.use('/upload', uploadRouter);
app.use('/books', booksRouter);
app.use('/reviews', reviewsRouter);

// 404
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  if (err.code === 'P2025') return res.status(404).json({ error: 'Record not found' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });
  if (err instanceof multer.MulterError) {
    const msg = err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 5 MB)' : err.message;
    return res.status(400).json({ error: msg });
  }
  if (err.message === 'INVALID_FILE_TYPE') {
    return res.status(400).json({ error: 'Only jpg, png, webp, gif images are allowed' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));