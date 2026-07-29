export interface SeoLandingPage {
  slug: string;
  title: string;
  metaDescription: string;
  practiceType: string;
  heroTitle: string;
  heroSubtitle: string;
  challenges: { title: string; description: string }[];
  solutions: { title: string; description: string }[];
  relatedBlogSlugs: string[];
}

export const seoLandingPages: SeoLandingPage[] = [
  {
    slug: 'medical-practices',
    title: 'AI Marketing for Medical Practices — CareConnect AI',
    metaDescription: 'Grow your medical practice with AI-powered marketing tools. Generate content, manage reviews, and get a personalized growth plan — all designed for medical practices.',
    practiceType: 'Medical Practices',
    heroTitle: 'AI Marketing Tools Built for Medical Practices',
    heroSubtitle: 'Save time on marketing, attract more patients, and build a stronger online presence — without learning complex software or hiring an agency.',
    challenges: [
      {
        title: 'Limited Time for Marketing',
        description: 'Between patient appointments, administrative work, and managing staff, marketing is often the last thing on a medical practice owner\'s mind. Yet without consistent marketing, practices struggle to attract new patients.',
      },
      {
        title: 'Professional Tone Requirements',
        description: 'Medical practices need marketing that strikes the right balance — professional and trustworthy, but also warm and approachable. Generic marketing tools often produce content that feels either too corporate or too casual for healthcare.',
      },
      {
        title: 'HIPAA Awareness in Communications',
        description: 'Every public communication from a medical practice must respect patient privacy. A single misstep in a review response or social post can create serious compliance concerns.',
      },
      {
        title: 'Staying Competitive in a Digital World',
        description: 'Larger healthcare systems have dedicated marketing teams and substantial budgets. Independent medical practices need efficient, effective tools to compete for patient attention online.',
      },
    ],
    solutions: [
      {
        title: 'AI Content Creator — Medical Practice Edition',
        description: 'Generate social media posts, blog articles, and patient newsletters that match the professional tone of a medical practice. Our AI understands healthcare contexts and creates content that builds trust without feeling clinical.',
      },
      {
        title: 'Review Response Assistant',
        description: 'Respond to patient reviews quickly and professionally while maintaining HIPAA compliance. Our AI drafts responses that are warm, grateful, and never disclose patient information.',
      },
      {
        title: 'Practice Growth Score & Website Audit',
        description: 'Get a comprehensive analysis of your medical practice\'s online presence with a 0-100 score and prioritized recommendations for improvement.',
      },
    ],
    relatedBlogSlugs: ['how-ai-helps-small-medical-practices', 'improve-healthcare-website', 'get-more-google-reviews'],
  },
  {
    slug: 'dental-practices',
    title: 'AI Marketing for Dental Practices — CareConnect AI',
    metaDescription: 'Grow your dental practice with AI-powered marketing. Generate social content, manage patient reviews, and attract more patients — all designed for dentists and dental practices.',
    practiceType: 'Dental Practices',
    heroTitle: 'AI Marketing Tools Built for Dental Practices',
    heroSubtitle: 'Attract more patients, manage your online reputation, and grow your dental practice — with AI tools designed specifically for dental professionals.',
    challenges: [
      {
        title: 'Differentiating in a Competitive Market',
        description: 'Most communities have multiple dental practices competing for the same patients. Standing out requires consistent marketing and a strong online presence that showcases what makes your practice different.',
      },
      {
        title: 'Overcoming Dental Anxiety in Marketing',
        description: 'Dental anxiety keeps many people from scheduling appointments. Your marketing needs to communicate warmth, comfort, and compassion — not just clinical expertise.',
      },
      {
        title: 'Before-and-After Ethics',
        description: 'Dental practices often want to showcase results, but before-and-after photos come with ethical and regulatory considerations. Finding the right balance in your marketing content is critical.',
      },
      {
        title: 'Keeping Content Fresh',
        description: 'Social media algorithms favor active, consistent posting. But running a dental practice leaves little time to brainstorm, write, and schedule content on a regular basis.',
      },
    ],
    solutions: [
      {
        title: 'AI Content Creator — Dental Practice Edition',
        description: 'Create engaging social posts about dental health tips, treatment explainers, and practice updates. Our AI generates content that educates patients and builds trust in your expertise.',
      },
      {
        title: 'Review Response Assistant',
        description: 'Manage your online reputation with professional responses to every Google review. Turn positive reviews into patient loyalty and address concerns constructively.',
      },
      {
        title: '30-Day Marketing Plan Engine',
        description: 'Get a day-by-day marketing plan tailored to your dental practice. Know exactly what to post, when to post it, and how to track results.',
      },
    ],
    relatedBlogSlugs: ['improve-healthcare-website', 'get-more-google-reviews', 'attract-patients-without-ads'],
  },
  {
    slug: 'physical-therapy',
    title: 'AI Marketing for Physical Therapy Clinics — CareConnect AI',
    metaDescription: 'Grow your PT clinic with AI marketing tools. Generate educational content, manage reviews, attract more patients, and build your online presence — designed for physical therapists.',
    practiceType: 'Physical Therapy Clinics',
    heroTitle: 'AI Marketing Tools Built for Physical Therapy Clinics',
    heroSubtitle: 'Spend less time on marketing and more time helping patients recover — with AI tools designed for the unique needs of physical therapy practices.',
    challenges: [
      {
        title: 'Educating Patients About PT Benefits',
        description: 'Many potential patients don\'t fully understand what physical therapy can do for them. Your marketing needs to educate — explaining conditions you treat, techniques you use, and outcomes patients can expect.',
      },
      {
        title: 'Referral vs. Direct Access Marketing',
        description: 'With direct access laws expanding, PT clinics can market directly to patients as well as to referring physicians. Balancing these two audiences requires thoughtful, strategic content.',
      },
      {
        title: 'Showcasing Success Stories Appropriately',
        description: 'Patient success stories are powerful marketing tools, but they must be handled carefully. HIPAA compliance means you need proper consent and must avoid disclosing protected information.',
      },
      {
        title: 'Building Trust in a Hands-On Field',
        description: 'Physical therapy is personal and hands-on. Your marketing needs to convey competence, empathy, and professionalism to build the trust patients need before their first appointment.',
      },
    ],
    solutions: [
      {
        title: 'AI Content Creator — PT Edition',
        description: 'Generate educational blog posts about common conditions, treatment approaches, and recovery tips. Our AI creates content that positions your clinic as the local expert in physical therapy.',
      },
      {
        title: 'Website Growth Audit',
        description: 'See how your PT clinic\'s website stacks up with a comprehensive audit. Get a 0-100 score and prioritized recommendations to attract more patients through search.',
      },
      {
        title: 'Communication Templates',
        description: 'Access professionally written templates for patient emails, referral follow-ups, and appointment reminders that keep your practice running smoothly.',
      },
    ],
    relatedBlogSlugs: ['local-seo-medical-practices', 'attract-patients-without-ads', 'website-mistakes-healthcare'],
  },
  {
    slug: 'chiropractic',
    title: 'AI Marketing for Chiropractic Offices — CareConnect AI',
    metaDescription: 'Grow your chiropractic practice with AI-powered marketing. Generate content, manage reviews, and attract new patients — built for chiropractors and wellness professionals.',
    practiceType: 'Chiropractic Offices',
    heroTitle: 'AI Marketing Tools Built for Chiropractic Offices',
    heroSubtitle: 'Attract new patients, build your online reputation, and grow your chiropractic practice with practical AI tools that save you hours every week.',
    challenges: [
      {
        title: 'Explaining Chiropractic Care to New Patients',
        description: 'Many people are curious about chiropractic but don\'t fully understand what it involves. Your marketing needs to educate clearly and address common concerns without oversimplifying or overpromising.',
      },
      {
        title: 'Standing Out in a Wellness Market',
        description: 'Chiropractic offices compete not just with each other, but with physical therapists, massage therapists, and other wellness providers. Clear differentiation is essential.',
      },
      {
        title: 'Managing Online Reputation',
        description: 'Chiropractic care can be polarizing — some patients love it, and some are skeptical. Managing your online reviews and reputation requires consistent, professional engagement.',
      },
      {
        title: 'Content That Demonstrates Expertise',
        description: 'Chiropractors have deep knowledge of the musculoskeletal system and holistic wellness. Your content should showcase this expertise while remaining accessible to patients.',
      },
    ],
    solutions: [
      {
        title: 'AI Content Creator — Chiropractic Edition',
        description: 'Generate blog posts, social media updates, and patient education content about spinal health, posture, wellness, and the benefits of chiropractic care.',
      },
      {
        title: 'Review Response Assistant',
        description: 'Maintain a strong online reputation with professional responses to every review. Address concerns constructively and thank satisfied patients warmly.',
      },
      {
        title: 'Practice Growth Score',
        description: 'Understand exactly where your chiropractic office stands online with a 0-100 score that measures your digital presence across key dimensions.',
      },
    ],
    relatedBlogSlugs: ['get-more-google-reviews', 'attract-patients-without-ads', 'local-seo-medical-practices'],
  },
  {
    slug: 'home-health',
    title: 'AI Marketing for Home Health Agencies — CareConnect AI',
    metaDescription: 'Grow your home health agency with AI marketing tools. Build trust online, manage reviews, and attract more clients and referral partners — designed for home health providers.',
    practiceType: 'Home Health Agencies',
    heroTitle: 'AI Marketing Tools Built for Home Health Agencies',
    heroSubtitle: 'Build trust with families, strengthen referral relationships, and grow your home health agency with marketing tools that understand the unique challenges of home-based care.',
    challenges: [
      {
        title: 'Building Trust With Families',
        description: 'Choosing a home health agency is an emotional, high-stakes decision for families. Your marketing needs to convey trust, compassion, and competence — showing that your caregivers will treat their loved ones like family.',
      },
      {
        title: 'Marketing to Multiple Audiences',
        description: 'Home health agencies serve multiple audiences: potential clients, their family members, hospital discharge planners, and referring physicians. Each needs different messaging and content.',
      },
      {
        title: 'Demonstrating Quality of Care',
        description: 'Unlike a medical office, families can\'t visit your "facility" to assess quality. Your website and online presence must communicate professionalism, training standards, and genuine care.',
      },
      {
        title: 'Navigating Healthcare Regulations',
        description: 'Home health marketing must comply with healthcare advertising regulations while still being warm and human. Finding the right tone requires careful attention.',
      },
    ],
    solutions: [
      {
        title: 'AI Content Creator — Home Health Edition',
        description: 'Create compassionate, informative content for families evaluating care options. Generate blog posts about caregiver qualifications, what to expect from home health, and tips for families.',
      },
      {
        title: 'Website Growth Audit',
        description: 'Ensure your agency\'s website builds the trust families need to reach out. Get a comprehensive audit with a 0-100 Practice Growth Score and actionable recommendations.',
      },
      {
        title: 'Communication Templates',
        description: 'Access templates for family communications, referral follow-ups, and caregiver spotlights that maintain professionalism while showing your agency\'s heart.',
      },
    ],
    relatedBlogSlugs: ['improve-healthcare-website', 'website-mistakes-healthcare', 'attract-patients-without-ads'],
  },
  {
    slug: 'mental-health',
    title: 'AI Marketing for Mental Health Practices — CareConnect AI',
    metaDescription: 'Grow your therapy or counseling practice with AI marketing tools. Generate compassionate content, manage reviews ethically, and attract more clients — designed for mental health professionals.',
    practiceType: 'Mental Health Practices',
    heroTitle: 'AI Marketing Tools Built for Mental Health Practices',
    heroSubtitle: 'Grow your therapy or counseling practice with practical AI tools that respect the sensitive nature of mental healthcare and help you connect with the clients who need you.',
    challenges: [
      {
        title: 'Marketing With Sensitivity',
        description: 'Mental health marketing requires exceptional care. Potential clients may be in distress, and your messaging needs to be warm, hopeful, and professional without being triggering or overpromising.',
      },
      {
        title: 'Reducing Stigma While Maintaining Professionalism',
        description: 'You want to normalize seeking mental health support — but your marketing also needs to maintain the professional boundaries expected of a clinical practice.',
      },
      {
        title: 'Review Management in Mental Health',
        description: 'Client reviews present unique challenges in mental health. Privacy concerns are heightened, and some platforms may not be appropriate for collecting client feedback at all.',
      },
      {
        title: 'Educating About Services and Approaches',
        description: 'Potential clients may not understand the difference between modalities (CBT, EMDR, psychodynamic therapy, etc.) or know which approach might help them. Educational content is essential.',
      },
    ],
    solutions: [
      {
        title: 'AI Content Creator — Mental Health Edition',
        description: 'Generate compassionate, educational content about mental health topics, therapy approaches, and wellness tips. Our AI creates content that informs and encourages without oversimplifying or overpromising.',
      },
      {
        title: '30-Day Marketing Plan Engine',
        description: 'Get a thoughtful, day-by-day marketing plan tailored to your mental health practice. Includes content themes, timing recommendations, and strategies that respect the sensitivity of your field.',
      },
      {
        title: 'Practice Growth Score',
        description: 'Understand how your practice appears online with a comprehensive analysis that respects the unique considerations of mental health marketing.',
      },
    ],
    relatedBlogSlugs: ['how-ai-helps-small-medical-practices', 'attract-patients-without-ads', 'local-seo-medical-practices'],
  },
];

export function getSeoPage(slug: string): SeoLandingPage | undefined {
  return seoLandingPages.find((page) => page.slug === slug);
}

export function getAllSeoSlugs(): string[] {
  return seoLandingPages.map((page) => page.slug);
}
