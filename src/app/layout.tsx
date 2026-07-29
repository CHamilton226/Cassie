import type { Metadata } from 'next';
import './globals.css';
import SessionProvider from '@/components/SessionProvider';

export const metadata: Metadata = {
  title: 'CareConnect AI — AI-Powered Growth Assistant for Healthcare Practices',
  description: 'Save time, attract more patients, and grow your healthcare practice with AI-powered content creation, review management, website audits, and marketing plans. Built by healthcare professionals, for healthcare professionals.',
  keywords: 'healthcare marketing, AI for doctors, practice growth, medical practice marketing, AI content generator',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
