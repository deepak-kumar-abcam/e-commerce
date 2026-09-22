/**
 * Out-of-the-box Intershop capabilities, condensed from Intershop's official
 * feature list. Names are shortened for scanning; the source has full detail.
 *
 * Only what the source lists goes here. Features flagged `addOn` are marked
 * in the source as an additional option (separately licensed or priced).
 */

export const featureSource = {
	title: 'Feature List - Intershop Commerce Management 14.1',
	url: 'https://knowledge.intershop.com/kb/index.php/Display/47V976',
	version: 'ICM 14.1',
};

export type Feature = string | { name: string; addOn: true };

export interface FeatureGroup {
	id: string;
	title: string;
	/** lucide-react icon name, resolved in the component. */
	icon: string;
	summary: string;
	features: Feature[];
}

export interface FeatureCategory {
	id: string;
	title: string;
	icon: string;
	summary: string;
	groups: FeatureGroup[];
}

const addOn = (name: string): Feature => ({ name, addOn: true });

export const featureCategories: FeatureCategory[] = [
	{
		id: 'experience',
		title: 'Experience management',
		icon: 'Sparkles',
		summary: 'Content, search, campaigns, and promotions that shape what buyers see.',
		groups: [
			{
				id: 'online-marketing',
				title: 'Online marketing',
				icon: 'Megaphone',
				summary: 'SEO controls, ratings, and product feeds.',
				features: [
					'Meta tags (noindex / nofollow)',
					'XML and HTML sitemaps',
					'Ratings and reviews',
					'Scheduled product data feeds',
				],
			},
			{
				id: 'search',
				title: 'Search and navigation',
				icon: 'Search',
				summary: 'Full-text search with tuning and faceted navigation.',
				features: [
					'Full-text search',
					'Auto-suggest',
					'Synonyms',
					'Relevance weighting',
					'Filter navigation',
					'Filtered landing pages',
					'Intra-day index updates',
					'Search engine adapters (e.g. Solr)',
				],
			},
			{
				id: 'campaigns',
				title: 'Campaign management',
				icon: 'CalendarRange',
				summary: 'Time-boxed bundles of content and promotions for target groups.',
				features: [
					'Time frames and activation',
					'Target group assignment',
					'Content and promotion assignment',
					addOn('Campaign publishing'),
				],
			},
			{
				id: 'promotions',
				title: 'Promotion engine',
				icon: 'BadgePercent',
				summary: 'Rule-based discounts at item, order, and shipping level.',
				features: [
					'Item, order, shipping, and gift discounts',
					'Condition and action rules',
					'Reusable and unique codes',
					'Bulk code generation',
					'Promotion budgets',
					'Combinability rules',
					'Up-sell messaging',
					'Import / export',
				],
			},
			{
				id: 'content',
				title: 'Web content management',
				icon: 'LayoutTemplate',
				summary: 'Pages, components, and templates, shared across channels.',
				features: [
					'Pages, variants, and components',
					'Page and component templates',
					'Content sharing across channels',
					'Scheduled publishing',
					'Visibility periods',
					'Content locking',
				],
			},
			{
				id: 'media',
				title: 'Media assets',
				icon: 'Images',
				summary: 'Product imagery and downloadable attachments.',
				features: ['Product image views and sets', 'Product attachments'],
			},
		],
	},
	{
		id: 'product',
		title: 'Product information',
		icon: 'Package',
		summary: 'Product data, catalogs, pricing, and tax.',
		groups: [
			{
				id: 'product-data',
				title: 'Product data management',
				icon: 'Database',
				summary: 'Maintain, approve, and share product data.',
				features: [
					addOn('Near-unlimited products per channel'),
					'Change history',
					'Approval workflow',
					'Scheduled online status',
					'Variations, bundles, and retail sets',
					'Warranty products',
					'Custom attributes',
					'Batch processing',
					addOn('Product sharing across channels'),
					'Import / export (XML, CSV, BMEcat)',
				],
			},
			{
				id: 'lifecycle',
				title: 'Product lifecycle',
				icon: 'Hourglass',
				summary: 'Retire products on a schedule.',
				features: ['Last order date', 'End-of-life date'],
			},
			{
				id: 'relations',
				title: 'Product relations',
				icon: 'Link',
				summary: 'Typed links between products.',
				features: [
					'Cross-sell and up-sell',
					'Accessories and spare parts',
					'Replacements and follow-ups',
					'Different order units',
				],
			},
			{
				id: 'pricing',
				title: 'Pricing',
				icon: 'Tag',
				summary: 'Price types and special price lists.',
				features: [
					'List, sale, and cost prices',
					'Scaled (tier) prices',
					'Segment-specific price lists',
					'Time-limited prices',
					'Import / export',
				],
			},
			{
				id: 'tax',
				title: 'Taxation',
				icon: 'Receipt',
				summary: 'Tax classes and gross or net pricing.',
				features: ['Product tax classes', 'Gross / net per channel', 'Address-based calculation'],
			},
			{
				id: 'completeness',
				title: 'Completeness check',
				icon: 'ListChecks',
				summary: 'Rule-based product data quality checks.',
				features: ['Missing attributes, images, prices', 'Per-category rules', 'Result reports'],
			},
			{
				id: 'catalog',
				title: 'Catalog management',
				icon: 'FolderTree',
				summary: 'Catalogs, classification, and procurement punchout.',
				features: [
					'Customer-specific catalog views',
					'Catalog sharing',
					'Classification (eCl@ss, UNSPSC)',
					'Rule-based product binding',
					'Import / export (XML, CSV, BMEcat)',
					'Punchout: OCI 4.0 / 5.0',
					'Punchout: cXML',
				],
			},
		],
	},
	{
		id: 'customer',
		title: 'Customer management',
		icon: 'Users',
		summary: 'Accounts, personalisation, and B2B buying workflows.',
		groups: [
			{
				id: 'personalization',
				title: 'Personalisation',
				icon: 'UserCog',
				summary: 'Segment-driven catalogs, prices, and content.',
				features: [
					'Customer segments',
					'Dynamic segment assignment',
					'Segment-specific catalogs and prices',
					'Segment-specific shipping and payment',
					'Segment-specific promotions and content',
					'Recently viewed',
					'Segmentation API (external CRM)',
				],
			},
			{
				id: 'quotes',
				title: 'Quotes',
				icon: 'MessageSquareQuote',
				summary: 'Request and negotiate prices.',
				features: ['Request from product or cart', 'Account-manager pricing', 'Accept / reject to cart'],
			},
			{
				id: 'contracts',
				title: 'Contracts',
				icon: 'FileSignature',
				summary: 'Revenue-based contract pricing.',
				features: ['Revenue targets', 'Contract pricing', 'Best-price assignment'],
			},
			{
				id: 'budgets',
				title: 'Budgets and cost centres',
				icon: 'Wallet',
				summary: 'Spend control with approvals.',
				features: ['Cost centres', 'Periodic or fixed budgets', 'Owner approval'],
			},
			{
				id: 'order-templates',
				title: 'Order templates',
				icon: 'ClipboardList',
				summary: 'Fast reordering.',
				features: ['From cart or past orders', 'Edit and add to cart'],
			},
			{
				id: 'customer-data',
				title: 'Customer data',
				icon: 'IdCard',
				summary: 'Profiles, self-service, and privacy.',
				features: [
					'Private and business customers',
					'Self-registration and approval',
					'Guest checkout',
					'Multiple addresses',
					'Wish lists',
					'Order history and tracking',
					'Newsletter and notification preferences',
					'GDPR export and deletion',
					'Import / export',
				],
			},
		],
	},
	{
		id: 'transaction',
		title: 'Transaction management',
		icon: 'ShoppingCart',
		summary: 'Cart, checkout, shipping, and payment.',
		groups: [
			{
				id: 'checkout',
				title: 'Cart and checkout',
				icon: 'ShoppingBasket',
				summary: 'Configurable basket and checkout flow.',
				features: [
					'Persistent cart',
					'Accelerated checkout',
					'Multiple ship-to addresses',
					'Desired delivery date',
					'Pick up in store',
					'Gift cards and certificates',
					'Final stock check',
					'Basket calculation rules',
					'Order export and status import',
					addOn('Recurring orders'),
				],
			},
			{
				id: 'shipping',
				title: 'Shipping',
				icon: 'Truck',
				summary: 'Methods, regions, and rules.',
				features: [
					'Shipping methods and regions',
					'Freight classes',
					'Rules and surcharges',
					'Delivery time per product',
				],
			},
			{
				id: 'payment',
				title: 'Payment',
				icon: 'CreditCard',
				summary: 'Built-in methods plus provider plug-ins.',
				features: [
					'Invoice',
					'Cash in advance / on delivery',
					'Gift cards',
					'Payment provider framework',
					'Payment costs and sorting',
				],
			},
		],
	},
	{
		id: 'organization',
		title: 'Organisation management',
		icon: 'Building2',
		summary: 'Channels, locales, and back-office users.',
		groups: [
			{
				id: 'localization',
				title: 'Localisation',
				icon: 'Languages',
				summary: 'Languages, currencies, and time zones.',
				features: [
					'Multiple locales',
					'Multiple currencies',
					'Localised strings',
					'UTF-8 throughout',
					'Time zone per channel',
				],
			},
			{
				id: 'org-model',
				title: 'Organisation modelling',
				icon: 'Network',
				summary: 'Multi-tenant sales and partner channels.',
				features: [
					'Multi-tenant sales organisation',
					'Unlimited sales channels',
					'Partner channel hierarchy',
					'Supplier and affiliate networks',
				],
			},
			{
				id: 'users',
				title: 'Users and accounts',
				icon: 'ShieldCheck',
				summary: 'Role-based back-office access.',
				features: ['Roles and permissions', 'Activation and deactivation', 'Import / export'],
			},
		],
	},
	{
		id: 'analytics',
		title: 'Analytics and reporting',
		icon: 'ChartColumn',
		summary: 'Back-office dashboards and tracking.',
		groups: [
			{
				id: 'dashboards',
				title: 'Dashboards',
				icon: 'LayoutDashboard',
				summary: 'Configurable widgets for key metrics.',
				features: ['Custom dashboards', 'Approval-status widget', 'Completeness widget'],
			},
			{
				id: 'web-analytics',
				title: 'Web analytics',
				icon: 'Activity',
				summary: 'Storefront and order tracking.',
				features: ['Storefront performance', 'Order tracking'],
			},
			{
				id: 'auditing',
				title: 'Auditing',
				icon: 'ScrollText',
				summary: 'Who did what.',
				features: ['User activity reports'],
			},
		],
	},
	{
		id: 'platform',
		title: 'Platform and operations',
		icon: 'Server',
		summary: 'APIs, scaling, delivery, and security.',
		groups: [
			{
				id: 'apis',
				title: 'APIs and integration',
				icon: 'Plug',
				summary: 'Headless by design, with service frameworks.',
				features: [
					'REST API for all storefront functions',
					'Intershop PWA reference storefront',
					'Managed service framework',
					'Payment, inventory, tax, address APIs',
					'Order export framework',
					'Import / export APIs',
				],
			},
			{
				id: 'scaling',
				title: 'Scaling and availability',
				icon: 'Gauge',
				summary: 'Clustered for high traffic.',
				features: ['Multi-layer caching', 'Clustering', 'Failover', 'Load balancing'],
			},
			{
				id: 'replication',
				title: 'Replication',
				icon: 'Copy',
				summary: 'Edit-to-live data replication.',
				features: [addOn('Data replication between environments'), addOn('Scheduled replication')],
			},
			{
				id: 'delivery',
				title: 'Continuous delivery',
				icon: 'GitBranch',
				summary: 'Cartridge-based customisation and deployment.',
				features: ['Cartridges', 'Configuration management', 'Deployment tooling'],
			},
			{
				id: 'security',
				title: 'Security',
				icon: 'Lock',
				summary: 'Access control and compliance.',
				features: ['Role-based access', 'Encryption and TLS', 'Audit logging', 'GDPR', 'PCI DSS'],
			},
		],
	},
];

export const featureName = (feature: Feature) => (typeof feature === 'string' ? feature : feature.name);
export const isAddOn = (feature: Feature) => typeof feature !== 'string';

export const featureCount = featureCategories.reduce(
	(total, category) => total + category.groups.reduce((sum, group) => sum + group.features.length, 0),
	0
);
