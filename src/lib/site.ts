export const SITE = {
  domain: 'howtostartavegetablegarden.com',
  origin: 'https://howtostartavegetablegarden.com',
  name: 'How to Start a Vegetable Garden',
  tagline: 'Plain-English guides for first-time vegetable gardeners.',
  email: 'hello@howtostartavegetablegarden.com',
  /** Site-specific Plausible script (new pa-* format, from the Plausible dashboard). */
  plausibleScript: 'https://plausible.io/js/pa-033EHS82pAgyEh11ZPIuC.js',
  /** Bumped whenever v1 content is reviewed; surfaced in schema + footer. */
  lastUpdated: '2026-07-31',
} as const;

/** Desktop-only header links. Hidden on mobile, where only the CTA shows. */
export const NAV = [
  { href: '/planting-calendar/', label: 'Planting calendar' },
  { href: '/glossary/', label: 'Glossary' },
  { href: '/resources/', label: 'Resources' },
] as const;

/** The green button, always visible including on mobile. */
export const NAV_CTA = { href: '/', label: 'Start here' } as const;

export const GUIDE_LINKS = [
  {
    href: '/easiest-vegetables-for-beginners/',
    title: 'The 10 easiest vegetables for beginners',
    blurb: 'Ranked by how hard they are to kill, with days to harvest for each.',
  },
  {
    href: '/raised-beds-vs-containers-vs-in-ground/',
    title: 'Raised beds vs containers vs in-ground',
    blurb: 'Cost, effort and yield compared, so you can pick a setup in one sitting.',
  },
  {
    href: '/starting-seeds-indoors/',
    title: 'Starting seeds indoors',
    blurb: 'What you actually need, the timeline that works, and how to harden off.',
  },
  {
    href: '/planting-calendar/',
    title: 'Planting calendar by USDA zone',
    blurb: 'Pick your zone and month to see what to sow, start indoors or transplant.',
  },
] as const;

export const FOOTER_LEGAL = [
  { href: '/about/', label: 'About' },
  { href: '/glossary/', label: 'Glossary' },
  { href: '/resources/', label: 'Resources' },
  { href: '/contact/', label: 'Contact' },
  { href: '/privacy-policy/', label: 'Privacy policy' },
  { href: '/terms-of-service/', label: 'Terms of service' },
] as const;

/** "2026-07-30" -> "July 30, 2026" */
export function humanDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${months[m - 1]} ${d}, ${y}`;
}

export interface Faq {
  q: string;
  a: string;
}

/** FAQPage JSON-LD from a list of question/answer pairs. */
export function faqSchema(faqs: readonly Faq[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

/** BreadcrumbList JSON-LD. Pass [{name, path}] from home to current page. */
export function breadcrumbSchema(items: readonly { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE.origin}${item.path}`,
    })),
  };
}
