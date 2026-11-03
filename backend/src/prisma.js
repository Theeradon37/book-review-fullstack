//--สร้าง PrismaClient ตัวเดียวใช้ร่วมกัน
const { PrismaClient } = require('@prisma/client');
module.exports = new PrismaClient();