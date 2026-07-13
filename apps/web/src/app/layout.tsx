import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'ProfileLens - Business Profile Audit',
  description: 'Analyze and optimize your Google Business Profile for local search.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn('h-full antialiased font-sans', inter.variable)}>
      <body className="min-h-screen flex flex-col bg-white font-sans text-gray-900 selection:bg-gray-200 selection:text-gray-900">
        <Providers>
          <Header />
          <main className="flex-1 pt-16 flex flex-col">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
