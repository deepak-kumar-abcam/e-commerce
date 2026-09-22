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

export type IntershopInstance = 'central' | 'own';

export interface IdentityStatus {
	system: string;
	status: 'live' | 'planned';
	/** Extra context, e.g. which tenant a planned rollout joins. */
	note?: string;
}

export interface OpCo {
	id: string;
	name: string;
	/** Short label for tight spaces like table headers and diagram nodes. */
	short: string;
	/**
	 * `central` = the shared instance run by the platform team, which the
	 * detailed documentation covers. `own` = a separate instance, managed by
	 * the OpCo's own team and only summarised here.
	 */
	instance: IntershopInstance;
	intershopVersion: string | null;
	managedBy: string;
	identity: IdentityStatus | null;
	/** Order management / ERP system that orders are handed off to. */
	orderBackend: BackendSystem | null;
	paymentProvider: BackendSystem | null;
	marketingPlatform: BackendSystem | null;
	/** Regions live today. `null` until launch details are documented. */
	regions: string[] | null;
}

const PLATFORM_TEAM = 'Platform team';
const OPCO_TEAM = 'OpCo team';
const CENTRAL_VERSION = 'ICM 14.5';
const auth0Live: IdentityStatus = { system: 'Auth0', status: 'live' };

/** Every OpCo selling on Intershop, across all instances. */
export const opcos: OpCo[] = [
	{
		id: 'danaher-life-sciences',
		name: 'Danaher Life Sciences',
		short: 'DHLS',
		instance: 'central',
		intershopVersion: CENTRAL_VERSION,
		managedBy: PLATFORM_TEAM,
		identity: auth0Live,
		orderBackend: null,
		paymentProvider: null,
		marketingPlatform: { name: 'Marketing Cloud', category: 'marketing' },
		regions: null,
	},
	{
		id: 'sciex',
		name: 'SCIEX',
		short: 'SCIEX',
		instance: 'central',
		intershopVersion: CENTRAL_VERSION,
		managedBy: PLATFORM_TEAM,
		identity: auth0Live,
		orderBackend: { name: 'Oracle', category: 'order' },
		paymentProvider: { name: 'Cybersource', category: 'payment' },
		marketingPlatform: { name: 'Oracle Eloqua', category: 'marketing' },
		regions: null,
	},
	{
		id: 'phenomenex',
		name: 'Phenomenex',
		short: 'PHX',
		instance: 'central',
		intershopVersion: CENTRAL_VERSION,
		managedBy: PLATFORM_TEAM,
		identity: auth0Live,
		orderBackend: { name: 'Microsoft Dynamics 365', category: 'order' },
		paymentProvider: { name: 'Stripe', category: 'payment' },
		marketingPlatform: { name: 'Oracle Eloqua', category: 'marketing' },
		regions: null,
	},
	{
		id: 'leica-microsystems',
		name: 'Leica Microsystems',
		short: 'LMS',
		instance: 'central',
		intershopVersion: CENTRAL_VERSION,
		managedBy: PLATFORM_TEAM,
		identity: auth0Live,
		orderBackend: { name: 'SAP', category: 'order' },
		paymentProvider: { name: 'Stripe', category: 'payment' },
		marketingPlatform: { name: 'Salesforce Pardot', category: 'marketing' },
		regions: null,
	},
	{
		id: 'pall',
		name: 'Pall',
		short: 'Pall',
		instance: 'own',
		intershopVersion: 'ICM 14',
		managedBy: OPCO_TEAM,
		identity: null,
		orderBackend: null,
		paymentProvider: null,
		marketingPlatform: null,
		regions: null,
	},
	{
		id: 'beckman-coulter-life-sciences',
		name: 'Beckman Coulter Life Sciences',
		short: 'BCLS',
		instance: 'own',
		intershopVersion: 'ICM 14',
		managedBy: OPCO_TEAM,
		identity: {
			system: 'Auth0',
			status: 'planned',
			note: 'Joining the same Auth0 tenant as the central-instance OpCos.',
		},
		orderBackend: null,
		paymentProvider: null,
		marketingPlatform: null,
		regions: null,
	},
	{
		id: 'leica-biosystems',
		name: 'Leica Biosystems',
		short: 'LBS',
		instance: 'own',
		intershopVersion: 'ICM 10',
		managedBy: OPCO_TEAM,
		identity: null,
		orderBackend: null,
		paymentProvider: null,
		marketingPlatform: null,
		regions: null,
	},
];

/** The OpCos on the central instance — the scope of the detailed documentation. */
export const centralOpcos = opcos.filter((o) => o.instance === 'central');

/** OpCos on their own instances, managed by their own teams. */
export const separateOpcos = opcos.filter((o) => o.instance === 'own');

/** Distinct Intershop instances: the central one plus one per separate OpCo. */
export const instanceCount = 1 + separateOpcos.length;

/** Services shared by every OpCo on the central instance. */
export const sharedServices = [
	{
		name: 'Intershop',
		role: 'Commerce platform',
		detail: 'One centrally managed instance serving the central-instance OpCos.',
		category: 'commerce' as SystemCategory,
	},
	{
		name: 'Auth0',
		role: 'CIAM & single sign-on',
		detail: 'Central customer identity tenant, shared by the central-instance OpCos.',
		category: 'identity' as SystemCategory,
	},
];

export interface DocSection {
	title: string;
	href: string;
	description: string;
	/** Shown on the card so readers know whether content exists yet. */
	status: 'in-progress' | 'planned';
	/** Rendered full-width above the other cards. */
	featured?: boolean;
}

export const docSections: DocSection[] = [
	{
		title: 'Platform Evaluation',
		href: '/platform-evaluation/',
		description:
			'Intershop compared with commercetools for the central instance — architecture, B2B, integrations, operating model, and AI, with migration paths and a proposed proof of concept.',
		status: 'in-progress',
		featured: true,
	},
	{
		title: 'Feature Lists',
		href: '/features/',
		description:
			'Out-of-the-box Intershop capabilities available to every OpCo on the central instance, and which ones each has switched on.',
		status: 'in-progress',
	},
	{
		title: 'Custom Features',
		href: '/custom-features/',
		description:
			'Functionality built by the platform team beyond standard Intershop, and the operating companies each one serves.',
		status: 'in-progress',
	},
	{
		title: 'Intershop API',
		href: '/api/',
		description:
			'REST API reference generated from the Intershop OpenAPI specifications, covering the endpoints integrations depend on.',
		status: 'in-progress',
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

