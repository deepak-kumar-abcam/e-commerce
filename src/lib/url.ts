/**
 * Site-root paths written in data and components (`/features/`) must carry the
 * configured `base` (`/e-commerce`) once deployed to GitHub Pages, or they 404.
 * Starlight prefixes its own sidebar links; ours are our responsibility.
 */
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Prefix a site-root path with the configured `base`. */
export function withBase(path: string): string {
	return `${base}${path}`;
}
