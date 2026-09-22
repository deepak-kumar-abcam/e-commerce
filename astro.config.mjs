// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';
import starlightOpenAPI, { createOpenAPISidebarGroup } from 'starlight-openapi';

import { API_BASE, loadSpecs, writeRenderableSpecs } from './src/lib/openapi.mjs';
import { rehypeBaseLinks } from './src/lib/rehype-base-links.mjs';

// Served from https://deepak-kumar-abcam.github.io/e-commerce/, so every
// in-site link has to carry this prefix.
const BASE = '/e-commerce';

// One generated API reference per YAML file in openapi/intershop/. APIs made
// entirely of Danaher resources get their own sidebar group.
const apiSpecs = loadSpecs();
const renderablePaths = writeRenderableSpecs(apiSpecs);
const customApiGroup = createOpenAPISidebarGroup();
const standardApiGroup = createOpenAPISidebarGroup();

// https://astro.build/config
export default defineConfig({
	site: 'https://deepak-kumar-abcam.github.io',
	base: BASE,

	// Site-root links in markdown content are emitted verbatim; prefix them.
	markdown: {
		rehypePlugins: [[rehypeBaseLinks, { base: BASE }]],
	},

	integrations: [
		starlight({
			title: 'Commerce Platform Docs',
			description:
				'Documentation for the centrally managed Intershop e-commerce platform serving Danaher Life Sciences, SCIEX, Phenomenex, and Leica Microsystems.',
			plugins: [
				starlightOpenAPI(
					apiSpecs.map((spec) => ({
						base: `${API_BASE}/${spec.id}`,
						schema: renderablePaths[spec.id],
						sidebar: {
							label: spec.label,
							group: spec.allCustom ? customApiGroup : standardApiGroup,
							operations: { badges: true },
						},
					}))
				),
			],
			customCss: [
				// Path to your Tailwind base styles:
				'./src/styles/global.css',
			],
			sidebar: [
				{ label: 'Overview', link: '/' },
				// Each section is a group wrapping an autogenerate config, so pages
				// added to these directories appear in the sidebar automatically.
				{
					label: 'Platform',
					items: [
						{ label: 'Feature Lists', items: [{ autogenerate: { directory: 'features' } }] },
						{
							label: 'Custom Features',
							items: [{ autogenerate: { directory: 'custom-features' } }],
						},
					],
				},
				{
					label: 'Technical',
					items: [
						{
							label: 'Intershop API',
							items: [
								{ autogenerate: { directory: 'api' } },
								{ label: 'Danaher APIs', collapsed: true, items: [customApiGroup] },
								{ label: 'Intershop APIs', collapsed: true, items: [standardApiGroup] },
							],
						},
						{
							label: 'Architecture Diagrams',
							items: [{ autogenerate: { directory: 'architecture' } }],
						},
						{
							label: 'Low-Level Design',
							items: [{ autogenerate: { directory: 'low-level-design' } }],
						},
						{ label: 'Flow Diagrams', items: [{ autogenerate: { directory: 'flows' } }] },
					],
				},
				{
					label: 'Platform Evaluation',
					items: [{ autogenerate: { directory: 'platform-evaluation' } }],
				},
			],
		}),
		react(),
	],

	vite: {
		plugins: [tailwindcss()],
	},
});
