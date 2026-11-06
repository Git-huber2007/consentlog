const CookieInventory = require('../models/CookieInventory');

const BASELINE_COOKIES = [
  {
    name: 'cl_session',
    provider: 'ConsentLog Enterprise',
    category: 'essential',
    domain: '.consentlog.io',
    duration: 'Session',
    description: 'Cryptographic JWT session token maintaining authenticated state and tenant context.',
    isHttpOnly: true,
    isSecure: true,
  },
  {
    name: '__Host-csrf_token',
    provider: 'ConsentLog Enterprise',
    category: 'essential',
    domain: '.consentlog.io',
    duration: 'Session',
    description: 'Double-submitted HMAC token guarding against Cross-Site Request Forgery attacks.',
    isHttpOnly: true,
    isSecure: true,
  },
  {
    name: '__cf_bm',
    provider: 'Cloudflare',
    category: 'essential',
    domain: '.cloudflare.com',
    duration: '30 minutes',
    description: 'Cloudflare bot management cookie used to distinguish between human users and automated scrapers.',
    isHttpOnly: true,
    isSecure: true,
  },
  {
    name: '_ga',
    provider: 'Google Analytics 4',
    category: 'analytics',
    domain: '.google-analytics.com',
    duration: '13 months',
    description: 'Calculates anonymous visitor, session, and campaign data with IP-masking under GDPR.',
    isHttpOnly: false,
    isSecure: true,
  },
  {
    name: '_gid',
    provider: 'Google Analytics 4',
    category: 'analytics',
    domain: '.google-analytics.com',
    duration: '24 hours',
    description: 'Stores and updates a unique value for each page visited to generate aggregate usage metrics.',
    isHttpOnly: false,
    isSecure: true,
  },
  {
    name: '_fbp',
    provider: 'Meta Pixel',
    category: 'marketing',
    domain: '.facebook.com',
    duration: '3 months',
    description: 'Used by Meta to deliver and measure targeted enterprise compliance webinar campaigns.',
    isHttpOnly: false,
    isSecure: true,
  },
  {
    name: 'li_sugr',
    provider: 'LinkedIn Insight Tag',
    category: 'marketing',
    domain: '.linkedin.com',
    duration: '3 months',
    description: 'Used to track probabilistic match of user identity outside designated enterprise domains.',
    isHttpOnly: false,
    isSecure: true,
  },
  {
    name: 'cl_theme',
    provider: 'ConsentLog Enterprise',
    category: 'personalization',
    domain: '.consentlog.io',
    duration: '1 year',
    description: 'Remembers user interface preference (Dark Mode vs Light Mode) and active tenant view.',
    isHttpOnly: false,
    isSecure: false,
  },
  {
    name: 'cl_jurisdiction_preset',
    provider: 'ConsentLog Enterprise',
    category: 'personalization',
    domain: '.consentlog.io',
    duration: '6 months',
    description: 'Persists user chosen compliance region (GDPR, CCPA, DPDP, LGPD) for localized banners.',
    isHttpOnly: false,
    isSecure: false,
  },
  {
    name: 'ajs_user_id',
    provider: 'Twilio Segment',
    category: 'thirdPartySharing',
    domain: '.segment.com',
    duration: '1 year',
    description: 'Encrypted telemetry stream routing compliance signals to SOC2 Type II vetted sub-processors.',
    isHttpOnly: false,
    isSecure: true,
  },
  {
    name: 'stripe_mid',
    provider: 'Stripe Payments',
    category: 'essential',
    domain: '.stripe.com',
    duration: '1 year',
    description: 'Stripe fraud detection cookie required to process enterprise license invoices.',
    isHttpOnly: true,
    isSecure: true,
  },
];

const ensureCookieInventory = async (organization = 'Enterprise Global Corp') => {
  const count = await CookieInventory.countDocuments({ organization });
  if (count === 0) {
    const records = BASELINE_COOKIES.map((c) => ({
      ...c,
      organization,
    }));
    await CookieInventory.insertMany(records);
  }
};

const scanDomainAndCatalog = async (targetDomain, organization = 'Enterprise Global Corp') => {
  await ensureCookieInventory(organization);

  // Clean domain input
  let domain = targetDomain.replace(/^(?:https?:\/\/)?/i, '').split('/')[0];
  if (!domain) domain = 'example-portal.com';

  // Seed or discover domain-specific simulated cookies
  const discovered = [
    {
      name: `_sess_${domain.replace(/[^a-z0-9]/gi, '')}`,
      provider: `${domain} Portal`,
      category: 'essential',
      domain: `.${domain}`,
      duration: 'Session',
      description: `Primary application security session cookie detected on ${domain}.`,
      isHttpOnly: true,
      isSecure: true,
      organization,
    },
    {
      name: '_ga_4MEASURE',
      provider: 'Google Analytics',
      category: 'analytics',
      domain: `.${domain}`,
      duration: '13 months',
      description: `Discovered active GA4 measurement stream tag on ${domain}.`,
      isHttpOnly: false,
      isSecure: true,
      organization,
    },
    {
      name: '_mkto_trk',
      provider: 'Marketo / Adobe',
      category: 'marketing',
      domain: `.${domain}`,
      duration: '2 years',
      description: `Discovered B2B lead attribution and campaign tag on ${domain}.`,
      isHttpOnly: false,
      isSecure: true,
      organization,
    },
  ];

  for (const item of discovered) {
    const exists = await CookieInventory.findOne({ name: item.name, organization });
    if (!exists) {
      await CookieInventory.create(item);
    }
  }

  const allCookies = await CookieInventory.find({ organization }).sort({ category: 1, name: 1 });
  return {
    scannedDomain: domain,
    totalDiscovered: allCookies.length,
    newlyAdded: discovered.length,
    inventory: allCookies,
  };
};

module.exports = {
  BASELINE_COOKIES,
  ensureCookieInventory,
  scanDomainAndCatalog,
};

