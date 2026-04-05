/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      'localhost',
      'i.pinimg.com',
      'images.unsplash.com' // 🔥 ADD THIS
    ],
  },
}

export default nextConfig