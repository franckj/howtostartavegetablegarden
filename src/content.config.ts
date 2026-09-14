import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const faq = z.object({ q: z.string(), a: z.string() });

/**
 * Every page's prose lives in src/content/guides/*.md so an upgraded draft can
 * replace a page wholesale without touching components. Frontmatter carries the
 * structured bits (answer, FAQ, schema, internal links).
 */
const guides = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/guides' }),
  schema: z.object({
    /** <title> — may differ from the H1. */
    title: z.string().max(70),
    description: z.string().max(160),
    h1: z.string(),
    /** Short label for breadcrumbs; falls back to the H1. */
    crumb: z.string().optional(),
    /** URL path, always with a trailing slash. */
    path: z.string().regex(/^\/([a-z0-9-]+\/)*$/),
    /** Snippet-ready direct answer. One or two short paragraphs. */
    answer: z.array(z.string()).min(1),
    answerLabel: z.string().optional(),
    eyebrow: z.string().optional(),
    /** Optional floor only — the shown date is computed from git (src/lib/updated.ts). */
    dateModified: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    faqs: z.array(faq).min(4),
    /** Slugs of sibling guides to link at the end. */
    related: z.array(z.string()).default([]),
    /** Show the auto-generated table of contents. */
    toc: z.boolean().default(true),
    /** HowTo schema — homepage only. */
    howTo: z
      .object({
        name: z.string(),
        totalTime: z.string(),
        estimatedCost: z.string(),
        supply: z.array(z.string()),
        tool: z.array(z.string()),
        /** `anchor` must match a rendered H2 slug — index.astro asserts this at build time. */
        steps: z.array(
          z.object({ name: z.string(), text: z.string(), anchor: z.string() })
        ),
      })
      .optional(),
    /** Cost comparison cards — homepage only. */
    costs: z
      .array(
        z.object({
          label: z.string(),
          total: z.string(),
          items: z.array(z.object({ item: z.string(), price: z.string() })),
        })
      )
      .optional(),
  }),
});

/** Static, non-guide pages: about, contact, legal. */
const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    title: z.string().max(70),
    description: z.string().max(160),
    h1: z.string(),
    crumb: z.string().optional(),
    path: z.string().regex(/^\/([a-z0-9-]+\/)*$/),
    /** Optional floor only — the shown date is computed from git (src/lib/updated.ts). */
    dateModified: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    noindex: z.boolean().default(false),
  }),
});

export const collections = { guides, pages };
