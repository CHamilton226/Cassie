import Link from 'next/link';
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { blogPosts } from '@/data/blog-posts';

export default function BlogIndexPage() {
  return (
    <main>
      {/* Blog Hero */}
      <section className="section-padding bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="section-inner">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1.5 text-sm font-medium text-primary-700">
              <BookOpen className="h-4 w-4" />
              Healthcare Marketing Blog
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
              CareConnect AI Blog
            </h1>
            <p className="mt-4 text-lg leading-8 text-gray-600 sm:text-xl">
              Practical advice for growing your healthcare practice online — from AI and SEO tips
              to reputation management and patient acquisition strategies.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="section-padding bg-white">
        <div className="section-inner">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-primary-200"
              >
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-400">{post.readTime}</span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-6 text-gray-600">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary-600">
                    Read More
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="section-inner text-center">
          <Sparkles className="mx-auto h-12 w-12 text-primary-200" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to grow your practice?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-100">
            Get your free Practice Growth Score and see where your online presence stands.
            Takes less than 2 minutes.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/growth-score"
              className="btn-white px-8 py-4 text-base"
            >
              Get Your Free Growth Score
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/signup"
              className="rounded-lg border border-white/30 px-8 py-4 text-base font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Start Free Today
            </Link>
          </div>
          <p className="mt-6 text-sm text-primary-200">No credit card required • Free plan available</p>
        </div>
      </section>
    </main>
  );
}
