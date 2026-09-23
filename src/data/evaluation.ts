/**
 * Facts behind the Platform Evaluation section: Intershop compared with
 * commercetools.
 *
 * Every claim carries an evidence tag and source ids, so a reader can tell a
 * documented capability from a press release. Rules, matching `platform.ts`:
 *
 * - Never upgrade evidence. A press release stays `vendor-claim` even when it
 *   sounds definitive; only hands-on testing by our team earns `verified`
 *   (or facts about our own production system).
 * - Unknowns stay unknown. Use the `unknown` rating and `unconfirmed`
 *   evidence rather than inferring a capability from marketing.
 * - Update `evaluationMeta.asOf` whenever facts here change. Vendor AI
 *   offerings changed monthly through 2026, so undated claims go stale quietly.
 */

export const evaluationMeta = {
	asOf: '2026-09-23',
	owner: 'Platform team',
	nextReview: '2026-12-18',
	/** What the comparison covers: the central instance only, not the wider estate. */
	scope: 'Central instance, 4 OpCos',
	/** The Intershop version the comparison is written against. */
	intershopVersion: 'ICM 14.5',
};

// ---------------------------------------------------------------------------
// Scales
// ---------------------------------------------------------------------------

/**
 * How a capability is delivered. The five core values were agreed for the
 * evaluation; `in-production` and `unknown` exist so current-state facts and
 * gaps in our knowledge are never forced onto the delivery scale.
 */
export type Rating =
	| 'native'
	| 'configurable'
	| 'partner'
	| 'custom'
	| 'gap'
	| 'in-production'
	| 'unknown';

export const ratingInfo: Record<Rating, { label: string; description: string }> = {
	native: { label: 'Native', description: 'Built into the platform and documented.' },
	configurable: {
		label: 'Configurable',
		description: 'Achievable with platform features and configuration, without custom code.',
	},
	partner: {
		label: 'Partner',
		description: 'Available through a partner or marketplace product, not the vendor itself.',
	},
	custom: { label: 'Custom build', description: 'Would need to be built by us.' },
	gap: { label: 'Gap', description: 'Not available, and no documented way to provide it.' },
	'in-production': {
		label: 'In production',
		description: 'Running on our platform today.',
	},
	unknown: {
		label: 'Not confirmed',
		description: 'Could not be confirmed from public sources.',
	},
};

export type Evidence = 'documented' | 'vendor-claim' | 'verified' | 'unconfirmed';

export const evidenceInfo: Record<Evidence, { label: string; description: string }> = {
	documented: {
		label: 'Documented',
		description: 'Official product documentation, release notes, or source code.',
	},
	'vendor-claim': {
		label: 'Vendor claim',
		description: 'Press release, marketing, blog, or customer story — a claim, not proof.',
	},
	verified: {
		label: 'Verified',
		description: 'Tested by our team, or a fact about our own production platform.',
	},
	unconfirmed: {
		label: 'Unconfirmed',
		description: 'No reliable source found; treat as an open question.',
	},
};

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------

export interface Source {
	title: string;
	url: string;
	/** Publication or last-modified date; `null` when the page carries none. */
	date: string | null;
	/** When the page was read, for undated reference pages. */
	accessed?: string;
	evidence: Evidence;
	vendor: 'Intershop' | 'commercetools' | 'Third party';
}

const read = '2026-09-18';

export const sources = {
	// commercetools — documentation
	ctGeneral: {
		title: 'API general concepts (regions, versioning, concurrency)',
		url: 'https://docs.commercetools.com/api/general-concepts',
		date: null,
		accessed: read,
		evidence: 'documented',
		vendor: 'commercetools',
	},
	ctProducts: {
		title: 'Product documentation index',
		url: 'https://docs.commercetools.com/docs/composable-commerce',
		date: null,
		accessed: read,
		evidence: 'documented',
		vendor: 'commercetools',
	},
	ctStores: {
		title: 'Stores',
		url: 'https://docs.commercetools.com/api/projects/stores',
		date: null,
		accessed: read,
		evidence: 'documented',
		vendor: 'commercetools',
	},
	ctMultiBrand: {
		title: 'Manage multiple experiences from one Project',
		url: 'https://docs.commercetools.com/learning-model-your-business-structure/stores-and-channels/manage-multiple-experiences-from-one-project',
		date: null,
		accessed: read,
		evidence: 'documented',
		vendor: 'commercetools',
	},
	ctLimits: {
		title: 'API limits',
		url: 'https://docs.commercetools.com/api/limits',
		date: null,
		accessed: read,
		evidence: 'documented',
		vendor: 'commercetools',
	},
	ctVariantModel: {
		title: 'New product variant model in early access',
		url: 'https://docs.commercetools.com/api/releases/2026-03-26-introduced-a-new-product-variant-model-in-early-access',
		date: '2026-03-26',
		evidence: 'documented',
		vendor: 'commercetools',
	},
	ctExtensions: {
		title: 'API Extensions',
		url: 'https://docs.commercetools.com/api/projects/api-extensions',
		date: null,
		accessed: read,
		evidence: 'documented',
		vendor: 'commercetools',
	},
	ctSubscriptions: {
		title: 'Subscriptions',
		url: 'https://docs.commercetools.com/api/projects/subscriptions',
		date: null,
		accessed: read,
		evidence: 'documented',
		vendor: 'commercetools',
	},
	ctBusinessUnits: {
		title: 'Business Units',
		url: 'https://docs.commercetools.com/api/projects/business-units',
		date: null,
		accessed: read,
		evidence: 'documented',
		vendor: 'commercetools',
	},
	ctApprovalRules: {
		title: 'Approval Rules',
		url: 'https://docs.commercetools.com/api/projects/approval-rules',
		date: null,
		accessed: read,
		evidence: 'documented',
		vendor: 'commercetools',
	},
	ctQuotes: {
		title: 'Quotes overview',
		url: 'https://docs.commercetools.com/api/quotes-overview',
		date: null,
		accessed: read,
		evidence: 'documented',
		vendor: 'commercetools',
	},
	ctRecurring: {
		title: 'Recurring Orders are now generally available',
		url: 'https://docs.commercetools.com/api/releases/2025-09-29-recurring-orders-are-now-generally-available',
		date: '2025-09-29',
		evidence: 'documented',
		vendor: 'commercetools',
	},
	ctB2bOffering: {
		title: 'Core Commerce B2B offering',
		url: 'https://docs.commercetools.com/offering/core-commerce-b2b',
		date: null,
		accessed: read,
		evidence: 'documented',
		vendor: 'commercetools',
	},
	ctAuth: {
		title: 'Authorization (External OAuth)',
		url: 'https://docs.commercetools.com/api/authorization',
		date: null,
		accessed: read,
		evidence: 'documented',
		vendor: 'commercetools',
	},
	ctMcpDocs: {
		title: 'Commerce MCP',
		url: 'https://docs.commercetools.com/dev-tooling/mcp/commerce-mcp',
		date: null,
		accessed: read,
		evidence: 'documented',
		vendor: 'commercetools',
	},
	ctMcpOverview: {
		title: 'MCP servers overview (incl. Knowledge MCP)',
		url: 'https://docs.commercetools.com/dev-tooling/mcp/overview',
		date: null,
		accessed: read,
		evidence: 'documented',
		vendor: 'commercetools',
	},
	ctMcpRelease: {
		title: 'Introducing Commerce MCP',
		url: 'https://docs.commercetools.com/api/releases/2025-06-30-introducing-commerce-mcp',
		date: '2025-06-30',
		evidence: 'documented',
		vendor: 'commercetools',
	},
	ctManagedMcpGa: {
		title: 'Managed MCP Servers become generally available',
		url: 'https://docs.commercetools.com/api/releases/2026-07-16-managed-mcp-servers-become-generally-available',
		date: '2026-07-16',
		evidence: 'documented',
		vendor: 'commercetools',
	},
	ctMcpRepo: {
		title: 'commerce-mcp repository (MIT)',
		url: 'https://github.com/commercetools/commerce-mcp',
		date: '2026-09-14',
		evidence: 'documented',
		vendor: 'commercetools',
	},

	// commercetools — announcements and marketing
	ctRecapQ1: {
		title: "Product recap: what's new at commercetools (Q1 2026)",
		url: 'https://commercetools.com/blog/product-recap-whats-new-at-commercetools',
		date: '2026-04-29',
		evidence: 'vendor-claim',
		vendor: 'commercetools',
	},
	ctSphere: {
		title: 'Sphere platform and "Autonomous Commerce" launch',
		url: 'https://www.prnewswire.com/news-releases/commercetools-introduces-autonomous-commerce-category-and-unveils-sphere-platform-for-the-ai-era-of-shopping-302794220.html',
		date: '2026-06-09',
		evidence: 'vendor-claim',
		vendor: 'commercetools',
	},
	ctModular: {
		title: 'Modular Commerce offerings',
		url: 'https://www.prnewswire.com/news-releases/commercetools-launches-modular-commerce-offerings-enabling-enterprises-to-modernize-without-a-full-replatform-302825592.html',
		date: '2026-07-15',
		evidence: 'vendor-claim',
		vendor: 'commercetools',
	},
	ctBuilders: {
		title: 'commercetools for Builders',
		url: 'https://commercetools.com/press-releases/commercetools-reduces-enterprise-commerce-delivery',
		date: '2026-06-23',
		evidence: 'vendor-claim',
		vendor: 'commercetools',
	},
	ctMcpLaunch: {
		title: 'Commerce MCP and AI Hub launch',
		url: 'https://www.prnewswire.com/news-releases/commercetools-launches-commerce-mcp-and-ai-hub-to-make-enterprise-commerce-agent-ready-302461451.html',
		date: '2025-05-21',
		evidence: 'vendor-claim',
		vendor: 'commercetools',
	},
	ctJumpstart: {
		title: 'Agentic Jumpstart (AI Hub + Agent Gateway)',
		url: 'https://commercetools.com/press-releases/commercetools-launches-agentic-jumpstart',
		date: '2025-11-13',
		evidence: 'vendor-claim',
		vendor: 'commercetools',
	},
	ctAgenticLift: {
		title: 'AgenticLift launch',
		url: 'https://commercetools.com/press-releases/commercetools-launches-agenticlift',
		date: '2026-01-21',
		evidence: 'vendor-claim',
		vendor: 'commercetools',
	},
	ctAcp: {
		title: 'Partnership with Stripe to launch ACP',
		url: 'https://commercetools.com/press-releases/commercetools-partners-with-stripe-to-launch-acp',
		date: '2025-09-30',
		evidence: 'vendor-claim',
		vendor: 'commercetools',
	},
	ctUcp: {
		title: 'Google UCP: a merchant guide to agentic commerce',
		url: 'https://commercetools.com/blog/google-ucp-merchant-guide-to-agentic-commerce',
		date: '2026-06-03',
		evidence: 'vendor-claim',
		vendor: 'commercetools',
	},
	ctB2bPricing: {
		title: 'B2B product spotlight: customer-specific commerce',
		url: 'https://commercetools.com/blog/b2b-product-spotlight-customer-specific-commerce',
		date: '2025-06-12',
		evidence: 'vendor-claim',
		vendor: 'commercetools',
	},
	ctShopspray: {
		title: 'Shopspray PunchoutPilot (marketplace listing)',
		url: 'https://marketplace.commercetools.com/integration/shopspray',
		date: null,
		accessed: read,
		evidence: 'vendor-claim',
		vendor: 'commercetools',
	},
	ctCepheid: {
		title: 'Customer story: Cepheid',
		url: 'https://commercetools.com/customer-stories/cepheid',
		date: null,
		accessed: read,
		evidence: 'vendor-claim',
		vendor: 'commercetools',
	},
	ctPlus: {
		title: 'Customer story: PLUS Supermarkets (Intershop → commercetools)',
		url: 'https://commercetools.com/customer-stories/plus-supermarkets',
		date: null,
		accessed: read,
		evidence: 'vendor-claim',
		vendor: 'commercetools',
	},
	ctMigrationStories: {
		title: 'Customers share migration stories and insights',
		url: 'https://commercetools.com/blog/commercetools-customers-share-migration-stories-and-insights',
		date: '2024-05-13',
		evidence: 'vendor-claim',
		vendor: 'commercetools',
	},
	ctMigrationGuide: {
		title: 'Migration and replatforming',
		url: 'https://commercetools.com/migration-replatforming',
		date: null,
		accessed: read,
		evidence: 'vendor-claim',
		vendor: 'commercetools',
	},

	// Intershop
	ishIcm14: {
		title: 'ICM 14 release notes',
		url: 'https://tech.intershop.com/kb/index.php/Display/455Z61',
		date: '2026-09-17',
		evidence: 'documented',
		vendor: 'Intershop',
	},
	ishFeatureLists: {
		title: 'ICM feature lists (11–14.1)',
		url: 'https://knowledge.intershop.com/kb/index.php/Display/E27828',
		date: null,
		accessed: read,
		evidence: 'documented',
		vendor: 'Intershop',
	},
	ishReleaseModel: {
		title: 'Release and support model',
		url: 'https://knowledge.intershop.com/kb/index.php/Display/E31328',
		date: '2025-12-01',
		evidence: 'documented',
		vendor: 'Intershop',
	},
	ishAzure: {
		title: 'Intershop Commerce Platform on Microsoft Azure',
		url: 'https://www.intershop.com/en/solution/microsoft-azure-cloud',
		date: null,
		accessed: read,
		evidence: 'vendor-claim',
		vendor: 'Intershop',
	},
	ishCustomization: {
		title: 'Customization guidelines (cartridge levels 0–4)',
		url: 'https://knowledge.intershop.com/kb/index.php/Display/29230E',
		date: '2025-10-17',
		evidence: 'documented',
		vendor: 'Intershop',
	},
	ishOrganizations: {
		title: 'Organization and channel structure',
		url: 'https://knowledge.intershop.com/kb/index.php/Display/23394B',
		date: null,
		accessed: read,
		evidence: 'documented',
		vendor: 'Intershop',
	},
	ishPunchoutOci: {
		title: 'Punchout (OCI)',
		url: 'https://knowledge.intershop.com/kb/index.php/Display/2934C1',
		date: null,
		accessed: read,
		evidence: 'documented',
		vendor: 'Intershop',
	},
	ishPunchoutCxml: {
		title: 'Punchout (cXML, API v3)',
		url: 'https://knowledge.intershop.com/kb/index.php/Display/2993A6',
		date: null,
		accessed: read,
		evidence: 'documented',
		vendor: 'Intershop',
	},
	ishBudgets: {
		title: 'Budgets, cost centers, and requisition approval',
		url: 'https://knowledge.intershop.com/kb/index.php/Display/481H78',
		date: null,
		accessed: read,
		evidence: 'documented',
		vendor: 'Intershop',
	},
	ishQuoting: {
		title: 'Quoting REST API',
		url: 'https://knowledge.intershop.com/kb/index.php/Display/29602L',
		date: null,
		accessed: read,
		evidence: 'documented',
		vendor: 'Intershop',
	},
	ishCopilotLaunch: {
		title: 'AI Copilot and agent for B2B commerce',
		url: 'https://www.intershop.com/en/press-release/intershop-introduces-ai-copilot-and-agent-for-next-generation-b2b-commerce',
		date: '2025-04-10',
		evidence: 'vendor-claim',
		vendor: 'Intershop',
	},
	ishSpring2026: {
		title: 'Spring 2026 Release (Copilot for Merchants GA)',
		url: 'https://knowledge.intershop.com/kb/index.php/Display/R48243',
		date: '2026-06-15',
		evidence: 'documented',
		vendor: 'Intershop',
	},
	ishCopilotMerchants: {
		title: 'Copilot for Merchants feature list',
		url: 'https://knowledge.intershop.com/kb/index.php/Display/48D197',
		date: '2026-05-11',
		evidence: 'documented',
		vendor: 'Intershop',
	},

	// Third party
	stripeConnector: {
		title: 'Stripe connector for commercetools Connect',
		url: 'https://docs.stripe.com/connectors/commercetools-connect/install-and-configure',
		date: null,
		accessed: read,
		evidence: 'documented',
		vendor: 'Third party',
	},
	adobeCif: {
		title: 'AEM CIF third-party commerce integrations',
		url: 'https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/content-and-commerce/cif-storefront/integrations/third-party',
		date: '2026-06-05',
		evidence: 'documented',
		vendor: 'Third party',
	},
	googleAp2: {
		title: 'Announcing the Agent Payments Protocol (AP2)',
		url: 'https://cloud.google.com/blog/products/ai-machine-learning/announcing-agents-to-payments-ap2-protocol',
		date: '2025-09-16',
		evidence: 'documented',
		vendor: 'Third party',
	},
} satisfies Record<string, Source>;

export type SourceId = keyof typeof sources;

// ---------------------------------------------------------------------------
// Comparison rows
// ---------------------------------------------------------------------------

export interface Assessment {
	/** Omitted for descriptive rows (architecture, operating model). */
	rating?: Rating;
	summary: string;
	evidence: Evidence;
	sources: SourceId[];
}

export interface ComparisonRow {
	id: string;
	capability: string;
	/** Why this row matters to us, in one line. */
	why?: string;
	intershop: Assessment;
	commercetools: Assessment;
	/** Highlighted as a likely deciding factor. */
	critical?: boolean;
}

/** Same facts in each system, so they're factored out. */
const production = (summary: string): Assessment => ({
	rating: 'in-production',
	summary,
	evidence: 'verified',
	sources: [],
});

export const architectureRows: ComparisonRow[] = [
	{
		id: 'model',
		capability: 'Platform model',
		intershop: {
			summary:
				'Java platform (ICM) with a headless REST API; we run ICM 14.5 on a single instance. Deployed on Kubernetes via Helm.',
			evidence: 'documented',
			sources: ['ishIcm14'],
		},
		commercetools: {
			summary:
				'Multi-tenant SaaS APIs (REST and GraphQL). Now sold as separable modules, e.g. Core Commerce and Product Catalog, under the "Sphere" platform brand.',
			evidence: 'vendor-claim',
			sources: ['ctProducts', 'ctSphere', 'ctModular'],
		},
	},
	{
		id: 'hosting',
		capability: 'Hosting',
		intershop: {
			summary:
				'Intershop Commerce Platform: a SaaS/PaaS hybrid on Microsoft Azure (AKS, Azure SQL, Azure DevOps build pipelines).',
			evidence: 'vendor-claim',
			sources: ['ishAzure'],
		},
		commercetools: {
			summary:
				'Vendor-run SaaS in five isolated regions — GCP (Iowa, Belgium, Sydney) and AWS (Ohio, Frankfurt). No data crosses regions.',
			evidence: 'documented',
			sources: ['ctGeneral'],
		},
	},
	{
		id: 'releases',
		capability: 'Release and upgrade model',
		why: 'Drives how often the central team runs upgrade projects.',
		intershop: {
			summary:
				'Semantic versioning with monthly minor releases. Each major gets 6 months of active updates plus 12 months of patches; majors include breaking changes and customers must keep current.',
			evidence: 'documented',
			sources: ['ishReleaseModel'],
		},
		commercetools: {
			summary:
				'Versionless SaaS: changes ship continuously, and deprecations are signalled through an X-DEPRECATION-NOTICE response header rather than versioned API paths.',
			evidence: 'documented',
			sources: ['ctGeneral'],
		},
	},
	{
		id: 'customization',
		capability: 'Customization model',
		why: 'Our shared codebase lives here today.',
		intershop: {
			summary:
				'Java cartridges inside the platform, rated levels 0–4: level 3 needs Intershop sign-off, level 4 is forbidden. Database changes need deployment downtime.',
			evidence: 'documented',
			sources: ['ishCustomization'],
		},
		commercetools: {
			summary:
				'Out-of-process: synchronous API Extensions (2 s default timeout, up to 10 s), async Subscriptions to cloud queues, Custom Types and Custom Objects, and Connect for hosted apps on GCP or AWS.',
			evidence: 'documented',
			sources: ['ctExtensions', 'ctSubscriptions', 'ctRecapQ1'],
		},
	},
	{
		id: 'multi-opco',
		capability: 'Multi-OpCo model',
		why: 'How the four central-instance OpCos share one platform.',
		intershop: {
			summary:
				'Organization tree with sales and partner channels per brand or region. Channels belong to one organization and cannot be shared.',
			evidence: 'documented',
			sources: ['ishOrganizations'],
		},
		commercetools: {
			summary:
				'Documented default is one Project with a Store per brand: Stores fence customers, carts, orders, product selections, and languages; Channels separate prices and inventory. API clients can be scoped to a single Store.',
			evidence: 'documented',
			sources: ['ctStores', 'ctMultiBrand'],
		},
	},
	{
		id: 'events',
		capability: 'Events and async integration',
		intershop: {
			summary: 'Handled inside cartridges today; no platform event bus was assessed.',
			evidence: 'unconfirmed',
			sources: [],
		},
		commercetools: {
			summary:
				'Subscriptions to SQS, SNS, EventBridge, Pub/Sub, Azure Service Bus, Event Grid, or Confluent. At-least-once, unordered delivery; 50 Subscriptions per Project.',
			evidence: 'documented',
			sources: ['ctSubscriptions', 'ctLimits'],
		},
	},
	{
		id: 'limits',
		capability: 'Notable limits',
		intershop: {
			summary: 'Capacity is sized per installation; no published per-tenant quotas were assessed.',
			evidence: 'unconfirmed',
			sources: [],
		},
		commercetools: {
			summary:
				'100 variants per product (10,000 in the early-access modular model), 50,000 standalone prices per variant, 500 results per page, 10,000 max query offset, 25 API Extensions per Project. No general per-second rate limit is published. Most limits can be raised on request.',
			evidence: 'documented',
			sources: ['ctLimits', 'ctVariantModel'],
		},
	},
];

export const b2bRows: ComparisonRow[] = [
	{
		id: 'punchout',
		capability: 'Punchout (OCI / cXML)',
		why: "Lets buyers order from inside their own procurement systems; often the deciding gap.",
		critical: true,
		intershop: {
			rating: 'native',
			summary: 'OCI and cXML built in; dedicated cXML API v3 since ICM 12.2.',
			evidence: 'documented',
			sources: ['ishPunchoutOci', 'ishPunchoutCxml'],
		},
		commercetools: {
			rating: 'partner',
			summary:
				'Not built in. Shopspray PunchoutPilot on the marketplace covers cXML, OCI, OBI, iDoc, and Peppol.',
			evidence: 'vendor-claim',
			sources: ['ctShopspray'],
		},
	},
	{
		id: 'org-hierarchy',
		capability: 'Buyer organizations and hierarchies',
		intershop: {
			rating: 'native',
			summary: 'Customer organization management with users; detailed feature lists require an Intershop login.',
			evidence: 'unconfirmed',
			sources: ['ishFeatureLists'],
		},
		commercetools: {
			rating: 'native',
			summary:
				'Business Units (Company and Division), up to 5 levels and 4,000 divisions; divisions can inherit Stores, associates, and approval rules.',
			evidence: 'documented',
			sources: ['ctBusinessUnits', 'ctLimits'],
		},
	},
	{
		id: 'roles',
		capability: 'Buyer roles and permissions',
		intershop: {
			rating: 'native',
			summary: 'Buyer roles exist alongside budgets and approvals; the detailed permission model was not reviewed.',
			evidence: 'unconfirmed',
			sources: ['ishFeatureLists'],
		},
		commercetools: {
			rating: 'native',
			summary: 'Associate Roles with granular permissions: up to 5 roles per associate, 2,000 associates per Business Unit.',
			evidence: 'documented',
			sources: ['ctBusinessUnits', 'ctLimits'],
		},
	},
	{
		id: 'budgets',
		capability: 'Cost centers and budgets',
		critical: true,
		intershop: {
			rating: 'native',
			summary: 'User and cost-center budgets, net or gross since ICM 12.3.',
			evidence: 'documented',
			sources: ['ishBudgets'],
		},
		commercetools: {
			rating: 'custom',
			summary:
				'No native budget or cost-center objects were found in the documentation. Would be modelled with Custom Types or Objects plus API Extensions.',
			evidence: 'unconfirmed',
			sources: ['ctB2bOffering'],
		},
	},
	{
		id: 'approvals',
		capability: 'Order approval workflows',
		intershop: {
			rating: 'native',
			summary: 'Requisition approval; the Requisition Approval REST API 1.5.0 is marked Beta.',
			evidence: 'documented',
			sources: ['ishBudgets'],
		},
		commercetools: {
			rating: 'native',
			summary: 'Multi-tier Approval Rules by associate role, documented for orders. Whether they apply to quotes was not confirmed.',
			evidence: 'documented',
			sources: ['ctApprovalRules'],
		},
	},
	{
		id: 'requisitions',
		capability: 'Requisitions',
		intershop: {
			rating: 'native',
			summary: 'Requisitions are part of the approval flow.',
			evidence: 'documented',
			sources: ['ishBudgets'],
		},
		commercetools: {
			rating: 'custom',
			summary: 'No requisition object found; pending-approval orders are the nearest equivalent.',
			evidence: 'unconfirmed',
			sources: ['ctApprovalRules'],
		},
	},
	{
		id: 'quotes',
		capability: 'Quotes / RFQ',
		intershop: {
			rating: 'native',
			summary: 'Quoting REST API.',
			evidence: 'documented',
			sources: ['ishQuoting'],
		},
		commercetools: {
			rating: 'native',
			summary: 'Quote Request → Staged Quote → Quote → Order, with renegotiation.',
			evidence: 'documented',
			sources: ['ctQuotes'],
		},
	},
	{
		id: 'contract-pricing',
		capability: 'Contract and customer-specific pricing',
		critical: true,
		intershop: {
			rating: 'unknown',
			summary: 'Not confirmed from public sources; the detailed feature lists require a login.',
			evidence: 'unconfirmed',
			sources: ['ishFeatureLists'],
		},
		commercetools: {
			rating: 'configurable',
			summary:
				'Standalone Prices scoped by customer group, channel, country, currency, and validity date. Business-unit pricing works indirectly, through customer groups, Stores, and Channels.',
			evidence: 'documented',
			sources: ['ctBusinessUnits', 'ctB2bPricing'],
		},
	},
	{
		id: 'order-templates',
		capability: 'Order templates and quick order',
		why: 'The quick-order UI itself lives in AEM on either platform.',
		intershop: {
			rating: 'unknown',
			summary: 'Not confirmed from public sources.',
			evidence: 'unconfirmed',
			sources: ['ishFeatureLists'],
		},
		commercetools: {
			rating: 'configurable',
			summary: 'Shopping Lists can serve as saved order templates.',
			evidence: 'documented',
			sources: ['ctLimits'],
		},
	},
	{
		id: 'recurring',
		capability: 'Recurring orders',
		intershop: {
			rating: 'unknown',
			summary: 'Not confirmed from public sources.',
			evidence: 'unconfirmed',
			sources: [],
		},
		commercetools: {
			rating: 'native',
			summary: 'Generally available since 2025-09-29: day, week, or month intervals, with pause, skip, and cancel.',
			evidence: 'documented',
			sources: ['ctRecurring'],
		},
	},
	{
		id: 'addresses',
		capability: 'Multiple ship-to and bill-to addresses',
		intershop: {
			rating: 'unknown',
			summary: 'Not confirmed from public sources.',
			evidence: 'unconfirmed',
			sources: [],
		},
		commercetools: {
			rating: 'unknown',
			summary: 'Not confirmed in the research.',
			evidence: 'unconfirmed',
			sources: [],
		},
	},
	{
		id: 'po-payment',
		capability: 'Purchase order and invoice payment',
		intershop: {
			rating: 'unknown',
			summary: 'Not confirmed from public sources.',
			evidence: 'unconfirmed',
			sources: [],
		},
		commercetools: {
			rating: 'configurable',
			summary: 'A purchase-order number field on carts went GA in Q1 2026; invoice settlement would sit with the ERP.',
			evidence: 'vendor-claim',
			sources: ['ctRecapQ1'],
		},
	},
	{
		id: 'assortments',
		capability: 'Customer-specific assortments',
		intershop: {
			rating: 'unknown',
			summary: 'Not confirmed from public sources.',
			evidence: 'unconfirmed',
			sources: [],
		},
		commercetools: {
			rating: 'configurable',
			summary: 'Product Selections per Store (up to 100 per Store), combined with Business Unit Store assignment.',
			evidence: 'documented',
			sources: ['ctStores', 'ctBusinessUnits'],
		},
	},
];

export const integrationRows: ComparisonRow[] = [
	{
		id: 'aem',
		capability: 'AEM front end',
		why: 'AEM components call Intershop REST APIs directly today.',
		critical: true,
		intershop: production('AEM components call Intershop REST APIs directly, with no intermediate API layer.'),
		commercetools: {
			rating: 'custom',
			summary:
				'AEM components would call commercetools REST or GraphQL directly, so each component that calls commerce must be rewritten. Adobe CIF needs a partner connector (Diconium) that Adobe describes as not plug-and-play.',
			evidence: 'documented',
			sources: ['adobeCif'],
		},
	},
	{
		id: 'erp',
		capability: 'ERP order integration (D365, SAP, Oracle)',
		why: 'ERP logic lives in Java cartridges in the shared codebase.',
		critical: true,
		intershop: production('Built as Java cartridges in the shared Intershop codebase, one per ERP.'),
		commercetools: {
			rating: 'custom',
			summary:
				'Every ERP integration is a rebuild: Subscriptions or API Extensions to Connect apps or our own services. No marketplace connector for D365 was found; an SAP S/4HANA partner integration appeared in search results only.',
			evidence: 'unconfirmed',
			sources: ['ctSubscriptions', 'ctExtensions'],
		},
	},
	{
		id: 'pim',
		capability: 'Product data (ERP → inRiver feed)',
		why: 'Product data is mastered upstream, not in commerce.',
		intershop: production(
			'Consumes product data, and some list prices, from inRiver, the central PIM, delivered by Boomi.'
		),
		commercetools: {
			rating: 'configurable',
			summary:
				'Import API, with partial-import status since March 2026; CSV import up to 100 MB or 500,000 rows. Re-points the existing feed rather than rebuilding the catalog.',
			evidence: 'vendor-claim',
			sources: ['ctRecapQ1'],
		},
	},
	{
		id: 'boomi',
		capability: 'Boomi (inbound data feeds)',
		why: 'Product, customer, pricing, quote, and segment data all reach commerce through Boomi.',
		intershop: production(
			'Boomi delivers files from the Danaher Life Sciences SFTP server to Intershop: product data via inRiver for every OpCo, and customer, pricing, quote, and segment data for Phenomenex.'
		),
		commercetools: {
			rating: 'unknown',
			summary:
				'Boomi processes would be re-pointed at commercetools APIs. Whether a Boomi connector for commercetools exists was not checked.',
			evidence: 'unconfirmed',
			sources: [],
		},
	},
	{
		id: 'coveo',
		capability: 'Coveo (search and recommendations)',
		intershop: production(
			'Coveo is fed product data from inRiver. Whether it reads anything from Intershop is not documented.'
		),
		commercetools: {
			rating: 'unknown',
			summary:
				'Not assessed. Because Coveo is fed from inRiver, the commerce platform may not sit on its path at all.',
			evidence: 'unconfirmed',
			sources: [],
		},
	},
	{
		id: 'auth0',
		capability: 'Auth0 (CIAM and SSO)',
		critical: true,
		intershop: production('Central Auth0 tenant for every OpCo on the central instance.'),
		commercetools: {
			rating: 'custom',
			summary:
				'Accepts external OAuth tokens through one RFC 7662 introspection endpoint per Project (must answer within 500 ms). We would run a small service mapping Auth0 users to commercetools customer scopes. Business Unit context for external tokens is not documented.',
			evidence: 'documented',
			sources: ['ctAuth'],
		},
	},
	{
		id: 'stripe',
		capability: 'Stripe (Phenomenex, Leica)',
		intershop: production('In production for Phenomenex and Leica Microsystems.'),
		commercetools: {
			rating: 'partner',
			summary: 'Official Stripe connector for Connect and Checkout, maintained by Stripe.',
			evidence: 'documented',
			sources: ['stripeConnector'],
		},
	},
	{
		id: 'cybersource',
		capability: 'Cybersource (SCIEX)',
		intershop: production('In production for SCIEX.'),
		commercetools: {
			rating: 'partner',
			summary: 'Listed on the commercetools marketplace; who maintains the connector was not confirmed.',
			evidence: 'unconfirmed',
			sources: [],
		},
	},
	{
		id: 'maps',
		capability: 'Marketing automation (Eloqua, Pardot, SFMC)',
		intershop: production('Integrated today for the OpCos with a documented MAP.'),
		commercetools: {
			rating: 'custom',
			summary: 'No marketplace connectors for Eloqua, Pardot, or Salesforce Marketing Cloud were found.',
			evidence: 'unconfirmed',
			sources: [],
		},
	},
];

export const operatingRows: ComparisonRow[] = [
	{
		id: 'governance',
		capability: 'Central control of four OpCos',
		intershop: {
			summary:
				'One instance and one codebase: OpCo technical teams contribute changes, and the central team owns code management and deployment.',
			evidence: 'verified',
			sources: [],
		},
		commercetools: {
			summary:
				'One Project owned centrally, with a Store per OpCo. API clients can be scoped to a single Store, so OpCo integrations cannot touch another OpCo’s customers or orders.',
			evidence: 'documented',
			sources: ['ctStores'],
		},
	},
	{
		id: 'code',
		capability: 'Where OpCo-specific code lives',
		intershop: {
			summary:
				'Inside the shared Java codebase; every change ships through the central build and deployment. Database changes need downtime.',
			evidence: 'documented',
			sources: ['ishCustomization'],
		},
		commercetools: {
			summary:
				'Outside the platform, in Connect apps or services that can be deployed independently. Governance shifts from one codebase to many deployables.',
			evidence: 'documented',
			sources: ['ctExtensions', 'ctSubscriptions'],
		},
	},
	{
		id: 'upgrades',
		capability: 'Upgrade burden',
		intershop: {
			summary:
				'Major releases carry breaking changes and 18 months of support in total, so a recurring upgrade project across a shared codebase.',
			evidence: 'documented',
			sources: ['ishReleaseModel'],
		},
		commercetools: {
			summary:
				'No platform upgrades; the team tracks deprecation notices instead. Our own Connect apps and services still need maintenance.',
			evidence: 'documented',
			sources: ['ctGeneral'],
		},
	},
	{
		id: 'skills',
		capability: 'Team skills',
		intershop: {
			summary: 'Java and Intershop cartridge expertise, a comparatively specialised market.',
			evidence: 'unconfirmed',
			sources: [],
		},
		commercetools: {
			summary:
				'API integration with Java or TypeScript SDKs and cloud functions; skills overlap with general cloud development.',
			evidence: 'unconfirmed',
			sources: [],
		},
	},
];

// ---------------------------------------------------------------------------
// AI and agentic commerce
// ---------------------------------------------------------------------------

export interface AiUseCase extends ComparisonRow {
	/** 1 is most relevant to us. */
	rank: number;
	/** Plain-language description for business readers. */
	description: string;
}

export const aiUseCases: AiUseCase[] = [
	{
		id: 'buyer-agents',
		rank: 1,
		capability: 'Buyer agents that place orders',
		description:
			"A customer's procurement agent searches, builds carts, and reorders on its own — over MCP rather than a web page.",
		critical: true,
		intershop: {
			rating: 'gap',
			summary:
				'No MCP server open to external agents was found. Copilot for Buyers is an assistant inside the storefront, not access for outside agents.',
			evidence: 'unconfirmed',
			sources: ['ishCopilotLaunch', 'ishSpring2026'],
		},
		commercetools: {
			rating: 'native',
			summary:
				'Commerce MCP exposes products, carts, orders, quotes, and business units, and can be pinned to one customer and one Business Unit. Managed MCP servers are GA since 2026-07-16; the code is MIT-licensed. No end-to-end B2B agent buying flow is documented.',
			evidence: 'documented',
			sources: ['ctMcpDocs', 'ctManagedMcpGa', 'ctMcpRepo'],
		},
	},
	{
		id: 'build-speed',
		rank: 2,
		capability: 'Build speed with AI',
		description:
			'AI-assisted development of new features — the "slow feature velocity" problem that started this evaluation.',
		critical: true,
		intershop: {
			rating: 'unknown',
			summary:
				'No AI developer tooling was found. Changes go through Java cartridges with a restricted customization model and downtime for database changes.',
			evidence: 'unconfirmed',
			sources: ['ishCustomization'],
		},
		commercetools: {
			rating: 'native',
			summary:
				'A free Knowledge MCP serves the documentation to AI coding tools. "commercetools for Builders" (Claude Code, Cursor, v0 tooling) is announced as available.',
			evidence: 'vendor-claim',
			sources: ['ctMcpOverview', 'ctBuilders'],
		},
	},
	{
		id: 'merchant-copilots',
		rank: 3,
		capability: 'Merchant copilots',
		description: 'Our internal teams manage catalog, pricing, and promotions in natural language.',
		intershop: {
			rating: 'native',
			summary:
				'Copilot for Merchants, GA in the Spring 2026 Release, drives ICM through an internal MCP server: customers, pricing, promotions, inventory, and jobs. Credit-based monthly pricing.',
			evidence: 'documented',
			sources: ['ishSpring2026', 'ishCopilotMerchants'],
		},
		commercetools: {
			rating: 'configurable',
			summary:
				'No packaged merchant copilot found. Commerce MCP in read-write mode, with sign-in limited to the user’s Merchant Center permissions, can power one.',
			evidence: 'documented',
			sources: ['ctMcpDocs', 'ctManagedMcpGa'],
		},
	},
	{
		id: 'ai-discovery',
		rank: 4,
		capability: 'Being found by public AI assistants',
		description: 'ChatGPT, Gemini, and Copilot can find and cite our products, and in some cases check out.',
		intershop: {
			rating: 'native',
			summary: 'ICM 14 publishes ACP-format product feeds. Feeds only — no agent checkout.',
			evidence: 'documented',
			sources: ['ishIcm14', 'ishSpring2026'],
		},
		commercetools: {
			rating: 'native',
			summary:
				'AI Hub and AgenticLift feed ChatGPT, Copilot, Perplexity, and Gemini, with UCP checkout in Gemini "for select US merchants". None of this material mentions B2B.',
			evidence: 'vendor-claim',
			sources: ['ctJumpstart', 'ctAgenticLift', 'ctUcp', 'ctRecapQ1'],
		},
	},
];

export interface ProtocolRow {
	protocol: string;
	what: string;
	intershop: Assessment;
	commercetools: Assessment;
}

export const protocolRows: ProtocolRow[] = [
	{
		protocol: 'MCP',
		what: 'Model Context Protocol — how AI agents call tools and data.',
		intershop: {
			summary: 'Internal only, powering Copilot for Merchants.',
			evidence: 'documented',
			sources: ['ishSpring2026'],
		},
		commercetools: {
			summary: 'Commerce MCP for external agents, self-hosted or managed (GA); Knowledge MCP for developers.',
			evidence: 'documented',
			sources: ['ctMcpDocs', 'ctManagedMcpGa', 'ctMcpOverview'],
		},
	},
	{
		protocol: 'ACP',
		what: 'Agentic Commerce Protocol (OpenAI and Stripe) — product feeds and agent checkout.',
		intershop: {
			summary: 'Product feeds in ACP format. No checkout.',
			evidence: 'documented',
			sources: ['ishIcm14'],
		},
		commercetools: {
			summary: 'Announced as a launch partner.',
			evidence: 'vendor-claim',
			sources: ['ctAcp'],
		},
	},
	{
		protocol: 'UCP',
		what: "Google's Universal Commerce Protocol — feeds and checkout in Gemini.",
		intershop: {
			summary: 'No support found.',
			evidence: 'unconfirmed',
			sources: [],
		},
		commercetools: {
			summary: 'Through AI Hub; "currently available to select US merchants".',
			evidence: 'vendor-claim',
			sources: ['ctUcp'],
		},
	},
	{
		protocol: 'AP2',
		what: "Google's Agent Payments Protocol.",
		intershop: {
			summary: 'No support found.',
			evidence: 'unconfirmed',
			sources: [],
		},
		commercetools: {
			summary: "Not named in Google's launch partner list; a third-party claim of partnership is unverified.",
			evidence: 'unconfirmed',
			sources: ['googleAp2'],
		},
	},
];

// ---------------------------------------------------------------------------
// Migration paths
// ---------------------------------------------------------------------------

export interface MigrationPath {
	id: string;
	name: string;
	summary: string;
	aemImpact: string;
	erpImpact: string;
	parallelRun: string;
	risks: string[];
	blockers: string[];
	fitsWhen: string;
}

export const migrationPaths: MigrationPath[] = [
	{
		id: 'stay',
		name: 'Stay on Intershop',
		summary:
			'Keep the four central-instance OpCos on ICM, which is already current at 14.5. Adopt Copilot for Merchants and ACP feeds where they help.',
		aemImpact: 'None.',
		erpImpact: 'None.',
		parallelRun: 'Nothing new to run.',
		risks: [
			'The feature-velocity and AI gaps that prompted this evaluation remain.',
			'Recurring major-version upgrades across the shared codebase.',
		],
		blockers: [],
		fitsWhen: 'The gaps in buyer agents and build speed are acceptable for the next planning horizon.',
	},
	{
		id: 'greenfield',
		name: 'Greenfield first',
		summary:
			'The next new OpCo or region launches on commercetools. Nothing already live moves.',
		aemImpact: 'New AEM components for the new storefront only.',
		erpImpact: 'One new ERP integration, built for commercetools.',
		parallelRun: 'Two commerce platforms, two integration styles, and two skill sets from day one.',
		risks: [
			'Long-term dual running if later migrations never happen.',
			'Shared services (Auth0, payments) need a second integration.',
		],
		blockers: ['Needs a new launch to be on the roadmap.'],
		fitsWhen: 'A launch is coming anyway and the evaluation needs production evidence at low risk.',
	},
	{
		id: 'one-at-a-time',
		name: 'One OpCo at a time',
		summary:
			'Move one existing OpCo end to end, prove it in production, then move the rest in sequence.',
		aemImpact:
			'Every AEM component that calls commerce must change for each OpCo that moves, because AEM calls Intershop directly.',
		erpImpact:
			'Each ERP integration is rebuilt when its OpCo moves; the Java cartridges keep running for the OpCos still on Intershop.',
		parallelRun: 'Both platforms live for the whole programme, with the central team operating both.',
		risks: [
			'Longest period of dual running.',
			'Shared customers across OpCos need a clear identity and data story in Auth0.',
		],
		blockers: ['B2B gaps (punchout, budgets) must be closed for each moving OpCo that uses them.'],
		fitsWhen: 'Risk must be contained per OpCo and the organisation can fund a multi-year programme.',
	},
	{
		id: 'big-bang',
		name: 'Big bang',
		summary: 'All four central-instance OpCos cut over to commercetools together.',
		aemImpact: 'Every commerce-calling AEM component changes for all OpCos at once.',
		erpImpact: 'All three ERP integrations (D365, SAP, Oracle) rebuilt before go-live.',
		parallelRun: 'Short, but a single cutover window for every OpCo.',
		risks: [
			'Highest concentration of risk; any failure affects all four OpCos.',
			'The one public Intershop → commercetools migration we found (PLUS Supermarkets, grocery) took three years and cut over in a 24-hour window.',
		],
		blockers: ['Every B2B gap and every integration must be ready before go-live.'],
		fitsWhen: 'Rarely, for a shared multi-OpCo platform; included for completeness.',
	},
];

// ---------------------------------------------------------------------------
// Proof of concept
// ---------------------------------------------------------------------------

export interface PocCriterion {
	id: string;
	test: string;
	proves: string;
	passWhen: string;
	/** Comparison row ids this criterion resolves. */
	resolves: string[];
}

export const pocCriteria: PocCriterion[] = [
	{
		id: 'punchout',
		test: 'Punchout through the partner',
		proves: 'Procurement-system buying works without native support.',
		passWhen:
			'A buyer punches out from a test procurement system over cXML and OCI, builds a cart, and returns it — using Shopspray PunchoutPilot.',
		resolves: ['punchout'],
	},
	{
		id: 'auth0',
		test: 'Auth0 token mapping',
		proves: 'Central SSO carries over, including B2B context.',
		passWhen:
			'An Auth0-signed-in buyer calls commercetools through the introspection service within the 500 ms limit, with the correct customer and Business Unit scopes.',
		resolves: ['auth0'],
	},
	{
		id: 'erp',
		test: 'One ERP order flow, end to end',
		proves: 'The critical-path rebuild is feasible, and gives an effort baseline for the others.',
		passWhen:
			'An order placed in commercetools reaches one ERP through a Subscription and a Connect app, and status flows back — with retry behaviour documented.',
		resolves: ['erp'],
	},
	{
		id: 'aem',
		test: 'One AEM component calling commercetools directly',
		proves: 'The real per-component rewrite cost, since AEM calls commerce directly.',
		passWhen:
			'An existing AEM commerce component (for example, price and availability) runs against commercetools, with the change effort recorded.',
		resolves: ['aem'],
	},
	{
		id: 'mcp',
		test: 'Commerce MCP scoped to one buyer',
		proves: 'Buyer agents can act safely within one customer’s permissions.',
		passWhen:
			'An agent connected to Commerce MCP, pinned to one customer and Business Unit, can search and build a cart but cannot see another buyer’s data.',
		resolves: ['buyer-agents'],
	},
	{
		id: 'budgets',
		test: 'Budgets and cost centers',
		proves: 'Whether the custom build is small or a programme of its own.',
		passWhen:
			'A cost-center budget blocks an over-budget order via an API Extension within the 2-second default timeout.',
		resolves: ['budgets'],
	},
];

// ---------------------------------------------------------------------------
// B2B feature usage per OpCo
// ---------------------------------------------------------------------------

/**
 * Which B2B features each OpCo relies on. Unknown today for all of them — the
 * checklist on the B2B page is how OpCo technical leads fill this in.
 * Keys are `b2bRows` ids; values are `null` until confirmed.
 */
export type Usage = 'used' | 'customized' | 'not-used';

export const b2bUsage: Record<string, Record<string, Usage | null>> = {};
