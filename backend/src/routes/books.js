//--endpoint ของ Book (+ เพิ่ม/ดูรีวิวของหนังสือ)
const { removeUploadedFile } = require('./upload');
const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const { validateBook, validateReview } = require('../validate');

// GET /books - ดึงรายการหนังสือทั้งหมด (พร้อม reviews)
router.get('/', async (req, res, next) => {
  try {
    const books = await prisma.book.findMany({
      include: {
        reviews: true, // ดึงรีวิวที่เกี่ยวข้องมาด้วย
      },
    });
    res.json(books);
  } catch (error) {
    next(error);
  }
});

// GET /books/:id - ดึงหนังสือ 1 เล่ม ตาม ID (พร้อม reviews)
router.get('/:id', async (req, res, next) => {
  try {
    const bookId = parseInt(req.params.id);
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        reviews: true,
      },
    });

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    next(error);
  }
});

// POST /books - เพิ่มหนังสือใหม่
router.post('/', async (req, res, next) => {
  try {
    const { title, author, coverUrl } = req.body;

    // ตรวจสอบข้อมูลเบื้องต้น (ถ้ามีฟังก์ชัน validateBook ใน validate.js)
    if (typeof validateBook === 'function') {
      const error = validateBook({ title, author });
      if (error) return res.status(400).json({ error });
    }

    const newBook = await prisma.book.create({
      data: {
        title,
        author,
        coverUrl,
      },
    });

    res.status(201).json(newBook);
  } catch (error) {
    next(error);
  }
});

// POST /books/:id/reviews - เพิ่มรีวิวให้หนังสือเล่มที่ระบุ [โจทย์ข้อ 3]
router.post('/:id/reviews', async (req, res, next) => {
  try {
    const bookId = parseInt(req.params.id);
    const { rating, content } = req.body;

    // ตรวจสอบว่ามีหนังสือเล่มนี้อยู่จริงไหม
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // ตรวจสอบความถูกต้องของข้อมูลรีวิว (เช่น rating ต้องอยู่ช่วง 1-5)
    if (typeof validateReview === 'function') {
      const error = validateReview({ rating, content });
      if (error) return res.status(400).json({ error });
    } else if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // บันทึกรีวิวลงฐานข้อมูลโดยผูกกับ bookId
    const newReview = await prisma.review.create({
      data: {
        rating,
        content,
        bookId,
      },
    });

    res.status(201).json(newReview);
  } catch (error) {
    next(error);
  }
});

// PUT /books/:id - แก้ไขข้อมูลหนังสือ
router.put('/:id', async (req, res, next) => {
  try {
    const bookId = parseInt(req.params.id);
    const { title, author, coverUrl } = req.body;

    // ตรวจว่ามีหนังสือก่อน
    const existing = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // ตรวจสอบข้อมูลถ้ามีฟังก์ชัน validateBook
    if (typeof validateBook === 'function') {
      const error = validateBook({ title, author });
      if (error) return res.status(400).json({ error });
    }

    // ถ้า coverUrl เปลี่ยนไป ให้ลบรูปเก่า
    if (coverUrl !== undefined && coverUrl !== existing.coverUrl) {
      removeUploadedFile(existing.coverUrl);
    }

    const updatedBook = await prisma.book.update({
      where: { id: bookId },
      data: {
        ...(title !== undefined && { title }),
        ...(author !== undefined && { author }),
        ...(coverUrl !== undefined && { coverUrl }),
      },
    });

    res.json(updatedBook);
  } catch (error) {
    next(error);
  }
});

// DELETE /books/:id - ลบหนังสือ (ลบรีวิวตามด้วยอัตโนมัติจาก onDelete: Cascade)
router.delete('/:id', async (req, res, next) => {
  try {
    const bookId = parseInt(req.params.id);

    // ใช้ผลลัพธ์จาก prisma.book.delete แล้วเรียก removeUploadedFile(book.coverUrl)
    const book = await prisma.book.delete({
      where: { id: bookId },
    });

    removeUploadedFile(book.coverUrl);

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Book not found' });
    }
    next(error);
  }
});

module.exports = router;