/**
 * Markdown and MDX links are emitted verbatim, so a site-root link such as
 * `[feature lists](/features/)` breaks once the site is served under a `base`
 * (`/e-commerce` on GitHub Pages). This prefixes those links at build time, so
 * content keeps using plain site-root paths.
 *
 * Only in-site absolute paths are touched: protocol-relative URLs, anchors,
 * relative paths, and paths already carrying the base are left alone.
 */
export function rehypeBaseLinks({ base = '/' } = {}) {
	const prefix = base.replace(/\/$/, '');

	return (tree) => {
		if (!prefix) return;

		visit(tree, (node) => {
			if (node.type !== 'element' || node.tagName !== 'a') return;

			const href = node.properties?.href;
			if (typeof href !== 'string') return;
			if (!href.startsWith('/') || href.startsWith('//')) return;
			if (href === prefix || href.startsWith(`${prefix}/`)) return;

			node.properties.href = `${prefix}${href}`;
		});
	};
}

/** Minimal hast walk, so this plugin needs no dependency of its own. */
function visit(node, callback) {
	callback(node);
	for (const child of node.children ?? []) visit(child, callback);
}
