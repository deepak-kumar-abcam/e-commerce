#!/usr/bin/env node
// @ts-check
/**
 * Downloads every OpenAPI definition an Intershop REST application publishes
 * into openapi/intershop/, one YAML file per API. The docs regenerate from
 * those files, so this is all a refresh needs.
 *
 * Every OpCo sales channel serves the same APIs from its own site and REST
 * application; the defaults below are the PHX US one.
 *
 *   npm run api:fetch
 *   npm run api:fetch -- --site "<OpCo site>" --app "<OpCo REST application>"
 *
 * Files for APIs the server no longer lists are removed. Hand-edited files are
 * overwritten, so change specs at the source rather than here.
 *
 * Intershop emits schema properties and components in a different order on
 * each request, so both are sorted before saving; otherwise every refresh
 * would show as a change in git.
 */
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { parse, stringify } from 'yaml';

const { values } = parseArgs({
	options: {
		host: { type: 'string', default: 'https://shop.lifesciences.danaher.com' },
		site: { type: 'string', default: 'PHX-PHXUS-Site' },
		app: { type: 'string', default: 'PheneomenexRest' },
		out: { type: 'string', default: 'openapi/intershop' },
	},
});

const base = `${values.host}/INTERSHOP/rest/WFS/SMC/-/swagger/${values.site}/${values.app}/oapi`;

/** @param {string} url */
async function get(url) {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
	return res.text();
}

/** @param {Record<string, unknown>} map */
const sortKeys = (map) => Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b)));

/** Sorts every `properties` map by key. @param {any} node @returns {any} */
function sortProperties(node) {
	if (Array.isArray(node)) return node.map(sortProperties);
	if (!node || typeof node !== 'object') return node;
	const sorted = Object.fromEntries(Object.entries(node).map(([key, value]) => [key, sortProperties(value)]));
	if (sorted.properties && typeof sorted.properties === 'object' && !Array.isArray(sorted.properties)) {
		sorted.properties = sortKeys(sorted.properties);
	}
	return sorted;
}

/** Gives a spec a stable order: sorted properties and component sections. @param {any} doc */
function normalize(doc) {
	const out = sortProperties(doc);
	for (const [section, entries] of Object.entries(out.components ?? {})) {
		if (entries && typeof entries === 'object') out.components[section] = sortKeys(entries);
	}
	return out;
}

/** @type {{ id: string | null, title: string, version: string }[]} */
const apis = JSON.parse(await get(`${base}.info`));
console.log(`${apis.length} APIs listed by ${values.site}/${values.app}`);

await mkdir(values.out, { recursive: true });

// The entry with no id holds the paths not assigned to any API.
const fileFor = (/** @type {string | null} */ id) => `${id ?? 'unassigned'}.yaml`;

await Promise.all(
	apis.map(async ({ id, title, version }) => {
		const yaml = await get(`${base}.yaml${id ? `?apiID=${encodeURIComponent(id)}` : ''}`);
		await writeFile(join(values.out, fileFor(id)), stringify(normalize(parse(yaml)), { lineWidth: 0 }));
		console.log(`  ✓ ${fileFor(id).padEnd(34)} ${title} ${version}`);
	})
);

const expected = new Set(apis.map((a) => fileFor(a.id)));
for (const file of await readdir(values.out)) {
	if (/\.ya?ml$/.test(file) && !expected.has(file)) {
		await rm(join(values.out, file));
		console.log(`  ✗ ${file} removed — no longer listed`);
	}
}
