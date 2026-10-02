/**
 * Single source of truth for platform facts used across the documentation.
 *
 * Anything not yet confirmed is `null` rather than guessed — the UI renders
 * those as an explicit "not yet documented" state so gaps stay visible instead
 * of silently reading as complete.
 */

export type SystemCategory =
	| 'order'
	| 'crm'
	| 'payment'
	| 'marketing'
	| 'identity'
	| 'commerce'
	| 'content'
	| 'pim'
	| 'search'
	| 'integration';

export interface BackendSystem {
	name: string;
	category: SystemCategory;
	/** A confirmed plan to replace it, e.g. "Salesforce". No date unless documented. */
	migratingTo?: string;
	/** Where that plan stands, e.g. a tentative date. Shown with the migration badge. */
	migrationNote?: string;
}

/**
 * A system an OpCo knowingly doesn't have, as opposed to one nobody has
 * documented yet (`null`). Renders as "None", with the reason.
 */
export interface NotApplicable {
	notApplicable: true;
	reason: string;
}

/** An OpCo's system of a given kind: known, knowingly absent, or not documented. */
export type SystemSlot = BackendSystem | NotApplicable | null;

export const isNotApplicable = (slot: SystemSlot): slot is NotApplicable =>
	slot !== null && 'notApplicable' in slot;

/** The system, or `null` when it is absent or not documented. */
export const systemOf = (slot: SystemSlot): BackendSystem | null =>
	slot && !isNotApplicable(slot) ? slot : null;

const none = (reason: string): NotApplicable => ({ notApplicable: true, reason });

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
	orderBackend: SystemSlot;
	/** CRM that customer and segment data originate in. */
	crm: SystemSlot;
	paymentProvider: SystemSlot;
	marketingPlatform: SystemSlot;
	/** Regions live today. `null` until launch details are documented. */
	regions: string[] | null;
}

const PLATFORM_TEAM = 'Platform team';
const OPCO_TEAM = 'OpCo team';
const CENTRAL_VERSION = 'ICM 14.5';
const auth0Live: IdentityStatus = { system: 'Auth0', status: 'live' };
const salesforce: BackendSystem = { name: 'Salesforce', category: 'crm' };

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
		orderBackend: none('No legal entity yet'),
		crm: salesforce,
		paymentProvider: none('No direct transactions'),
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
		crm: salesforce,
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
		crm: {
			name: 'Microsoft Dynamics CRM',
			category: 'crm',
			migratingTo: 'Salesforce',
			migrationNote: 'in planning, expected around Q3 2027',
		},
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
		crm: salesforce,
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
		crm: null,
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
		crm: null,
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
		crm: null,
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

export interface SharedService {
	id: string;
	name: string;
	role: string;
	detail: string;
	category: SystemCategory;
	/** Where it stands in a migration, shown as a badge. */
	status?: string;
}

/**
 * Services shared by every OpCo on the central instance, all run by the
 * platform team. How data moves between them is in `integrations.ts`.
 */
export const sharedServices: SharedService[] = [
	{
		id: 'intershop',
		name: 'Intershop',
		role: 'Commerce platform',
		detail: 'One centrally managed instance serving the central-instance OpCos.',
		category: 'commerce',
	},
	{
		id: 'auth0',
		name: 'Auth0',
		role: 'CIAM & single sign-on',
		detail:
			'Central customer identity tenant, shared by the central-instance OpCos. One set of Universal Login pages for sign-in and registration, branded per OpCo; custom forms collect OpCo-specific answers into each user’s app metadata.',
		category: 'identity',
	},
	{
		id: 'aem',
		name: 'AEM (traditional)',
		role: 'Storefront & content',
		detail:
			'Traditional Adobe Experience Manager. Serves the checkout pages, whose components call Intershop\'s REST APIs directly.',
		category: 'content',
		status: 'Migrating to EDS',
	},
	{
		id: 'aem-eds',
		name: 'AEM Edge Delivery Services',
		role: 'Storefront & content',
		detail:
			'Serves every page except checkout, and calls Intershop\'s REST APIs and Auth0 directly. Checkout is planned to move here too.',
		category: 'content',
		status: 'Target for all pages',
	},
	{
		id: 'inriver',
		name: 'inRiver',
		role: 'Product information (PIM)',
		detail:
			'Single source of truth for product data: enriches what the ERPs send and feeds Intershop and Coveo, but not AEM. Also holds some list prices today, which are being moved out.',
		category: 'pim',
	},
	{
		id: 'coveo',
		name: 'Coveo',
		role: 'Search & recommendations',
		detail:
			'Loaded into AEM pages with the Coveo Headless and Atomic libraries, and their only source of product content. Indexes product data, fed directly from inRiver, and AEM content, which AEM pushes on a scheduled sync.',
		category: 'search',
	},
	{
		id: 'boomi',
		name: 'Boomi',
		role: 'Integration platform',
		detail:
			'Picks up files from the Danaher Life Sciences SFTP server — dropped by the ERPs and WebDB — and delivers them to inRiver and Intershop.',
		category: 'integration',
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
			'The systems around the central instance — AEM and Edge Delivery Services, Coveo, Auth0, inRiver, Boomi — and each OpCo\'s ERP, CRM, payment, and marketing platforms.',
		status: 'in-progress',
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
			'How product, customer, pricing, quote, and segment data reach Intershop, how orders and payments leave it, and how customers sign in, hop by hop.',
		status: 'in-progress',
	},
];

