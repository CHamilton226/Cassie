import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, ArrowRight, Calendar, Clock, Tag, Sparkles } from 'lucide-react';
import { getBlogPost, getAllBlogSlugs, blogPosts } from '@/data/blog-posts';

interface BlogPostPageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: BlogPostPageProps): Metadata {
  const post = getBlogPost(params.slug);
  if (!post) return { title: 'Post Not Found' };

  return {
    title: `${post.title} — CareConnect AI Blog`,
    description: post.excerpt,
    keywords: `${post.category.toLowerCase()}, healthcare marketing, practice growth, ${post.slug.replace(/-/g, ', ')}`,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
    },
  };
}

function renderContent(content: string) {
  const lines = content.trim().split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // H2 heading
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="mt-10 mb-4 text-2xl font-bold text-gray-900">
          {trimmed.replace('## ', '')}
        </h2>
      );
      i++;
      continue;
    }

    // H3 heading
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="mt-8 mb-3 text-xl font-semibold text-gray-900">
          {trimmed.replace('### ', '')}
        </h3>
      );
      i++;
      continue;
    }

    // Bullet point list accumulation
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const bulletItems: string[] = [];
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
        const item = lines[i].trim().replace(/^[-*]\s+/, '');
        // Handle bold within bullets: **text**
        bulletItems.push(item.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'));
        i++;
      }
      elements.push(
        <ul key={i} className="my-4 ml-6 list-disc space-y-2 text-gray-700 leading-relaxed">
          {bulletItems.map((item, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list accumulation
    if (/^\d+\.\s/.test(trimmed)) {
      const numItems: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        const item = lines[i].trim().replace(/^\d+\.\s+/, '');
        numItems.push(item.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'));
        i++;
      }
      elements.push(
        <ol key={i} className="my-4 ml-6 list-decimal space-y-2 text-gray-700 leading-relaxed">
          {numItems.map((item, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ol>
      );
      continue;
    }

    // Regular paragraph - accumulate until we hit a blank line or a special line
    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].trim().startsWith('## ') &&
      !lines[i].trim().startsWith('### ') &&
      !lines[i].trim().startsWith('- ') &&
      !lines[i].trim().startsWith('* ') &&
      !/^\d+\.\s/.test(lines[i].trim())
    ) {
      paragraphLines.push(lines[i].trim());
      i++;
    }

    if (paragraphLines.length > 0) {
      const paragraph = paragraphLines
        .join(' ')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      elements.push(
        <p
          key={i}
          className="my-4 text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: paragraph }}
        />
      );
    } else {
      i++;
    }
  }

  return elements;
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  const currentIndex = blogPosts.findIndex((p) => p.slug === post.slug);
  const prevPost = currentIndex > 0 ? blogPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : null;

  return (
    <main>
      {/* Back link */}
      <div className="section-inner px-4 pt-8 sm:px-6 lg:px-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>
      </div>

      {/* Article Header */}
      <article className="section-inner px-4 pb-8 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-3xl pt-8">
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
              <Tag className="mr-1.5 h-3.5 w-3.5" />
              {post.category}
            </span>
            <span className="inline-flex items-center text-sm text-gray-400">
              <Clock className="mr-1.5 h-4 w-4" />
              {post.readTime}
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            {post.excerpt}
          </p>

          <div className="mt-8 flex items-center gap-4 border-t border-gray-100 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
              <span className="text-sm font-bold text-primary-600">
                {post.authorName.split(' ').map((n) => n[0]).join('')}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{post.authorName}</p>
              <p className="text-xs text-gray-500">{post.authorTitle}</p>
            </div>
          </div>
        </header>

        {/* Article Body */}
        <div className="mx-auto max-w-3xl pt-8 pb-16 text-base leading-7">
          {renderContent(post.content)}
        </div>
      </article>

      {/* Post Navigation */}
      <div className="border-t border-gray-100 bg-gray-50">
        <div className="section-inner px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl flex flex-col sm:flex-row justify-between gap-6">
            {prevPost ? (
              <Link
                href={`/blog/${prevPost.slug}`}
                className="group flex-1 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-primary-200 hover:shadow-sm"
              >
                <span className="text-xs font-medium text-gray-400">← Previous Article</span>
                <p className="mt-1 text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                  {prevPost.title}
                </p>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
            {nextPost ? (
              <Link
                href={`/blog/${nextPost.slug}`}
                className="group flex-1 rounded-lg border border-gray-200 bg-white p-4 text-right transition-all hover:border-primary-200 hover:shadow-sm"
              >
                <span className="text-xs font-medium text-gray-400">Next Article →</span>
                <p className="mt-1 text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                  {nextPost.title}
                </p>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
          </div>
        </div>
      </div>

      {/* CTA */}
      <section className="section-padding bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="section-inner text-center">
          <Sparkles className="mx-auto h-12 w-12 text-primary-200" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to apply these insights?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-100">
            Get your free Practice Growth Score and see how your practice stacks up online.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/growth-score" className="btn-white px-8 py-4 text-base">
              Get Your Free Growth Score
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/signup" className="rounded-lg border border-white/30 px-8 py-4 text-base font-semibold text-white hover:bg-white/10 transition-colors">
              Start Free Today
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
