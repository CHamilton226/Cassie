import type { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Marketing Solutions by Practice Type — CareConnect AI',
  description: 'Explore AI-powered marketing tools designed specifically for your type of healthcare practice. Content creation, review management, website audits, and more.',
  keywords: 'healthcare marketing, AI for medical practices, dental marketing, PT marketing, chiropractic marketing',
};

export default function ForLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary-500" />
            <span className="text-xl font-bold text-gray-900">
              CareConnect<span className="text-primary-500">AI</span>
            </span>
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/blog" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Blog</Link>
            <Link href="/growth-score" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Free Growth Score</Link>
            <Link href="/signup" className="btn-primary">Start Free</Link>
          </div>
        </nav>
      </header>

      {children}

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary-500" />
              <span className="text-lg font-bold text-gray-900">
                CareConnect<span className="text-primary-500">AI</span>
              </span>
            </Link>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <Link href="/blog" className="hover:text-gray-700 transition-colors">Blog</Link>
              <Link href="/growth-score" className="hover:text-gray-700 transition-colors">Free Growth Score</Link>
              <Link href="/privacy" className="hover:text-gray-700 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-gray-700 transition-colors">Terms of Service</Link>
              <Link href="/contact" className="hover:text-gray-700 transition-colors">Contact</Link>
            </div>
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} CareConnect AI. All rights reserved.
            </p>
          </div>
          <p className="mt-6 text-center text-xs text-gray-400">
            Disclaimer: CareConnect AI provides marketing and communication tools for healthcare practices. We do not provide medical advice, diagnosis, or treatment. Our platform never collects, stores, or processes Protected Health Information (PHI).
          </p>
        </div>
      </footer>
    </div>
  );
}
