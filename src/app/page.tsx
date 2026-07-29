'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  MessageSquareText,
  SearchCheck,
  TrendingUp,
  Target,
  MessageCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Star,
  PenLine,
  BarChart3,
  Globe,
  Zap,
  ShieldCheck,
  Heart,
  Menu,
  X,
} from 'lucide-react';

const features = [
  {
    icon: PenLine,
    title: 'AI Content Creator',
    description: 'Generate engaging social media posts, blog articles, and patient education content tailored to your practice — in seconds.',
  },
  {
    icon: MessageSquareText,
    title: 'Review Response Assistant',
    description: 'Craft professional, HIPAA-compliant responses to patient reviews that build trust and show you care.',
  },
  {
    icon: SearchCheck,
    title: 'Website Growth Audit',
    description: 'Get a comprehensive analysis of your online presence with actionable recommendations to improve visibility and conversions.',
  },
  {
    icon: TrendingUp,
    title: 'Practice Growth Score',
    description: 'See where your practice stands with our 0-100 score that measures your digital presence across key growth dimensions.',
  },
  {
    icon: Target,
    title: '30-Day Marketing Engine',
    description: 'Receive a personalized, day-by-day marketing plan designed specifically for your practice type and local market.',
  },
  {
    icon: MessageCircle,
    title: 'Communication Templates',
    description: 'Access a library of professionally written templates for patient emails, appointment reminders, and follow-ups.',
  },
];

const pricingTiers = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Try CareConnect AI risk-free. Perfect for getting started.',
    features: [
      '5 AI content generations/month',
      '10 review responses/month',
      'Basic Growth Score',
      '1 website audit/month',
      'Community support',
    ],
    cta: 'Start Free',
    highlight: false,
  },
  {
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'For solo practitioners ready to grow their online presence.',
    features: [
      '50 AI content generations/month',
      '50 review responses/month',
      'Full Growth Score with insights',
      '5 website audits/month',
      '30-day marketing plan',
      'Email support',
    ],
    cta: 'Start Free Trial',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$79',
    period: '/month',
    description: 'For growing practices that want a complete marketing toolkit.',
    features: [
      '200 AI content generations/month',
      '200 review responses/month',
      'Advanced Growth Score & tracking',
      'Unlimited website audits',
      'Monthly marketing plan refresh',
      'Content scheduling',
      'Priority email support',
    ],
    cta: 'Start Free Trial',
    highlight: true,
  },
  {
    name: 'Practice',
    price: '$149',
    period: '/month',
    description: 'For practices with multiple providers and complex needs.',
    features: [
      '500 AI content generations/month',
      '500 review responses/month',
      'Everything in Pro, plus:',
      'Multi-provider support',
      'Custom brand voice training',
      'Competitor analysis',
      'Priority chat support',
    ],
    cta: 'Start Free Trial',
    highlight: false,
  },
  {
    name: 'Agency',
    price: '$299',
    period: '/month',
    description: 'For marketing agencies managing multiple healthcare clients.',
    features: [
      'Unlimited AI generations',
      'Unlimited review responses',
      'Everything in Practice, plus:',
      'White-label reports',
      'Client management dashboard',
      'API access',
      'Dedicated account manager',
    ],
    cta: 'Contact Us',
    highlight: false,
  },
];

const faqs = [
  {
    question: 'What is CareConnect AI?',
    answer: 'CareConnect AI is a software platform that helps healthcare practices improve their online presence, communicate better with patients, and attract more customers — using practical AI tools. We never touch medical diagnosis or patient health data.',
  },
  {
    question: 'Do I need technical skills to use this?',
    answer: 'Not at all! CareConnect AI was designed specifically for busy practice owners who don\'t have time to learn complex software. Our interface is clean, simple, and intuitive. If you can use email, you can use CareConnect AI.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use industry-standard encryption and security practices. Critically, we never collect, store, or process Protected Health Information (PHI). Our platform is designed for marketing and communications — not clinical data.',
  },
  {
    question: 'Can I cancel at any time?',
    answer: 'Yes. There are no long-term contracts or cancellation fees. You can upgrade, downgrade, or cancel your subscription at any time from your dashboard. Your data remains yours.',
  },
  {
    question: 'How does the AI content generator work?',
    answer: 'You tell us about your practice — your specialty, your voice, your audience — and our AI creates tailored content that sounds like you. You can generate social media posts, blog articles, patient newsletters, and more. Every piece is editable before you use it.',
  },
  {
    question: 'What makes CareConnect AI different from generic AI tools?',
    answer: 'CareConnect AI is built specifically for healthcare practices. Our AI understands medical contexts, professional boundaries, and the unique communication needs of healthcare providers. Plus, it was designed by someone with 24+ years of hands-on healthcare experience.',
  },
  {
    question: 'Do you offer annual billing?',
    answer: 'Yes! Annual billing gives you two months free — that\'s a 17% savings. Switch to annual billing from your account settings at any time.',
  },
  {
    question: 'Can I use this for multiple practice locations?',
    answer: 'The Practice and Agency plans support multiple locations and providers. You can manage separate profiles and content for each location while maintaining a unified dashboard.',
  },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary-500" />
            <span className="text-xl font-bold text-gray-900">CareConnect<span className="text-primary-500">AI</span></span>
          </div>
          
          {/* Desktop nav */}
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">How It Works</a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Pricing</a>
            <Link href="/blog" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Blog</Link>
            <a href="#faq" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">FAQ</a>
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Log In</Link>
            <Link href="/signup" className="btn-primary">Start Free</Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-100 bg-white md:hidden">
            <div className="flex flex-col gap-2 px-4 py-4">
              <a href="#features" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-primary-50 hover:text-primary-600" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#how-it-works" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-primary-50 hover:text-primary-600" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
              <a href="#pricing" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-primary-50 hover:text-primary-600" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              <Link href="/blog" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-primary-50 hover:text-primary-600" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
              <a href="#faq" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-primary-50 hover:text-primary-600" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
              <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-primary-50 hover:text-primary-600" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
              <Link href="/signup" className="btn-primary mt-2 w-full text-center" onClick={() => setMobileMenuOpen(false)}>Start Free</Link>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section className="section-padding relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyYTlkNWUiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="section-inner relative">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1.5 text-sm font-medium text-primary-700">
                <Sparkles className="h-4 w-4" />
                AI-powered growth for healthcare practices
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Your AI-Powered Growth Assistant for{' '}
                <span className="text-primary-500">Healthcare Practices</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
                Save hours every week on marketing, respond to patient reviews professionally, 
                and get a clear plan to attract more customers — all with practical AI tools 
                built by someone who understands healthcare.
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link href="/signup" className="btn-primary px-8 py-4 text-base">
                  Start Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <a href="#how-it-works" className="btn-secondary px-8 py-4 text-base">
                  See How It Works
                </a>
              </div>
              <p className="mt-4 text-sm text-gray-500">No credit card required • Free plan available</p>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="section-padding bg-white">
          <div className="section-inner">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Running a practice is hard enough. Marketing shouldn&apos;t be.
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Small healthcare practices face unique challenges when it comes to 
                attracting and retaining patients. You didn&apos;t go to medical school to 
                become a marketer — but in today&apos;s world, your online presence matters 
                more than ever.
              </p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: 'No Time for Marketing', desc: 'Between patient care, admin work, and running your practice, there\'s zero time left for social media, blogging, or responding to reviews.' },
                { title: 'Patients Research Online First', desc: '92% of patients read online reviews before choosing a provider. Your digital presence is now your first impression.' },
                { title: 'Generic Tools Don\'t Cut It', desc: 'Most marketing tools aren\'t built for healthcare. They don\'t understand HIPAA boundaries or the professional tone patients expect.' },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-gray-200 bg-gray-50/50 p-6">
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-2 text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="section-padding bg-primary-50/50">
          <div className="section-inner">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                AI that speaks healthcare — so you don&apos;t have to learn marketing
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                CareConnect AI gives you a complete marketing toolkit designed specifically 
                for healthcare practices. Create content, manage your reputation, audit your 
                website, and follow a clear growth plan — all in one place, all powered by AI 
                that understands your world.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {[
                { icon: Zap, title: 'Save 10+ Hours Per Week', desc: 'Automate your content creation and review responses. Focus on patients, not posts.' },
                { icon: TrendingUp, title: 'Attract More Patients', desc: 'Improve your online presence with data-driven insights and a practical growth plan.' },
                { icon: ShieldCheck, title: 'Stay Professional & Compliant', desc: 'Every AI-generated response and post respects healthcare communication standards.' },
                { icon: Heart, title: 'Built With Healthcare Heart', desc: 'Created by a healthcare professional who understands the realities of running a practice.' },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 rounded-xl bg-white p-6 shadow-sm">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100">
                    <item.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="section-padding bg-white">
          <div className="section-inner">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Get started in minutes, not weeks
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Four simple steps to transform your practice&apos;s online presence.
              </p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { step: '1', title: 'Sign Up Free', desc: 'Create your account in under 60 seconds. No credit card, no commitment.' },
                { step: '2', title: 'Tell Us About Your Practice', desc: 'Answer a few simple questions about your specialty, location, and goals.' },
                { step: '3', title: 'Generate Your Content', desc: 'Our AI creates personalized social posts, blogs, and review responses instantly.' },
                { step: '4', title: 'Watch Your Practice Grow', desc: 'Follow your custom marketing plan and track your improving Growth Score.' },
              ].map((item) => (
                <div key={item.step} className="relative text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-xl font-bold text-white">
                    {item.step}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="section-padding bg-gray-50">
          <div className="section-inner">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Everything you need to grow your practice
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Six powerful tools designed specifically for healthcare providers.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="group rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 group-hover:bg-primary-200 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About the Founder */}
        <section className="section-padding bg-white">
          <div className="section-inner">
            <div className="mx-auto max-w-3xl">
              <div className="rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 p-8 text-white sm:p-12">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium">
                  <Heart className="h-4 w-4" />
                  About the Founder
                </div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Built by Someone Who Understands Healthcare
                </h2>
                <div className="mt-6 space-y-4 text-lg leading-relaxed text-white/90">
                  <p>
                    With over 24 years of experience as a Licensed Practical Nurse (LPN), our founder 
                    has worked on the front lines of healthcare — in clinics, long-term care facilities, 
                    and community health settings. She understands the daily realities of running a 
                    healthcare practice: the long hours, the administrative burden, and the constant 
                    pressure to do more with less.
                  </p>
                  <p>
                    After years of helping practices improve their patient communications and online 
                    presence through web design and digital marketing, she saw an opportunity: combine 
                    deep healthcare expertise with modern AI to give small practices the marketing 
                    power that only large hospital systems could afford.
                  </p>
                  <p>
                    CareConnect AI is the result — a platform built with genuine healthcare understanding, 
                    practical marketing expertise, and a commitment to never compromising the trust 
                    between providers and their patients.
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-xl font-bold">
                    LPN
                  </div>
                  <div>
                    <p className="font-semibold">Founder & CEO</p>
                    <p className="text-sm text-white/80">24+ Years Healthcare Experience • Web Design & AI Specialist</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="section-padding bg-gray-50">
          <div className="section-inner">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Simple, transparent pricing
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Start free and upgrade as you grow. All plans include a 14-day free trial on paid tiers.
              </p>
              <p className="mt-2 text-sm font-medium text-primary-600">
                💡 Save 17% with annual billing — that&apos;s two months free!
              </p>
            </div>
            <div className="mt-12 grid gap-6 lg:grid-cols-5">
              {pricingTiers.map((tier) => (
                <div
                  key={tier.name}
                  className={`relative flex flex-col rounded-2xl border p-6 ${
                    tier.highlight
                      ? 'border-primary-500 bg-white shadow-lg ring-2 ring-primary-500 scale-[1.02]'
                      : 'border-gray-200 bg-white shadow-sm'
                  }`}
                >
                  {tier.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-500 px-4 py-1 text-xs font-semibold text-white">
                      Most Popular
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{tier.name}</h3>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-gray-900">{tier.price}</span>
                      <span className="text-sm text-gray-500">{tier.period}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{tier.description}</p>
                  </div>
                  <ul className="mt-6 flex-1 space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={tier.name === 'Agency' ? '/contact' : '/pricing'}
                    className={`mt-6 block w-full rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-colors ${
                      tier.highlight
                        ? 'bg-primary-500 text-white hover:bg-primary-600'
                        : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                    }`}
                  >
                    {tier.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="section-padding bg-white">
          <div className="section-inner">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Frequently asked questions
              </h2>
              <p className="mt-4 text-center text-lg text-gray-600">
                Everything you need to know about CareConnect AI.
              </p>
              <div className="mt-12 divide-y divide-gray-200">
                {faqs.map((faq, index) => (
                  <div key={index} className="py-5">
                    <button
                      className="flex w-full items-center justify-between text-left"
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    >
                      <span className="text-base font-semibold text-gray-900">{faq.question}</span>
                      {openFaq === index ? (
                        <ChevronUp className="ml-4 h-5 w-5 flex-shrink-0 text-gray-400" />
                      ) : (
                        <ChevronDown className="ml-4 h-5 w-5 flex-shrink-0 text-gray-400" />
                      )}
                    </button>
                    {openFaq === index && (
                      <p className="mt-3 text-base leading-7 text-gray-600">{faq.answer}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="section-padding bg-gradient-to-br from-primary-600 to-primary-800">
          <div className="section-inner text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to grow your practice?
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
            <p className="mt-6 text-sm text-primary-200">No credit card required • Set up in under 2 minutes</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary-500" />
              <span className="text-lg font-bold text-gray-900">CareConnect<span className="text-primary-500">AI</span></span>
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
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
        </div>
      </footer>
    </div>
  );
}
