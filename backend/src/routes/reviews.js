//--endpoint ของ Review
const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const { validateReview } = require('../validate');

// GET /reviews/:id - ดึงข้อมูลรีวิว 1 รายการ
router.get('/:id', async (req, res, next) => {
  try {
    const reviewId = parseInt(req.params.id);

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        book: true, // (Optional) ดึงข้อมูลหนังสือของรีวิวนี้ติดมาด้วย
      },
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    next(error);
  }
});

// PUT /reviews/:id - แก้ไขรีวิว
router.put('/:id', async (req, res, next) => {
  try {
    const reviewId = parseInt(req.params.id);
    const { rating, content } = req.body;

    // Validate ข้อมูลถ้ามีการส่งเข้ามาตรวจ
    if (typeof validateReview === 'function') {
      const error = validateReview({ rating, content });
      if (error) return res.status(400).json({ error });
    } else if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        ...(rating !== undefined && { rating }),
        ...(content !== undefined && { content }),
      },
    });

    res.json(updatedReview);
  } catch (error) {
    // ถ้าไม่พบ review id ในฐานข้อมูล Prisma จะโยน error P2025
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Review not found' });
    }
    next(error);
  }
});

// DELETE /reviews/:id - ลบรีวิว
router.delete('/:id', async (req, res, next) => {
  try {
    const reviewId = parseInt(req.params.id);

    await prisma.review.delete({
      where: { id: reviewId },
    });

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Review not found' });
    }
    next(error);
  }
});

module.exports = router;