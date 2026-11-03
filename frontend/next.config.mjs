const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // เบราว์เซอร์เรียก /api/books -> Next.js ส่งต่อไป http://localhost:3000/books
  // ทำให้ไม่ต้องตั้งค่า CORS และไม่ต้องฝัง URL ของ backend ในโค้ดฝั่งหน้าเว็บ
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${BACKEND_URL}/:path*` },
      { source: '/uploads/:path*', destination: `${BACKEND_URL}/uploads/:path*` },
    ];
  },
};

export default nextConfig;

