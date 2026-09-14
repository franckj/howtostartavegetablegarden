import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

/**
 * "Last updated" dates are computed, never typed. A page's date is the latest
 * git commit touching the files its content comes from — its prose or template
 * plus the data it renders — and today if any of them has uncommitted changes.
 *
 * Deliberately NOT a build date: shared-code or layout changes would bump every
 * page (fake freshness), and the brief's control pages must keep their dates
 * unless their own content changes. The dates typed before 2026-09-14 act as a
 * floor so no page moves backwards.
 *
 * Mechanical commits (imports, refactors, sitewide renames) put `[skip-date]` in
 * the commit message and are ignored here, so they cannot fake freshness.
 * Uncommitted changes count as today — dev builds only; the pre-push hook builds
 * a committed tree.
 *
 * Needs full git history at build time. Builds run locally via the pre-push
 * hook; a shallow CI clone would need `fetch-depth: 0`.
 */
const today = () => new Date().toISOString().slice(0, 10);
const cache = new Map<string, string | null>();

function gitDate(path: string): string | null {
  if (cache.has(path)) return cache.get(path)!;
  let date: string | null = null;
  try {
    const dirty = execFileSync('git', ['status', '--porcelain', '--', path], { encoding: 'utf8' }).trim();
    date = dirty
      ? today()
      : execFileSync(
          'git',
          ['log', '-1', '--format=%cs', '--fixed-strings', '--invert-grep', '--grep=[skip-date]', '--', path],
          { encoding: 'utf8' }
        ).trim() || null;
  } catch {
    date = null;
  }
  cache.set(path, date);
  return date;
}

/** Latest change date across files, never earlier than `floor`. Paths are repo-relative. */
export function lastChanged(paths: string[], floor = '2026-07-30'): string {
  return paths.map(gitDate).reduce<string>((max, d) => (d && d > max ? d : max), floor);
}

/** Data files a content page renders, detected from the components its prose uses. */
export function contentDeps(filePath: string): string[] {
  const deps = [filePath];
  const src = readFileSync(filePath, 'utf8');
  if (/<(CropDifficultyTable|CropSpacingTable|SeedStartTable)\b/.test(src)) deps.push('src/data/crops.json');
  return deps;
}

/** Everything that feeds visible content anywhere on the site. */
export const SITE_CONTENT_PATHS = ['src/content', 'src/data', 'src/pages'];
