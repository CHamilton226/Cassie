// Create Stripe Products & Prices for CareConnect AI
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || process.argv[2];
if (!STRIPE_KEY) {
  console.error('Usage: node create-stripe-prices.mjs <STRIPE_SECRET_KEY>');
  process.exit(1);
}

const AUTH = `Basic ${Buffer.from(STRIPE_KEY + ':').toString('base64')}`;

async function stripePost(path, params) {
  // Build body manually — Stripe needs literal brackets in keys (recurring[interval]=month)
  const parts = [];
  for (const [k, v] of Object.entries(params)) {
    // Only encode the value, keep brackets in keys literal
    parts.push(`${k}=${encodeURIComponent(v)}`);
  }
  const body = parts.join('&');
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method: 'POST',
    headers: { 'Authorization': AUTH, 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`Error ${path}:`, JSON.stringify(data, null, 2));
    process.exit(1);
  }
  return data;
}

async function stripeGet(path) {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    headers: { 'Authorization': AUTH },
  });
  return res.json();
}

const TIERS = [
  { id: 'starter', name: 'Starter', desc: 'For solo practitioners ready to grow their online presence.', monthly: 2900, annual: 29000 },
  { id: 'pro', name: 'Pro', desc: 'For growing practices that want a complete marketing toolkit.', monthly: 7900, annual: 79000 },
  { id: 'practice', name: 'Practice', desc: 'For practices with multiple providers and complex needs.', monthly: 14900, annual: 149000 },
  { id: 'agency', name: 'Agency', desc: 'For marketing agencies managing multiple healthcare clients.', monthly: 29900, annual: 299000 },
];

const results = {};

// Check existing products first
console.log('Checking existing products...');
const existing = await stripeGet('/products?limit=20');
const existingMap = {};
for (const p of existing.data) {
  existingMap[p.metadata?.tier] = p;
  console.log(`  Found: ${p.name} (${p.id}) tier=${p.metadata?.tier}`);
}

for (const tier of TIERS) {
  let product;
  if (existingMap[tier.id]) {
    console.log(`\nSkipping product creation for ${tier.name} (already exists: ${existingMap[tier.id].id})`);
    product = existingMap[tier.id];
  } else {
    console.log(`\nCreating product: ${tier.name}...`);
    product = await stripePost('/products', {
      name: `CareConnect AI - ${tier.name}`,
      description: tier.desc,
      'metadata[tier]': tier.id,
      statement_descriptor: `CCAI ${tier.name.toUpperCase()}`.substring(0, 22),
    });
    console.log(`  Product ID: ${product.id}`);
  }

  // Check for existing prices on this product
  console.log(`  Checking existing prices for product ${product.id}...`);
  const prices = await stripeGet(`/prices?product=${product.id}&limit=10`);
  const existingPrices = {};
  for (const p of prices.data) {
    existingPrices[p.metadata?.billing] = p;
    console.log(`    Found price: ${p.id} (${p.metadata?.billing})`);
  }

  let monthlyPrice, annualPrice;

  if (existingPrices.monthly) {
    console.log(`  Using existing monthly price: ${existingPrices.monthly.id}`);
    monthlyPrice = existingPrices.monthly;
  } else {
    console.log(`  Creating monthly price ($${tier.monthly / 100}/mo)...`);
    monthlyPrice = await stripePost('/prices', {
      product: product.id,
      currency: 'usd',
      unit_amount: tier.monthly,
      'recurring[interval]': 'month',
      'metadata[tier]': tier.id,
      'metadata[billing]': 'monthly',
      lookup_key: `careconnect_${tier.id}_monthly`,
    });
    console.log(`    Monthly Price ID: ${monthlyPrice.id}`);
  }

  if (existingPrices.annual) {
    console.log(`  Using existing annual price: ${existingPrices.annual.id}`);
    annualPrice = existingPrices.annual;
  } else {
    console.log(`  Creating annual price ($${tier.annual / 100}/yr)...`);
    annualPrice = await stripePost('/prices', {
      product: product.id,
      currency: 'usd',
      unit_amount: tier.annual,
      'recurring[interval]': 'year',
      'metadata[tier]': tier.id,
      'metadata[billing]': 'annual',
      lookup_key: `careconnect_${tier.id}_annual`,
    });
    console.log(`    Annual Price ID: ${annualPrice.id}`);
  }

  results[tier.id] = {
    productId: product.id,
    monthlyPriceId: monthlyPrice.id,
    annualPriceId: annualPrice.id,
  };
}

console.log('\n============ RESULTS ============');
console.log(JSON.stringify(results, null, 2));
console.log('================================\n');

console.log('// Paste these into pricing.ts:');
for (const [tier, ids] of Object.entries(results)) {
  console.log(`// ${tier}`);
  console.log(`stripePriceIdMonthly: '${ids.monthlyPriceId}',`);
  console.log(`stripePriceIdAnnual: '${ids.annualPriceId}',`);
  console.log('');
}
