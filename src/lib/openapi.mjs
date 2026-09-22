// @ts-check
/**
 * Reads the Intershop OpenAPI files in `openapi/intershop/`. Shared by
 * astro.config.mjs (one generated reference per file) and the API overview
 * page, so adding, replacing, or removing a YAML file is the only step needed
 * to update the docs.
 *
 * Plain JS rather than TS because astro.config.mjs imports it.
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse, stringify } from 'yaml';

export const SPEC_DIR = 'openapi/intershop';

/** Render-ready copies of the specs, regenerated on every dev/build start. */
const RENDER_DIR = '.astro/openapi';

/** Route prefix for the generated reference pages. */
export const API_BASE = 'api';

/**
 * An operation counts as a Danaher customization when any of these holds:
 * its resource class is in a `com.danaher` package or named `Danaher…` (some
 * live in `com.intershop` packages), or one of its tags names Danaher or
 * "Custom".
 */
const CUSTOM_PACKAGE = 'com.danaher.';
const CUSTOM_CLASS = /(^|\.)Danaher\w*$/;
const CUSTOM_TAG = /danaher|custom/i;
/** @param {string | undefined} originClass @param {string[]} tags */
const isCustom = (originClass, tags) =>
	Boolean(originClass && (originClass.startsWith(CUSTOM_PACKAGE) || CUSTOM_CLASS.test(originClass))) ||
	tags.some((t) => CUSTOM_TAG.test(t));

/** Title Intershop gives specs with no title of their own. */
const GENERIC_TITLE = 'Intershop REST API';

const METHODS = ['get', 'put', 'post', 'delete', 'patch', 'head', 'options'];

/** Labels for specs whose own title is the generic one. Missing ids fall back to the file name. */
const labelOverrides = {
	unassigned: 'Other Danaher endpoints',
	userProfile: 'Auth0 user profile',
	'payment-intent': 'Stripe payments',
	dynamicReport: 'Dynamic reports',
	orderList: 'Order list',
	userLogin: 'User login',
};

/** @param {string} id */
const humanize = (id) =>
	id
		.replace(/[_-]v\d+$/, '')
		.replace(/[-_]/g, ' ')
		.replace(/([a-z])([A-Z])/g, '$1 $2')
		.replace(/^\w/, (c) => c.toUpperCase());

/**
 * @typedef {object} ApiOperation
 * @property {string} method
 * @property {string} path
 * @property {string | undefined} summary
 * @property {string | undefined} originClass Java resource class, from `x-origin-class`.
 * @property {boolean} custom
 *
 * @typedef {object} ApiSpec
 * @property {string} id File name without extension; also the route segment.
 * @property {string} file Path relative to the project root.
 * @property {any} doc The parsed OpenAPI document.
 * @property {string} label
 * @property {string} version
 * @property {string | undefined} description
 * @property {ApiOperation[]} operations
 * @property {number} customCount
 * @property {boolean} allCustom Every operation is a Danaher customization.
 */

/** @param {string} root Project root. @returns {ApiSpec[]} */
export function loadSpecs(root = process.cwd()) {
	const files = readdirSync(join(root, SPEC_DIR))
		.filter((f) => /\.ya?ml$/.test(f))
		.sort();

	const specs = files.map((file) => {
		const id = file.replace(/\.ya?ml$/, '');
		const doc = parse(readFileSync(join(root, SPEC_DIR, file), 'utf8'));

		/** @type {Record<string, string>} */
		const tagClasses = Object.fromEntries(
			(doc.tags ?? []).map((/** @type {any} */ t) => [t.name, t['x-origin-class']])
		);

		/** @type {ApiOperation[]} */
		const operations = [];
		for (const [path, item] of Object.entries(doc.paths ?? {})) {
			for (const method of METHODS) {
				const op = item?.[method];
				if (!op) continue;
				const tags = op.tags ?? [];
				const originClass = op['x-origin-class'] ?? tagClasses[tags[0]];
				operations.push({
					method: method.toUpperCase(),
					path,
					summary: op.summary,
					originClass,
					custom: isCustom(originClass, tags),
				});
			}
		}

		const title = doc.info?.title;
		const customCount = operations.filter((o) => o.custom).length;
		return {
			id,
			file: `${SPEC_DIR}/${file}`,
			doc,
			title: title && title !== GENERIC_TITLE ? title : (labelOverrides[id] ?? humanize(id)),
			version: String(doc.info?.version ?? ''),
			description: doc.info?.description,
			operations,
			customCount,
			allCustom: operations.length > 0 && customCount === operations.length,
		};
	});

	// Several APIs ship in two versions under one title (Basket, Order, …); the
	// version tells them apart in the sidebar.
	return specs
		.map(({ title, ...spec }) => ({
			...spec,
			label: specs.filter((s) => s.title === title).length > 1 ? `${title} v${spec.version}` : title,
		}))
		.sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * starlight-openapi dereferences each spec and renders schemas recursively
 * with no cycle guard, so any circular `$ref` overflows the stack. Intershop's
 * specs have two kinds, both broken in a copy so the source files stay
 * untouched and a refresh never undoes this:
 *
 * - Polymorphic bases list their subtypes (discriminator `mapping`, `oneOf`)
 *   while each subtype extends the base via `allOf`. The base's links to its
 *   subtypes are dropped and the subtypes named in its description instead,
 *   so the subtypes keep their inherited fields.
 * - Any cycle left (self-referencing trees and the like) has the reference
 *   that closes it replaced with a stub naming the type.
 *
 * The copy also makes operation IDs unique: pages are routed by ID, and
 * Intershop reuses some (e.g. the standard and Danaher token endpoints), which
 * would otherwise drop all but one page.
 *
 * @param {ApiSpec[]} specs @param {string} root
 * @returns {Record<string, string>} Render-ready path per spec id.
 */
export function writeRenderableSpecs(specs, root = process.cwd()) {
	mkdirSync(join(root, RENDER_DIR), { recursive: true });

	return Object.fromEntries(
		specs.map((spec) => {
			const path = `${RENDER_DIR}/${spec.id}.yaml`;
			const doc = uniqueOperationIds(breakCycles(structuredClone(spec.doc)));
			writeFileSync(join(root, path), stringify(doc, { lineWidth: 0 }));
			return [spec.id, `./${path}`];
		})
	);
}

const SCHEMA_REF = '#/components/schemas/';

/** @param {any} doc Mutated in place. */
function breakCycles(doc) {
	/** @type {Record<string, any>} */
	const schemas = doc.components?.schemas ?? {};

	for (const schema of Object.values(schemas)) {
		if (!schema?.discriminator) continue;
		const { mapping, ...discriminator } = schema.discriminator;
		const subtypes = mapping
			? Object.entries(mapping).map(([value, ref]) => `\`${value}\` → ${String(ref).split('/').pop()}`)
			: (schema.oneOf ?? schema.anyOf ?? []).map((/** @type {any} */ s) => s.$ref?.split('/').pop()).filter(Boolean);
		schema.discriminator = discriminator;
		delete schema.oneOf;
		delete schema.anyOf;
		if (subtypes.length > 0) {
			schema.description = [schema.description, `Subtypes by \`${discriminator.propertyName}\`: ${subtypes.join(', ')}.`]
				.filter(Boolean)
				.join('\n\n');
		}
	}

	/** @type {Map<string, 'active' | 'done'>} */
	const state = new Map();

	/** @param {any} node @returns {any} */
	const walk = (node) => {
		if (Array.isArray(node)) return node.map(walk);
		if (!node || typeof node !== 'object') return node;
		if (typeof node.$ref === 'string' && node.$ref.startsWith(SCHEMA_REF)) {
			const name = node.$ref.slice(SCHEMA_REF.length);
			if (state.get(name) === 'active') {
				return { type: 'object', title: name, description: `Recursive — same structure as \`${name}\`.` };
			}
			if (!state.has(name)) visit(name);
			return node;
		}
		for (const key of Object.keys(node)) node[key] = walk(node[key]);
		return node;
	};

	/** @param {string} name */
	const visit = (name) => {
		state.set(name, 'active');
		if (schemas[name]) schemas[name] = walk(schemas[name]);
		state.set(name, 'done');
	};

	for (const name of Object.keys(schemas)) if (!state.has(name)) visit(name);
	return doc;
}

/** Suffixes repeated operation IDs (`_2`, `_3`, …), keeping the first as is. @param {any} doc */
function uniqueOperationIds(doc) {
	/** @type {Map<string, number>} */
	const seen = new Map();
	for (const item of Object.values(doc.paths ?? {})) {
		for (const method of METHODS) {
			const op = item?.[method];
			if (!op?.operationId) continue;
			const key = op.operationId.toLowerCase();
			const count = (seen.get(key) ?? 0) + 1;
			seen.set(key, count);
			if (count > 1) op.operationId = `${op.operationId}_${count}`;
		}
	}
	return doc;
}
