import { Sparkles, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Sparkles className="h-7 w-7 text-primary-500" />
            <span className="text-lg font-bold text-gray-900">
              CareConnect<span className="text-primary-500">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-5 w-24 animate-pulse rounded-md bg-gray-200" />
            <Link
              href="/api/auth/signout"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Content Skeleton */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Welcome Row Skeleton */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="h-8 w-64 animate-pulse rounded-lg bg-gray-200" />
              <div className="h-4 w-40 animate-pulse rounded-md bg-gray-200" />
            </div>
            <div className="h-14 w-48 animate-pulse rounded-xl bg-gray-200" />
          </div>

          {/* Today's Action Skeleton */}
          <div className="mb-6 h-36 animate-pulse rounded-xl bg-gray-200" />

          {/* Two-Column Grid Skeleton */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions Skeleton */}
              <div>
                <div className="h-6 w-32 mb-4 animate-pulse rounded-md bg-gray-200" />
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-28 animate-pulse rounded-xl bg-gray-200"
                    />
                  ))}
                </div>
              </div>

              {/* Recent Activity Skeleton */}
              <div>
                <div className="h-6 w-36 mb-4 animate-pulse rounded-md bg-gray-200" />
                <div className="h-40 animate-pulse rounded-xl bg-gray-200" />
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="space-y-4">
              <div className="h-6 w-36 mb-4 animate-pulse rounded-md bg-gray-200" />
              <div className="h-40 animate-pulse rounded-xl bg-gray-200" />
              <div className="h-20 animate-pulse rounded-xl bg-gray-200" />
              <div className="h-20 animate-pulse rounded-xl bg-gray-200" />
              <div className="h-20 animate-pulse rounded-xl bg-gray-200" />
              <div className="h-32 animate-pulse rounded-xl bg-gray-200" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
