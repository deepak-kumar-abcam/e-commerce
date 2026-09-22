/**
 * Customizations the platform team has built on the central instance, beyond
 * standard Intershop. Each is built once and switched on per OpCo, so any
 * OpCo can adopt one another OpCo asked for.
 *
 * Per-OpCo status follows the platform.ts rule: an OpCo missing from `status`
 * is "not documented", never assumed on or off.
 */

export type CustomFeatureStatus = 'enabled' | 'available';

export const statusInfo: Record<CustomFeatureStatus | 'unknown', { label: string; description: string }> = {
	enabled: { label: 'Enabled', description: 'Switched on and in use by this OpCo.' },
	available: { label: 'Available', description: 'Built and deployed, but not switched on for this OpCo.' },
	unknown: { label: 'Not documented', description: 'Whether this OpCo uses it has not been confirmed.' },
};

export interface CustomFeatureArea {
	id: string;
	title: string;
}

export const customFeatureAreas: CustomFeatureArea[] = [
	{ id: 'quotes', title: 'Quotes' },
	{ id: 'identity', title: 'Registration and sign-in' },
	{ id: 'catalog', title: 'Catalog, pricing, and promotions' },
	{ id: 'basket', title: 'Basket' },
];

export interface CustomFeature {
	id: string;
	title: string;
	area: string;
	/** lucide-react icon name, resolved in the component. */
	icon: string;
	summary: string;
	/** What standard Intershop does, and why that wasn't enough. */
	standard: string;
	/** What the customization changes. */
	custom: string;
	details?: string[];
	/** REST APIs affected, named as the team refers to them. */
	apis: string[];
	/** Keyed by OpCo id from platform.ts. Missing = not documented. */
	status: Partial<Record<string, CustomFeatureStatus>>;
	/** How the feature behaves differently for a specific OpCo. */
	opcoNotes?: { opco: string; note: string }[];
	/** Gaps to close before this entry is complete. */
	openQuestions?: string[];
}

export const customFeatures: CustomFeature[] = [
	{
		id: 'anonymous-erfq',
		title: 'Anonymous quote requests (eRFQ)',
		area: 'quotes',
		icon: 'MessageSquareQuote',
		summary: 'Guests can build a quote cart and submit a quote request without signing in.',
		standard: 'Quote requests are tied to a registered, signed-in customer.',
		custom:
			'The eRFQ API is extended so anonymous users can add items to a quote cart and submit the quote.',
		apis: ['eRFQ API'],
		status: {},
		openQuestions: [
			'Which OpCos have it enabled.',
			'What contact details a guest must supply, and where the submitted quote goes.',
		],
	},
	{
		id: 'crm-quote-add-to-cart',
		title: 'Add to cart by CRM quote number',
		area: 'quotes',
		icon: 'FileCheck',
		summary: 'An approved quote is added to the cart using the quote number the customer knows.',
		standard:
			'Adding a quote to the cart needs the quote UUID, which only Intershop knows — not the customer or the CRM.',
		custom:
			'The cart accepts the approved quote number from the CRM (CRM Quote No) and resolves it to the Intershop quote.',
		apis: ['Basket API'],
		status: {},
		openQuestions: ['Which OpCos have it enabled, and which CRM issues the quote number for each.'],
	},
	{
		id: 'custom-token-handler',
		title: 'Custom token handler',
		area: 'identity',
		icon: 'KeyRound',
		summary: 'Creates the user and customer in the same flow that issues the token.',
		standard: 'Getting a token and creating the user and customer are separate steps.',
		custom:
			'The token handler creates the user and customer as part of the token flow, so a newly registered buyer is set up in one step.',
		details: [
			'Customer data comes from the details the user entered at registration.',
			'OpCo-specific IDs come from an API call to that OpCo’s own system and are stored in Intershop.',
		],
		apis: ['Token handler'],
		status: { phenomenex: 'enabled' },
		opcoNotes: [
			{
				opco: 'phenomenex',
				note: 'Gets the web user ID from the web API and stores it in Intershop.',
			},
		],
		openQuestions: [
			'Which OpCo-specific IDs the other OpCos fetch, and from which systems.',
			'Where each ID is stored in Intershop (user or customer attribute).',
		],
	},
	{
		id: 'multiple-promotions',
		title: 'Multiple promotions in one call',
		area: 'catalog',
		icon: 'BadgePercent',
		summary: 'Returns the details of several promotions in a single response.',
		standard: 'One API returns the list of promotions and another returns each promotion’s details.',
		custom: 'A single call returns the details for multiple promotions.',
		apis: ['Promotions API'],
		status: {
			phenomenex: 'enabled',
			'danaher-life-sciences': 'available',
			sciex: 'available',
			'leica-microsystems': 'available',
		},
	},
	{
		id: 'product-list',
		title: 'Bulk product data (productlist)',
		area: 'catalog',
		icon: 'LayoutList',
		summary: 'Returns data for many products in one call, including their promotions.',
		standard: 'Product data is fetched with one API call per product.',
		custom:
			'The productlist API returns data for multiple products in one call, with the promotions available for each product.',
		apis: ['productlist API'],
		status: {},
		openQuestions: ['Which OpCos have it enabled.'],
	},
	{
		id: 'product-prices',
		title: 'Bulk product prices (productprices)',
		area: 'catalog',
		icon: 'Tag',
		summary: 'Returns prices for many products in one call.',
		standard: 'Prices are fetched product by product.',
		custom: 'The productprices API returns prices for multiple products at the same time.',
		apis: ['productprices API'],
		status: {},
		openQuestions: [
			'Which OpCos have it enabled.',
			'Recent ICM versions ship a productprices endpoint that accepts several SKUs — confirm what our version adds on top of it.',
		],
	},
	{
		id: 'basket-cross-sells',
		title: 'Cross-sells in the basket API',
		area: 'basket',
		icon: 'Link',
		summary: 'The basket response includes cross-sell products mapped to its items.',
		standard: 'The basket response carries no cross-sell data; it has to be fetched separately.',
		custom:
			'The basket API returns the cross-sell products mapped to the items in the basket, so the storefront can promote them.',
		details: ['Cross-sells come from a static list mapped to each product, not recommendations.'],
		apis: ['Basket API'],
		status: {
			phenomenex: 'enabled',
			'danaher-life-sciences': 'available',
			sciex: 'available',
			'leica-microsystems': 'available',
		},
	},
];

export const featuresInArea = (areaId: string) => customFeatures.filter((f) => f.area === areaId);
