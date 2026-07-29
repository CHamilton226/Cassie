import Link from 'next/link';
import { Sparkles } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary-500" />
            <span className="text-xl font-bold text-gray-900">
              CareConnect<span className="text-primary-500">AI</span>
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
          >
            ← Back to Home
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="px-6 py-8 sm:px-8">
              {/* Logo */}
              <div className="mb-6 flex justify-center">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-8 w-8 text-primary-500" />
                </div>
              </div>

              {/* Title */}
              <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-2 text-sm text-gray-600">
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Content */}
              {children}
            </div>
          </div>

          {/* Footer note */}
          <p className="mt-6 text-center text-xs text-gray-500">
            By continuing, you agree to CareConnect AI&apos;s{' '}
            <Link href="/terms" className="underline hover:text-gray-700">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline hover:text-gray-700">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary-500" />
              <span className="text-sm font-bold text-gray-900">
                CareConnect<span className="text-primary-500">AI</span>
              </span>
            </div>
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} CareConnect AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
