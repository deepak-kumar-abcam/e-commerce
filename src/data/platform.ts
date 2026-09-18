/**
 * Single source of truth for platform facts used across the documentation.
 *
 * Anything not yet confirmed is `null` rather than guessed — the UI renders
 * those as an explicit "not yet documented" state so gaps stay visible instead
 * of silently reading as complete.
 */

export type SystemCategory = 'order' | 'payment' | 'marketing' | 'identity' | 'commerce';

export interface BackendSystem {
	name: string;
	category: SystemCategory;
}

export interface OpCo {
	id: string;
	name: string;
	/** Short label for tight spaces like table headers and diagram nodes. */
	short: string;
	/** Order management / ERP system that orders are handed off to. */
	orderBackend: BackendSystem | null;
	paymentProvider: BackendSystem | null;
	marketingPlatform: BackendSystem | null;
	/** Regions live today. `null` until launch details are documented. */
	regions: string[] | null;
}

export const opcos: OpCo[] = [
	{
		id: 'danaher-life-sciences',
		name: 'Danaher Life Sciences',
		short: 'DHLS',
		orderBackend: null,
		paymentProvider: null,
		marketingPlatform: { name: 'Marketing Cloud', category: 'marketing' },
		regions: null,
	},
	{
		id: 'sciex',
		name: 'SCIEX',
		short: 'SCIEX',
		orderBackend: { name: 'Oracle', category: 'order' },
		paymentProvider: { name: 'Cybersource', category: 'payment' },
		marketingPlatform: { name: 'Oracle Eloqua', category: 'marketing' },
		regions: null,
	},
	{
		id: 'phenomenex',
		name: 'Phenomenex',
		short: 'PHX',
		orderBackend: { name: 'Microsoft Dynamics 365', category: 'order' },
		paymentProvider: { name: 'Stripe', category: 'payment' },
		marketingPlatform: { name: 'Oracle Eloqua', category: 'marketing' },
		regions: null,
	},
	{
		id: 'leica-microsystems',
		name: 'Leica Microsystems',
		short: 'LMS',
		orderBackend: { name: 'SAP', category: 'order' },
		paymentProvider: { name: 'Stripe', category: 'payment' },
		marketingPlatform: { name: 'Salesforce Pardot', category: 'marketing' },
		regions: null,
	},
];

/** Services every operating company shares on the single central instance. */
export const sharedServices = [
	{
		name: 'Intershop',
		role: 'Commerce platform',
		detail: 'One centrally managed instance serving every operating company.',
		category: 'commerce' as SystemCategory,
	},
	{
		name: 'Auth0',
		role: 'CIAM & single sign-on',
		detail: 'Central customer identity, shared across all operating companies.',
		category: 'identity' as SystemCategory,
	},
];

export interface DocSection {
	title: string;
	href: string;
	description: string;
	/** Shown on the card so readers know whether content exists yet. */
	status: 'in-progress' | 'planned';
}

export const docSections: DocSection[] = [
	{
		title: 'Feature Lists',
		href: '/features/',
		description:
			'Out-of-the-box Intershop capabilities available to every operating company, and which ones each has switched on.',
		status: 'planned',
	},
	{
		title: 'Custom Features',
		href: '/custom-features/',
		description:
			'Functionality built by the platform team beyond standard Intershop, and the operating companies each one serves.',
		status: 'planned',
	},
	{
		title: 'Intershop API',
		href: '/api/',
		description:
			'REST API reference generated from the Intershop OpenAPI specifications, covering the endpoints integrations depend on.',
		status: 'planned',
	},
	{
		title: 'Architecture Diagrams',
		href: '/architecture/',
		description:
			'How the platform is structured and where it sits relative to the ERP, payment, identity, and marketing systems around it.',
		status: 'planned',
	},
	{
		title: 'Low-Level Design',
		href: '/low-level-design/',
		description:
			'Detailed design documents for each integration — contracts, field mappings, error handling, and retry behaviour.',
		status: 'planned',
	},
	{
		title: 'Flow Diagrams',
		href: '/flows/',
		description:
			'Step-by-step journeys such as order capture, payment authorisation, and customer registration, annotated per system.',
		status: 'planned',
	},
];

