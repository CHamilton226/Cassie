'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Building2,
  Stethoscope,
  MapPin,
  Globe,
  Phone,
  Clock,
  Link2,
  PenLine,
  Target,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

const PRACTICE_TYPES = [
  'Primary Care',
  'Dental',
  'Physical Therapy',
  'Chiropractic',
  'Home Health',
  'Hospice',
  'Senior Care',
  'Mental Health',
  'Specialty Clinic',
  'Other',
] as const;

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
  'DC',
] as const;

const BRAND_VOICES = [
  'Professional',
  'Friendly',
  'Warm & Welcoming',
  'Modern',
  'Reassuring & Compassionate',
] as const;

const COMMUNICATION_STYLES = [
  'Formal',
  'Conversational',
  'Educational',
  'Supportive',
] as const;

const TOTAL_STEPS = 3;

export default function OnboardingForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  // Step 1 fields
  const [practiceName, setPracticeName] = useState('');
  const [practiceType, setPracticeType] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [phone, setPhone] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  // Step 2 fields
  const [services, setServices] = useState('');
  const [targetCustomers, setTargetCustomers] = useState('');
  const [hours, setHours] = useState('');
  const [bookingUrl, setBookingUrl] = useState('');

  // Step 3 fields
  const [brandVoice, setBrandVoice] = useState('');
  const [communicationStyle, setCommunicationStyle] = useState('');
  const [businessGoals, setBusinessGoals] = useState('');

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!practiceName.trim()) errors.practiceName = 'Practice name is required';
      if (!practiceType) errors.practiceType = 'Please select your practice type';
      if (!city.trim()) errors.city = 'City is required';
      if (!state) errors.state = 'Please select your state';
      if (websiteUrl && !/^https?:\/\/.+\..+/.test(websiteUrl.trim())) {
        errors.websiteUrl = 'Please enter a valid URL (e.g., https://yourpractice.com)';
      }
    }

    if (step === 3) {
      if (!brandVoice) errors.brandVoice = 'Please select your brand voice';
      if (!communicationStyle) errors.communicationStyle = 'Please select your communication style';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    setError('');
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setError('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setError('');
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practiceName: practiceName.trim(),
          practiceType,
          city: city.trim(),
          state,
          phone: phone.trim() || undefined,
          websiteUrl: websiteUrl.trim() || undefined,
          services: services.trim() || undefined,
          targetCustomers: targetCustomers.trim() || undefined,
          hours: hours.trim() || undefined,
          bookingUrl: bookingUrl.trim() || undefined,
          brandVoice: brandVoice || undefined,
          communicationStyle: communicationStyle || undefined,
          businessGoals: businessGoals.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1500);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-lg text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Your practice is all set up!
            </h1>
            <p className="mt-3 text-lg text-gray-600">
              Let&apos;s check your Growth Score. Redirecting you to your dashboard...
            </p>
            <div className="mt-6">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary-500" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                Step {currentStep} of {TOTAL_STEPS}
              </span>
              <span className="text-sm font-medium text-primary-600">
                {Math.round((currentStep / TOTAL_STEPS) * 100)}% Complete
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
                    i + 1 < currentStep
                      ? 'bg-primary-500'
                      : i + 1 === currentStep
                      ? 'bg-primary-400'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            {/* Step labels */}
            <div className="mt-2 flex justify-between text-xs text-gray-400">
              <span className={currentStep >= 1 ? 'text-primary-600 font-medium' : ''}>Practice Basics</span>
              <span className={currentStep >= 2 ? 'text-primary-600 font-medium' : ''}>Services</span>
              <span className={currentStep >= 3 ? 'text-primary-600 font-medium' : ''}>Brand & Goals</span>
            </div>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
            {/* Error Banner */}
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1: Practice Basics */}
            {currentStep === 1 && (
              <div className="animate-in fade-in duration-300">
                <div className="mb-6">
                  <h2 className="text-xl font-bold tracking-tight text-gray-900">
                    Tell us about your practice
                  </h2>
                  <p className="mt-1.5 text-sm text-gray-600">
                    This helps us personalize your CareConnect AI experience. It only takes a couple of minutes.
                  </p>
                </div>

                <div className="space-y-5">
                  {/* Practice Name */}
                  <div>
                    <label htmlFor="practiceName" className="block text-sm font-medium text-gray-700">
                      Practice Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-1.5">
                      <Building2 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        id="practiceName"
                        type="text"
                        value={practiceName}
                        onChange={(e) => setPracticeName(e.target.value)}
                        className={`block w-full rounded-lg border pl-10 pr-3 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                          fieldErrors.practiceName
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-gray-300 focus:border-primary-500'
                        }`}
                        placeholder="e.g., Smith Family Practice"
                      />
                    </div>
                    {fieldErrors.practiceName && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.practiceName}</p>
                    )}
                  </div>

                  {/* Practice Type */}
                  <div>
                    <label htmlFor="practiceType" className="block text-sm font-medium text-gray-700">
                      Practice Type / Specialty <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-1.5">
                      <Stethoscope className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <select
                        id="practiceType"
                        value={practiceType}
                        onChange={(e) => setPracticeType(e.target.value)}
                        className={`block w-full rounded-lg border pl-10 pr-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                          fieldErrors.practiceType
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-gray-300 focus:border-primary-500'
                        } ${!practiceType ? 'text-gray-400' : 'text-gray-900'}`}
                      >
                        <option value="" disabled>Select your specialty...</option>
                        {PRACTICE_TYPES.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    {fieldErrors.practiceType && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.practiceType}</p>
                    )}
                  </div>

                  {/* City & State */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                        City <span className="text-red-500">*</span>
                      </label>
                      <div className="relative mt-1.5">
                        <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          id="city"
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className={`block w-full rounded-lg border pl-10 pr-3 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                            fieldErrors.city
                              ? 'border-red-300 focus:border-red-500'
                              : 'border-gray-300 focus:border-primary-500'
                          }`}
                          placeholder="City"
                        />
                      </div>
                      {fieldErrors.city && (
                        <p className="mt-1 text-xs text-red-600">{fieldErrors.city}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                        State <span className="text-red-500">*</span>
                      </label>
                      <div className="relative mt-1.5">
                        <select
                          id="state"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className={`block w-full rounded-lg border px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                            fieldErrors.state
                              ? 'border-red-300 focus:border-red-500'
                              : 'border-gray-300 focus:border-primary-500'
                          } ${!state ? 'text-gray-400' : 'text-gray-900'}`}
                        >
                          <option value="" disabled>Select...</option>
                          {US_STATES.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>
                      {fieldErrors.state && (
                        <p className="mt-1 text-xs text-red-600">{fieldErrors.state}</p>
                      )}
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <div className="relative mt-1.5">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>

                  {/* Website URL */}
                  <div>
                    <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700">
                      Practice Website <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <div className="relative mt-1.5">
                      <Globe className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        id="websiteUrl"
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        className={`block w-full rounded-lg border pl-10 pr-3 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                          fieldErrors.websiteUrl
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-gray-300 focus:border-primary-500'
                        }`}
                        placeholder="https://yourpractice.com"
                      />
                    </div>
                    {fieldErrors.websiteUrl && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.websiteUrl}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Services & Customers */}
            {currentStep === 2 && (
              <div className="animate-in fade-in duration-300">
                <div className="mb-6">
                  <h2 className="text-xl font-bold tracking-tight text-gray-900">
                    Services & customers
                  </h2>
                  <p className="mt-1.5 text-sm text-gray-600">
                    Tell us what you offer and who you serve. This helps our AI create relevant content for your practice.
                  </p>
                </div>

                <div className="space-y-5">
                  {/* Services Offered */}
                  <div>
                    <label htmlFor="services" className="block text-sm font-medium text-gray-700">
                      Services Offered <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      id="services"
                      rows={3}
                      value={services}
                      onChange={(e) => setServices(e.target.value)}
                      className="mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      placeholder="e.g., General dentistry, cleanings, crowns, Invisalign, teeth whitening"
                    />
                  </div>

                  {/* Target Customers */}
                  <div>
                    <label htmlFor="targetCustomers" className="block text-sm font-medium text-gray-700">
                      Target Customers <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      id="targetCustomers"
                      rows={3}
                      value={targetCustomers}
                      onChange={(e) => setTargetCustomers(e.target.value)}
                      className="mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      placeholder="e.g., Families, adults 30-65, cosmetic dental patients"
                    />
                  </div>

                  {/* Business Hours */}
                  <div>
                    <label htmlFor="hours" className="block text-sm font-medium text-gray-700">
                      Business Hours <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <div className="relative mt-1.5">
                      <Clock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <textarea
                        id="hours"
                        rows={2}
                        value={hours}
                        onChange={(e) => setHours(e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        placeholder="e.g., Mon-Fri 8am-5pm, Sat 9am-12pm"
                      />
                    </div>
                  </div>

                  {/* Booking URL */}
                  <div>
                    <label htmlFor="bookingUrl" className="block text-sm font-medium text-gray-700">
                      Booking URL <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <div className="relative mt-1.5">
                      <Link2 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        id="bookingUrl"
                        type="url"
                        value={bookingUrl}
                        onChange={(e) => setBookingUrl(e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        placeholder="e.g., Zocdoc link or online scheduler"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Brand & Goals */}
            {currentStep === 3 && (
              <div className="animate-in fade-in duration-300">
                <div className="mb-6">
                  <h2 className="text-xl font-bold tracking-tight text-gray-900">
                    Brand &amp; goals
                  </h2>
                  <p className="mt-1.5 text-sm text-gray-600">
                    Help our AI match your practice&apos;s unique voice and understand what you want to achieve.
                  </p>
                </div>

                <div className="space-y-5">
                  {/* Brand Voice */}
                  <div>
                    <label htmlFor="brandVoice" className="block text-sm font-medium text-gray-700">
                      Brand Voice <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-1.5">
                      <MessageSquare className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <select
                        id="brandVoice"
                        value={brandVoice}
                        onChange={(e) => setBrandVoice(e.target.value)}
                        className={`block w-full rounded-lg border pl-10 pr-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                          fieldErrors.brandVoice
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-gray-300 focus:border-primary-500'
                        } ${!brandVoice ? 'text-gray-400' : 'text-gray-900'}`}
                      >
                        <option value="" disabled>Select your brand voice...</option>
                        {BRAND_VOICES.map((voice) => (
                          <option key={voice} value={voice}>{voice}</option>
                        ))}
                      </select>
                    </div>
                    {fieldErrors.brandVoice && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.brandVoice}</p>
                    )}
                  </div>

                  {/* Communication Style */}
                  <div>
                    <label htmlFor="communicationStyle" className="block text-sm font-medium text-gray-700">
                      Communication Style <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-1.5">
                      <PenLine className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <select
                        id="communicationStyle"
                        value={communicationStyle}
                        onChange={(e) => setCommunicationStyle(e.target.value)}
                        className={`block w-full rounded-lg border pl-10 pr-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                          fieldErrors.communicationStyle
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-gray-300 focus:border-primary-500'
                        } ${!communicationStyle ? 'text-gray-400' : 'text-gray-900'}`}
                      >
                        <option value="" disabled>Select your communication style...</option>
                        {COMMUNICATION_STYLES.map((style) => (
                          <option key={style} value={style}>{style}</option>
                        ))}
                      </select>
                    </div>
                    {fieldErrors.communicationStyle && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.communicationStyle}</p>
                    )}
                  </div>

                  {/* Business Goals */}
                  <div>
                    <label htmlFor="businessGoals" className="block text-sm font-medium text-gray-700">
                      Business Goals <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <div className="relative mt-1.5">
                      <Target className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <textarea
                        id="businessGoals"
                        rows={4}
                        value={businessGoals}
                        onChange={(e) => setBusinessGoals(e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        placeholder="e.g., Get 20 new patients this quarter, improve our Google reviews, update our website"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex items-center gap-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              )}

              {currentStep < TOTAL_STEPS ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-primary ml-auto flex items-center gap-1.5 py-2.5"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="btn-primary ml-auto flex items-center gap-1.5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <CheckCircle2 className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Skip hint */}
            {currentStep === 1 && (
              <p className="mt-4 text-center text-xs text-gray-500">
                You can update these details anytime from your dashboard settings.
              </p>
            )}
          </div>

          {/* Step 2 & 3: encouragement */}
          {currentStep >= 2 && (
            <p className="mt-4 text-center text-xs text-gray-500">
              The more you tell us, the better our AI can personalize your content and recommendations.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

/** Reusable header matching the app's design */
function Header() {
  return (
    <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-primary-500" />
          <span className="text-xl font-bold text-gray-900">
            CareConnect<span className="text-primary-500">AI</span>
          </span>
        </Link>
        <span className="text-sm text-gray-500">Setting up your practice</span>
      </div>
    </header>
  );
}
