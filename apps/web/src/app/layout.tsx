import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BackgroundLayout } from '@/components/layout/background-layout';
import { Providers } from './providers';
import { Toaster } from 'sonner';

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
      <body className="min-h-screen flex flex-col font-sans text-foreground selection:bg-muted selection:text-foreground">
        <Providers>
          <BackgroundLayout />
          <Header />
          <main className="flex-1 pt-16 flex flex-col">{children}</main>
          <Footer />
          <Toaster position="bottom-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
