// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'Commerce Platform Docs',
			description:
				'Documentation for the centrally managed Intershop e-commerce platform serving Danaher Life Sciences, SCIEX, Phenomenex, and Leica Microsystems.',
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
						{ label: 'Intershop API', items: [{ autogenerate: { directory: 'api' } }] },
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
			],
		}),
		react(),
	],

	vite: {
		plugins: [tailwindcss()],
	},
});
