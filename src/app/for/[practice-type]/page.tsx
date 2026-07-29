import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, CheckCircle2, Sparkles, BookOpen } from 'lucide-react';
import { getSeoPage, getAllSeoSlugs, seoLandingPages } from '@/data/seo-pages';
import { getBlogPost } from '@/data/blog-posts';

interface SeoPageProps {
  params: { 'practice-type': string };
}

export function generateStaticParams() {
  return getAllSeoSlugs().map((slug) => ({ 'practice-type': slug }));
}

export function generateMetadata({ params }: SeoPageProps): Metadata {
  const page = getSeoPage(params['practice-type']);
  if (!page) return { title: 'Page Not Found' };

  return {
    title: page.title,
    description: page.metaDescription,
    keywords: `${page.practiceType.toLowerCase()} marketing, AI marketing, practice growth, healthcare marketing`,
    openGraph: {
      title: page.title,
      description: page.metaDescription,
    },
  };
}

export default function SeoLandingPage({ params }: SeoPageProps) {
  const page = getSeoPage(params['practice-type']);

  if (!page) {
    notFound();
  }

  // All practice type pages for the "also for" section
  const otherPages = seoLandingPages.filter((p) => p.slug !== page.slug);

  return (
    <main>
      {/* Hero */}
      <section className="section-padding relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyYTlkNWUiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="section-inner relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1.5 text-sm font-medium text-primary-700">
              <Sparkles className="h-4 w-4" />
              AI Marketing for {page.practiceType}
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              {page.heroTitle}
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
              {page.heroSubtitle}
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/signup" className="btn-primary px-8 py-4 text-base">
                Start Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/growth-score" className="btn-secondary px-8 py-4 text-base">
                Get Your Free Growth Score
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">No credit card required • Free plan available</p>
          </div>
        </div>
      </section>

      {/* Challenges */}
      <section className="section-padding bg-white">
        <div className="section-inner">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Marketing Challenges for {page.practiceType}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {page.practiceType} face unique challenges when it comes to attracting patients and building an online presence. Here are the ones we hear most often.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {page.challenges.map((challenge) => (
              <div
                key={challenge.title}
                className="rounded-xl border border-gray-200 bg-gray-50/50 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900">{challenge.title}</h3>
                <p className="mt-2 text-gray-600 leading-relaxed">{challenge.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section className="section-padding bg-primary-50/30">
        <div className="section-inner">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How CareConnect AI Helps {page.practiceType}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Our AI-powered tools are built with healthcare in mind — so you get marketing solutions that understand your world.
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {page.solutions.map((solution) => (
              <div
                key={solution.title}
                className="rounded-xl border border-primary-100 bg-white p-6 shadow-sm"
              >
                <CheckCircle2 className="h-8 w-8 text-primary-500" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{solution.title}</h3>
                <p className="mt-2 text-gray-600 leading-relaxed">{solution.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Blog Posts */}
      {page.relatedBlogSlugs.length > 0 && (
        <section className="section-padding bg-white">
          <div className="section-inner">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1.5 text-sm font-medium text-primary-700">
                <BookOpen className="h-4 w-4" />
                Related Articles
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Resources for {page.practiceType}
              </h2>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {page.relatedBlogSlugs.map((slug) => {
                const post = getBlogPost(slug);
                if (!post) return null;
                return (
                  <Link
                    key={slug}
                    href={`/blog/${slug}`}
                    className="group flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-primary-200"
                  >
                    <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700 w-fit">
                      {post.category}
                    </span>
                    <h3 className="mt-3 text-base font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
                    <span className="mt-3 text-sm font-medium text-primary-600 inline-flex items-center gap-1">
                      Read Article <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Also For */}
      <section className="section-padding bg-gray-50">
        <div className="section-inner">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              AI Marketing for Every Healthcare Practice
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Explore our solutions for other practice types:
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {otherPages.map((p) => (
              <Link
                key={p.slug}
                href={`/for/${p.slug}`}
                className="rounded-lg border border-gray-200 bg-white px-5 py-4 text-center text-sm font-medium text-gray-700 hover:border-primary-300 hover:text-primary-600 hover:shadow-sm transition-all"
              >
                {p.practiceType}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="section-inner text-center">
          <Sparkles className="mx-auto h-12 w-12 text-primary-200" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to grow your {page.practiceType.toLowerCase()}?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-100">
            Join healthcare practices across the country using CareConnect AI to save time,
            attract more patients, and build a stronger online presence.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/signup" className="btn-white px-8 py-4 text-base">
              Start Free Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/growth-score" className="rounded-lg border border-white/30 px-8 py-4 text-base font-semibold text-white hover:bg-white/10 transition-colors">
              Get Your Free Growth Score
            </Link>
          </div>
          <p className="mt-6 text-sm text-primary-200">No credit card required • Free plan available</p>
        </div>
      </section>
    </main>
  );
}
