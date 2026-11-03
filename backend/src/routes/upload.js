
    const express = require('express');
    const multer = require('multer');
    const path = require('path');
    const fs = require('fs');
    const crypto = require('crypto');

    // โฟลเดอร์เก็บไฟล์ที่อัปโหลด: <โปรเจกต์>/uploads
    const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });

    // ชนิดไฟล์ที่อนุญาต (รูปภาพเท่านั้น)
    const ALLOWED = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
    };

    const storage = multer.diskStorage({
      destination: (req, file, cb) => cb(null, UPLOAD_DIR),
      // ตั้งชื่อไฟล์ใหม่แบบสุ่ม กันชื่อซ้ำและกันชื่อไฟล์แปลก ๆ
      filename: (req, file, cb) => cb(null, crypto.randomUUID() + ALLOWED[file.mimetype]),
    });

    const upload = multer({
      storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
      fileFilter: (req, file, cb) => {
        if (ALLOWED[file.mimetype]) return cb(null, true);
        cb(new Error('INVALID_FILE_TYPE'));
      },
    });

    const router = express.Router();

    // POST /upload  (multipart/form-data, field ชื่อ "file")
    router.post('/', upload.single('file'), (req, res) => {
      if (!req.file) return res.status(400).json({ error: 'file is required (field name: file)' });
      res.status(201).json({
        url: `/uploads/${req.file.filename}`,
        filename: req.file.filename,
        size: req.file.size,
      });
    });

    // ลบไฟล์ที่เคยอัปโหลด (ใช้ตอนลบหนังสือ/เปลี่ยนรูปปก) - ลบเฉพาะไฟล์ใน /uploads/
    function removeUploadedFile(url) {
      if (typeof url !== 'string' || !url.startsWith('/uploads/')) return;
      const file = path.join(UPLOAD_DIR, path.basename(url));
      fs.unlink(file, () => {});
    }

    module.exports = { router, UPLOAD_DIR, removeUploadedFile };
