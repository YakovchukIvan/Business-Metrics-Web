import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Дозволяє Next.js генерувати типи для всіх роутів проєкту
  experimental: {
    typedRoutes: true,
  },

  // Зменшує розмір фінального контейнера (корисно для Docker)
  output: 'standalone',
};

export default nextConfig;
