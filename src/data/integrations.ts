/**
 * How data reaches the central instance: the systems it passes through and
 * the flows that carry it. Rendered by the Architecture and Flow Diagrams
 * sections.
 *
 * Same rule as `platform.ts`: anything not confirmed is `null`, never guessed,
 * and renders as "Not documented". Flows transcribe the platform team's
 * integration notes; where those notes are ambiguous the flow records the
 * question in `openQuestions` instead of resolving it silently.
 */

import {
	centralOpcos,
	isNotApplicable,
	sharedServices,
	systemOf,
	type OpCo,
	type SystemCategory,
	type SystemSlot,
} from './platform';

// ---------------------------------------------------------------------------
// Systems
// ---------------------------------------------------------------------------

export interface IntegrationSystem {
	id: string;
	name: string;
	role: string;
	detail: string;
	category: SystemCategory;
	/** Where it stands in a migration, shown as a badge. */
	status?: string;
	/** OpCo ids that use it; `null` = shared by every central-instance OpCo. */
	opcos: string[] | null;
}

/** Plumbing that isn't a service in its own right, so it isn't in `sharedServices`. */
const plumbing: IntegrationSystem[] = [
	{
		id: 'sftp',
		name: 'Danaher LS SFTP server',
		role: 'File exchange',
		detail: 'Landing point for files from the ERPs and WebDB, which Boomi picks up.',
		category: 'integration',
		opcos: null,
	},
	{
		id: 'webdb',
		name: 'WebDB',
		role: 'Staging database',
		detail:
			'Stages customer-specific pricing and quotes from the ERP, and customer and segment data from the CRM, then sends them to the SFTP server as files.',
		category: 'integration',
		opcos: ['phenomenex'],
	},
];

export const integrationSystems: IntegrationSystem[] = [
	...sharedServices.map((s) => ({ ...s, opcos: null })),
	...plumbing,
];

/**
 * Stages inside Phenomenex's ERP that an order passes through. Not systems in
 * their own right, so flows can name them but the architecture map doesn't.
 */
const erpStages: IntegrationSystem[] = [
	{
		id: 'preorder',
		name: 'Pre-order table',
		role: 'In the ERP',
		detail: 'Where orders from Intershop land in the ERP, until the batch job converts them.',
		category: 'order',
		opcos: ['phenomenex'],
	},
	{
		id: 'sales-order',
		name: 'Sales order',
		role: 'In the ERP',
		detail: 'The order as the ERP fulfils it.',
		category: 'order',
		opcos: ['phenomenex'],
	},
	{
		id: 'order-booking',
		name: 'Order booking team',
		role: 'Manual intervention',
		detail: 'Resolves orders flagged in the ERP for missing information.',
		category: 'order',
		opcos: ['phenomenex'],
	},
];

/**
 * Payment providers, one per name in `platform.ts`, with the OpCos that use
 * each. Ids are the lowercased name, e.g. `stripe`.
 */
const paymentProviders: IntegrationSystem[] = [
	...centralOpcos
		.reduce((byName, o) => {
			const provider = systemOf(o.paymentProvider);
			if (provider) byName.set(provider.name, [...(byName.get(provider.name) ?? []), o]);
			return byName;
		}, new Map<string, OpCo[]>())
		.entries(),
].map(([name, users]) => ({
	id: name.toLowerCase(),
	name,
	role: 'Payment provider',
	detail: `Card payments for ${users.map((o) => o.short).join(' and ')}.`,
	category: 'payment' as const,
	opcos: users.map((o) => o.id),
}));

/** Leica Microsystems teams that capture payments by hand, until SAP does. */
const lmsTeams: IntegrationSystem[] = [
	{
		id: 'lms-customer-service',
		name: 'Customer service',
		role: 'LMS team',
		detail: 'Processes orders from its queue and generates the invoice.',
		category: 'order',
		opcos: ['leica-microsystems'],
	},
	{
		id: 'lms-finance',
		name: 'Finance',
		role: 'LMS team',
		detail: 'Captures payments by hand in the Stripe Dashboard.',
		category: 'payment',
		opcos: ['leica-microsystems'],
	},
];

/** SCIEX's team that books orders Oracle flags for review. */
const sciexTeams: IntegrationSystem[] = [
	{
		id: 'sciex-customer-service',
		name: 'Customer service',
		role: 'SCIEX team',
		detail: 'Reviews and books orders that Oracle flags, and handles invoicing.',
		category: 'order',
		opcos: ['sciex'],
	},
];

/**
 * Systems on the sign-in journey that aren't run by the platform team, or
 * belong to one OpCo. Shown in the sign-in flow, not on the architecture map.
 */
const identityNodes: IntegrationSystem[] = [
	{
		id: 'storefront',
		name: 'AEM storefront',
		role: 'Edge Delivery Services or traditional AEM',
		detail: 'Both send customers to Auth0 to sign in, and receive the ID token back.',
		category: 'content',
		opcos: null,
	},
	{
		id: 'azure-b2c',
		name: 'Azure AD B2C',
		role: 'Legacy PHX identity provider',
		detail: 'Holds Phenomenex users not yet migrated to Auth0.',
		category: 'identity',
		opcos: ['phenomenex'],
	},
	{
		id: 'onelogin',
		name: 'OneLogin',
		role: 'LMS partner identity provider',
		detail: 'Leica Microsystems partners sign in with their OneLogin profiles.',
		category: 'identity',
		opcos: ['leica-microsystems'],
	},
	{
		id: 'phx-web-api',
		name: 'PHX Web API',
		role: 'Phenomenex web backend',
		detail: 'Reads the registration answers from the ID token and stores them in WebDB.',
		category: 'integration',
		opcos: ['phenomenex'],
	},
	{
		id: 'sciex-website-db',
		name: 'SCIEX website database',
		role: 'Behind the SCIEX AEM backend',
		detail: 'Where the SCIEX website stores the registration answers from the ID token.',
		category: 'content',
		opcos: ['sciex'],
	},
];

/** Everything a flow step can name besides an OpCo's own ERP or CRM. */
/** Where Danaher Life Sciences quote requests go: the central Marketing Cloud, then each product's OpCo's CRM. */
const leadNodes: IntegrationSystem[] = [
	{
		id: 'sfmc',
		name: 'Salesforce Marketing Cloud',
		role: 'Central lead routing',
		detail: 'The central Marketing Cloud, integrated with each OpCo, routes each lead to the right OpCo based on the comments sent with it.',
		category: 'marketing',
		opcos: null,
	},
	{
		id: 'opco-crm',
		name: 'OpCo CRM',
		role: 'The CRM of each product’s OpCo',
		detail: 'Each OpCo’s own CRM: Salesforce for SCIEX and Leica Microsystems, Microsoft Dynamics CRM for Phenomenex.',
		category: 'crm',
		opcos: null,
	},
];

/** Phenomenex teams that step in when an order can't go through automatically. */
const phxTeams: IntegrationSystem[] = [
	{
		id: 'phx-customer-service',
		name: 'Customer service',
		role: 'PHX team',
		detail: 'Enters orders into the ERP by hand when there is a problem with the order data.',
		category: 'order',
		opcos: ['phenomenex'],
	},
];

const flowNodes = [
	...integrationSystems,
	...erpStages,
	...paymentProviders,
	...lmsTeams,
	...sciexTeams,
	...phxTeams,
	...identityNodes,
	...leadNodes,
];

/**
 * A step in a flow: a shared system by id, or an OpCo's own ERP or CRM, which
 * resolves per OpCo from `platform.ts`.
 */
export type NodeId = 'erp' | 'crm' | (string & {});

export interface ResolvedNode {
	/** What the box is called, e.g. "ERP" or "inRiver". */
	title: string;
	/** The concrete system, or `null` when it isn't documented. */
	system: string | null;
	detail?: string;
	perOpco: boolean;
}

/** The system's name, "None" when the OpCo knowingly has none, or `null` when not documented. */
const slotName = (slot: SystemSlot): string | null =>
	slot === null ? null : isNotApplicable(slot) ? `None (${slot.reason.toLowerCase()})` : slot.name;

const opcoRoles: Record<'erp' | 'crm', { title: string; pick: (o: OpCo) => SystemSlot }> = {
	erp: { title: 'ERP', pick: (o) => o.orderBackend },
	crm: { title: 'CRM', pick: (o) => o.crm },
};

/**
 * Resolve a node for the OpCos a route covers. With one OpCo the box names
 * its system; with several it lists each OpCo's.
 */
export function resolveNode(id: NodeId, opcoIds: string[]): ResolvedNode {
	if (id === 'erp' || id === 'crm') {
		const role = opcoRoles[id];
		const covered = centralOpcos.filter((o) => opcoIds.includes(o.id));
		if (covered.length === 1) {
			return { title: role.title, system: slotName(role.pick(covered[0])), perOpco: true };
		}
		const detail = covered.map((o) => `${o.short}: ${slotName(role.pick(o)) ?? 'not documented'}`).join(' · ');
		return { title: role.title, system: 'One per OpCo', detail, perOpco: true };
	}
	const system = flowNodes.find((s) => s.id === id);
	if (!system) throw new Error(`Unknown integration system "${id}"`);
	return { title: system.name, system: system.role, perOpco: false };
}

// ---------------------------------------------------------------------------
// Flows
// ---------------------------------------------------------------------------

export interface Hop {
	/** Tells apart hops between the same two systems, e.g. two calls made at different times. */
	key?: string;
	from: NodeId;
	to: NodeId;
	/** `boomi` = carried by a Boomi process; `direct` = no middleware; `null` = not documented. */
	via: 'boomi' | 'direct' | null;
	/**
	 * How data moves on this hop. `batch` = a scheduled job inside one system;
	 * `manual` = done by hand, e.g. in a vendor's dashboard.
	 */
	mechanism: 'file' | 'api' | 'batch' | 'email' | 'manual' | null;
	/** A synchronous call whose response the caller waits for; drawn with arrows both ways. */
	sync?: boolean;
	/** e.g. "Nightly", "Real-time". */
	frequency: string | null;
	/** e.g. "CSV", "XML". */
	format: string | null;
	status: 'live' | 'planned';
	/** Recorded as described but not yet confirmed; drawn with a question mark. */
	unconfirmed?: boolean;
	note?: string;
}

export interface Route {
	label: string;
	/** Central-instance OpCo ids this route is documented for. */
	opcos: string[];
	/** In order. A hop that doesn't start where the last one ended begins a branch. */
	hops: Hop[];
}

export interface DataFlow {
	id:
		| 'product-data'
		| 'customer-data'
		| 'customer-pricing'
		| 'quotes'
		| 'customer-segments'
		| 'orders'
		| 'payments'
		| 'quote-requests'
		| 'sign-in';
	/**
	 * `inbound` = into Intershop from the systems that own the data;
	 * `outbound` = from Intershop; `identity` = sign-in and registration,
	 * which start at the storefront and pass through Intershop on the way.
	 */
	direction: 'inbound' | 'outbound' | 'identity';
	title: string;
	href: string;
	summary: string;
	/** What the data contains. */
	carries: string[];
	/** Where the data is created and owned. */
	master: { node: NodeId; confirmed: boolean };
	/** OpCos this flow knowingly doesn't apply to, with the reason. */
	notApplicable?: Record<string, string>;
	routes: Route[];
	/**
	 * How each central-instance OpCo's route differs from the one documented.
	 * Only set for flows documented as common; `null` = not documented.
	 */
	variations?: Record<string, string | null>;
	openQuestions: string[];
}

export const mechanismLabel: Record<NonNullable<Hop['mechanism']>, string> = {
	file: 'File',
	api: 'API',
	batch: 'Batch job',
	email: 'Email',
	manual: 'Manual',
};

/** A hop with nothing known beyond its ends. */
const hop = (from: NodeId, to: NodeId, extra: Partial<Hop> = {}): Hop => ({
	from,
	to,
	via: null,
	mechanism: null,
	frequency: null,
	format: null,
	status: 'live',
	...extra,
});

/** Writing to the SFTP server is a file drop by definition. */
const toSftp = (from: NodeId): Hop => hop(from, 'sftp', { mechanism: 'file' });

const allCentral = centralOpcos.map((o) => o.id);
/** OpCos with an ERP. DHLS has none yet, so product data can't start in one. */
const withErp = centralOpcos.filter((o) => !isNotApplicable(o.orderBackend)).map((o) => o.id);
const phxOnly = ['phenomenex'];
const sciexOnly = ['sciex'];

/**
 * Stripe at checkout, the same for Phenomenex and Leica Microsystems: the
 * card is saved to Stripe, then the order total is authorised for capture
 * later. Intershop makes the server-side calls.
 */
const stripeCheckout: Hop[] = [
	hop('intershop', 'stripe', {
		key: 'prepare',
		via: 'direct',
		mechanism: 'api',
		sync: true,
		frequency: 'At checkout',
		note: 'Creates the SetupIntent whose key renders Stripe’s payment form, and fetches the customer’s saved payment methods so returning customers can pick one. Built by the platform team, not Intershop’s Stripe connector; the Stripe settings live in Intershop managed services, one per sales channel.',
	}),
	hop('aem', 'stripe', {
		via: 'direct',
		mechanism: 'api',
		sync: true,
		frequency: 'At checkout',
		note: 'The checkout page renders Stripe’s payment form in an iframe with Stripe.js. The card goes to Stripe, which checks it and saves it to the customer as a payment method for later charges. 3-D Secure applies to customers in the EU and Australia.',
	}),
	hop('intershop', 'stripe', {
		key: 'authorise',
		via: 'direct',
		mechanism: 'api',
		sync: true,
		frequency: 'On order submission',
		note: 'Authorises the order total, tax and shipping from Order Simulate included, on the saved card with manual capture: a hold, not yet a charge. If Stripe declines, the order can’t be placed.',
	}),
];

/**
 * The PHX route through WebDB, which every flow except product data takes:
 * from the ERP or CRM into WebDB, then as files to the SFTP server for Boomi.
 * `scheduled` marks WebDB's per-data-type scheduled export.
 */
const viaWebdb = (start: NodeId[], { scheduled = false } = {}): Hop[] => {
	const chain: NodeId[] = [...start, 'webdb'];
	return [
		...chain.slice(1).map((to, i) => hop(chain[i], to)),
		scheduled
			? hop('webdb', 'sftp', {
					mechanism: 'file',
					frequency: 'Every 24 hours',
					format: 'CSV',
					note: 'Pushed by a scheduled job, one per data type.',
				})
			: toSftp('webdb'),
		hop('sftp', 'intershop', { via: 'boomi' }),
	];
};

export const dataFlows: DataFlow[] = [
	{
		id: 'product-data',
		direction: 'inbound',
		title: 'Product data',
		href: '/flows/product-data/',
		summary:
			'Products are created in each OpCo’s ERP, enriched in inRiver, and published to Intershop and Coveo.',
		carries: ['SKUs', 'Titles', 'List prices', 'Descriptions', 'Images', 'Attributes'],
		master: { node: 'erp', confirmed: true },
		routes: [
			{
				label: 'Current route',
				opcos: withErp,
				hops: [
					toSftp('erp'),
					hop('sftp', 'inriver', { via: 'boomi', note: 'inRiver enriches the ERP data.' }),
					hop('inriver', 'intershop', {
						via: 'boomi',
						note: 'Carries list prices as well as product data.',
					}),
					hop('inriver', 'coveo', { via: 'direct', note: 'inRiver feeds Coveo directly, not through Boomi.' }),
				],
			},
			{
				label: 'Danaher Life Sciences marketplace',
				opcos: ['danaher-life-sciences'],
				hops: [
					hop('inriver', 'intershop', {
						key: 'dhls',
						via: 'boomi',
						note: 'The other OpCos’ products, published from inRiver to the Danaher Life Sciences channel as well as their own.',
					}),
					hop('inriver', 'coveo', {
						key: 'dhls',
						via: 'direct',
						note: 'Indexed for the Danaher Life Sciences storefront from the same inRiver feed.',
					}),
				],
			},
			{
				label: 'List prices, planned',
				opcos: withErp,
				hops: [
					hop('erp', 'intershop', {
						status: 'planned',
						note: 'List prices are to stop passing through inRiver. The replacement route and date are not documented.',
					}),
				],
			},
		],
		variations: {
			...Object.fromEntries(allCentral.map((id) => [id, null])),
			'danaher-life-sciences':
				'No ERP of its own: a common marketplace hosting the other OpCos’ products, fed to Intershop and Coveo from inRiver. Shoppers request quotes rather than buy.',
		},
		openQuestions: ['Where will list prices come from once they leave inRiver, and when?'],
	},
	{
		id: 'customer-data',
		direction: 'inbound',
		title: 'Customer data',
		href: '/flows/customer-data/',
		summary: 'Customer accounts, contacts, and addresses, from the CRM into Intershop.',
		carries: ['Customer profiles', 'Contacts', 'Addresses'],
		master: { node: 'crm', confirmed: true },
		routes: [{ label: 'Phenomenex', opcos: phxOnly, hops: viaWebdb(['crm']) }],
		openQuestions: [],
	},
	{
		id: 'customer-pricing',
		direction: 'inbound',
		title: 'Customer-specific pricing',
		href: '/flows/customer-pricing/',
		summary: 'Negotiated prices per customer, from the ERP into Intershop.',
		carries: ['Customer-specific pricing agreements'],
		master: { node: 'erp', confirmed: true },
		routes: [
			{ label: 'Phenomenex', opcos: phxOnly, hops: viaWebdb(['erp'], { scheduled: true }) },
			{
				label: 'SCIEX',
				opcos: sciexOnly,
				hops: [
					hop('erp', 'sftp', {
						via: 'direct',
						mechanism: 'file',
						frequency: 'Every 24 hours',
						format: 'XML',
						note: 'A scheduled job in Oracle publishes the prices as files to the SFTP server over SSH.',
					}),
					hop('sftp', 'intershop', { via: 'boomi' }),
				],
			},
		],
		notApplicable: { 'leica-microsystems': 'Not sent to Intershop' },
		openQuestions: [],
	},
	{
		id: 'quotes',
		direction: 'inbound',
		title: 'Quotes',
		href: '/flows/quotes/',
		summary: 'Quotes from the ERP, made available to customers in Intershop.',
		carries: ['Quote details', 'Quoted prices', 'Customer'],
		master: { node: 'erp', confirmed: true },
		routes: [{ label: 'Phenomenex', opcos: phxOnly, hops: viaWebdb(['erp'], { scheduled: true }) }],
		notApplicable: { sciex: 'No quotes', 'leica-microsystems': 'Not sent to Intershop' },
		openQuestions: [],
	},
	{
		id: 'customer-segments',
		direction: 'inbound',
		title: 'Customer segments',
		href: '/flows/customer-segments/',
		summary: 'Market lists from the CRM, used to target customers in Intershop.',
		carries: ['Segment membership (demographics, purchase history, behaviour)'],
		master: { node: 'crm', confirmed: true },
		routes: [{ label: 'Phenomenex', opcos: phxOnly, hops: viaWebdb(['crm']) }],
		openQuestions: [],
	},
	{
		id: 'orders',
		direction: 'outbound',
		title: 'Orders',
		href: '/flows/orders/',
		summary:
			'Created directly in the ERP — checked against it at checkout for Phenomenex — and booked, or flagged for review; emailed to customer service for Leica Microsystems.',
		carries: [
			'Orders',
			'Tax, shipping, and estimated delivery date (from Order Simulate)',
			'Account blocks (from Order Simulate)',
		],
		master: { node: 'intershop', confirmed: true },
		notApplicable: { 'danaher-life-sciences': 'No direct sale; quote requests instead' },
		routes: [
			{
				label: 'Phenomenex',
				opcos: phxOnly,
				hops: [
					hop('intershop', 'erp', {
						via: 'direct',
						mechanism: 'api',
						sync: true,
						frequency: 'On the checkout shipping and payment pages',
						note: 'Order Simulate: called on the shipping page once the customer has chosen their addresses, and again on the payment page, so the values are current before the order is submitted. Returns tax, shipping, and an estimated delivery date, and stops the order if the account has a block in the ERP. If the call fails, the customer can’t submit the order.',
					}),
					hop('intershop', 'preorder', {
						via: 'direct',
						mechanism: 'api',
						frequency: 'Real-time, on submit',
						note: 'Intershop creates the order directly in the ERP. If the call fails, the order stays in Intershop and a reprocess job tries it again.',
					}),
					hop('intershop', 'phx-customer-service', {
						note: 'When there is a problem with the order data, the order is sent to customer service, who enter it into the ERP by hand.',
					}),
					hop('preorder', 'sales-order', {
						via: 'direct',
						mechanism: 'batch',
						note: 'A batch job converts pre-orders to sales orders.',
					}),
					hop('preorder', 'order-booking', {
						via: 'direct',
						note: 'Flagged for manual intervention when information is missing, e.g. a new customer not yet in the ERP.',
					}),
					hop('order-booking', 'sales-order', {
						via: 'direct',
						unconfirmed: true,
						note: 'Once resolved, the order goes on to become a sales order.',
					}),
				],
			},
			{
				label: 'SCIEX',
				opcos: sciexOnly,
				hops: [
					hop('intershop', 'erp', {
						key: 'sciex-order',
						via: 'direct',
						mechanism: 'api',
						frequency: 'On order submission',
						note: 'Intershop creates the order through Oracle’s REST order-create API. There is no check against Oracle during checkout. Oracle books the order directly when the account, ship-to, and bill-to already exist and it is a normal order with a value of 10,000 or less, in the order’s currency.',
					}),
					hop('erp', 'sciex-customer-service', {
						via: 'direct',
						note: 'Flags set up by customer service hold an order for manual review: a new account or address, a special request such as shipping instructions or notes, or an order value over 10,000 — the same figure in every currency: USD, CAD, EUR, CHF, and the rest.',
					}),
				],
			},
			{
				label: 'Leica Microsystems',
				opcos: ['leica-microsystems'],
				hops: [
					hop('intershop', 'lms-customer-service', {
						via: 'direct',
						mechanism: 'email',
						frequency: 'On order submission',
						note: 'Intershop sends the order to the customer service team as an email notification.',
					}),
					hop('intershop', 'erp', {
						key: 'lms-order-planned',
						via: 'direct',
						mechanism: 'api',
						status: 'planned',
						note: 'Planned for later in 2026: orders to go to SAP through a REST API instead of by email.',
					}),
				],
			},
		],
		openQuestions: [
			'Which kinds of ERP block stop an order, and what does the customer see?',
			'Is the ERP’s tax final on the order? Is shipping a cost, a choice of options, or both? Is the delivery date per order or per line?',
			'Does the ERP return anything when the order is created, such as an order number? How often does the reprocess job run, and how many times does it retry?',
			'How does a Phenomenex order with a data problem reach customer service: by email, or another route?',
			'How often does the batch job run?',
			'Besides a new customer, what flags an order for manual intervention?',
			'Do order status, shipment, or invoice updates flow back to Intershop, and is the customer told when an order is held?',
			'For Leica Microsystems, how does customer service get the order into SAP today, and is the purchase order document attached to the email?',
		],
	},
	{
		id: 'payments',
		direction: 'outbound',
		title: 'Payments',
		href: '/flows/payments/',
		summary:
			'Cards saved with Stripe or Cybersource at checkout, authorised when the order is placed, and captured once it is invoiced.',
		carries: [
			'Saved cards (provider tokens and masked details)',
			'Authorisations',
			'Captures',
			'Refunds',
		],
		master: { node: 'aem', confirmed: true },
		notApplicable: { 'danaher-life-sciences': 'No direct sale; quote requests instead' },
		routes: [
			{
				label: 'Phenomenex: Stripe, captured by the ERP',
				opcos: phxOnly,
				hops: [
					...stripeCheckout,
					hop('intershop', 'erp', {
						key: 'phx-order',
						via: 'direct',
						mechanism: 'api',
						frequency: 'Real-time, on submit',
						note: 'The PaymentIntent and payment method IDs travel in the order-create payload of the ERP’s REST API.',
					}),
					hop('erp', 'stripe', {
						via: 'direct',
						mechanism: 'api',
						frequency: 'On invoice',
						note: 'When the order is invoiced, the ERP captures the invoiced amount. It can capture less than authorised (lower tax, or an order customer service reduced), more, or in several captures for a split shipment; over-capture and multicapture are enabled on the Stripe account at Stripe’s special request. If the authorisation expires despite extended authorisation being enabled, the ERP creates a new PaymentIntent on the payment method from the order. It then records a payment journal against the paid invoice and fulfils the order. Refunds also go through the ERP’s Stripe integration.',
					}),
				],
			},
			{
				label: 'Leica Microsystems: Stripe, captured by hand',
				opcos: ['leica-microsystems'],
				hops: [
					...stripeCheckout,
					hop('intershop', 'lms-customer-service', {
						via: 'direct',
						mechanism: 'email',
						frequency: 'On order submission',
						note: 'Intershop sends the order to the customer service team as an email notification.',
					}),
					hop('intershop', 'erp', {
						key: 'lms-order-planned',
						via: 'direct',
						mechanism: 'api',
						status: 'planned',
						note: 'Planned for later in 2026: orders to go to SAP through a REST API instead of by email.',
					}),
					hop('lms-customer-service', 'lms-finance', {
						via: 'direct',
						mechanism: 'email',
						frequency: 'On invoice',
						note: 'The team processes the order, generates the invoice, and emails finance to capture the payment.',
					}),
					hop('lms-finance', 'stripe', {
						via: 'direct',
						mechanism: 'manual',
						frequency: 'On invoice',
						note: 'Finance captures the amount by hand in the Stripe Dashboard. If the authorisation has expired, finance charges the saved card afresh. Refunds are also made by hand in the Dashboard.',
					}),
					hop('erp', 'stripe', {
						key: 'lms-planned',
						via: 'direct',
						mechanism: 'api',
						status: 'planned',
						note: 'An SAP integration is to take over capture. It is not on the roadmap yet.',
					}),
				],
			},
			{
				label: 'SCIEX: Cybersource, captured by the ERP',
				opcos: ['sciex'],
				hops: [
					hop('aem', 'cybersource', {
						via: 'direct',
						mechanism: 'api',
						sync: true,
						frequency: 'At checkout',
						note: 'Uses Intershop’s Cybersource connector. The checkout page renders Cybersource’s card fields in an iframe with the Microform library. Cybersource checks the card and returns a short-lived token with the masked card details. Cards are offered in the US and Canada only.',
					}),
					hop('aem', 'intershop', {
						via: 'direct',
						mechanism: 'api',
						sync: true,
						frequency: 'At checkout',
						note: 'The short-lived token goes to Intershop through its PaymentInstruments API.',
					}),
					hop('intershop', 'cybersource', {
						key: 'token',
						via: 'direct',
						mechanism: 'api',
						sync: true,
						frequency: 'At checkout',
						note: 'Intershop exchanges the short-lived token for a stored (TMS) token, and saves it as a payment instrument with the last four digits, expiry month and year, and cardholder name, so the customer can use the card again.',
					}),
					hop('intershop', 'cybersource', {
						key: 'authorise',
						via: 'direct',
						mechanism: 'api',
						sync: true,
						frequency: 'On order submission',
						note: 'Authorises $0.10 (USD or CAD) on the card, not the order amount.',
					}),
					hop('intershop', 'erp', {
						key: 'sciex-order',
						via: 'direct',
						mechanism: 'api',
						frequency: 'On order submission',
						note: 'The whole order, card details and stored token included, goes in the order-create payload of the ERP’s REST API.',
					}),
					hop('erp', 'cybersource', {
						via: 'direct',
						mechanism: 'api',
						frequency: 'On invoice',
						note: 'When the order is invoiced, the ERP authorises and captures the invoiced amount afresh on the stored token. The $0.10 authorisation is not captured. Refunds are made by hand in Cybersource.',
					}),
				],
			},
		],
		openQuestions: [
		],
	},
	{
		id: 'quote-requests',
		direction: 'outbound',
		title: 'Quote requests (leads)',
		href: '/flows/quote-requests/',
		summary:
			'Danaher Life Sciences sells nothing directly: shoppers request quotes, which go as leads to the central Marketing Cloud, and from there to each product’s OpCo.',
		carries: ['Quote requests', 'Requested products'],
		master: { node: 'intershop', confirmed: true },
		routes: [
			{
				label: 'Danaher Life Sciences',
				opcos: ['danaher-life-sciences'],
				hops: [
					hop('storefront', 'intershop', {
						via: 'direct',
						mechanism: 'api',
						sync: true,
						frequency: 'On quote request',
						note: 'The shopper adds products to an eRFQ quote cart and submits it, signed in or not, through the eRFQ API extended for anonymous quote requests.',
					}),
					hop('intershop', 'sfmc', {
						via: 'direct',
						mechanism: 'api',
						note: 'Intershop sends each quote request to the central Salesforce Marketing Cloud as a lead through its REST API, with comments that identify the products’ OpCos.',
					}),
					hop('sfmc', 'opco-crm', {
						note: 'Marketing Cloud’s integration with each OpCo routes the lead, based on the comments sent with it. A request covering several OpCos is split, so each OpCo gets its own lead for its own products.',
					}),
				],
			},
		],
		openQuestions: [
			'What contact details must a shopper give, and how does the OpCo’s answer reach them?',
			'Do the other OpCos’ storefronts send quote requests to their CRMs the same way?',
		],
	},
	{
		id: 'sign-in',
		direction: 'identity',
		title: 'Sign-in and registration',
		href: '/flows/sign-in/',
		summary:
			'One set of Auth0 Universal Login pages for every OpCo; OpCo-specific answers travel back in the ID token, and Intershop creates the user and customer.',
		carries: [
			'User profiles',
			'ID tokens',
			'OpCo-specific registration answers (app metadata)',
		],
		master: { node: 'auth0', confirmed: true },
		routes: [
			{
				label: 'Every OpCo',
				opcos: allCentral,
				hops: [
					hop('storefront', 'auth0', {
						via: 'direct',
						mechanism: 'api',
						sync: true,
						frequency: 'On sign-in or registration',
						note: 'Edge Delivery Services pages and traditional AEM send the customer to Auth0’s Universal Login: common sign-in and registration pages with Danaher login wording, branded with the OpCo’s primary branding. Custom forms and triggers, where an OpCo has them, collect its own questions and store the answers in the user’s app metadata. The ID token comes back to the storefront with those answers.',
					}),
					hop('storefront', 'intershop', {
						via: 'direct',
						mechanism: 'api',
						sync: true,
						frequency: 'On sign-in or registration',
						note: 'Intershop’s custom token handler takes the Auth0 token and creates the user and customer in the same step, from the details in the token.',
					}),
				],
			},
			{
				label: 'Phenomenex',
				opcos: phxOnly,
				hops: [
					hop('auth0', 'azure-b2c', {
						via: 'direct',
						mechanism: 'api',
						sync: true,
						frequency: 'First sign-in only',
						note: 'Just-in-time migration: a custom database script checks the password of a user not yet in Auth0 against the legacy Azure AD B2C tenant, then saves the profile and password in Auth0, so later sign-ins stay in Auth0. The migration is planned to complete by the end of Q3 2027; the profiles left after that are to be migrated without passwords, and those users asked to set one on their first sign-in.',
					}),
					hop('intershop', 'phx-web-api', {
						via: 'direct',
						mechanism: 'api',
						sync: true,
						frequency: 'On sign-in or registration',
						note: 'The token handler gets the web user ID from the Web API and stores it in Intershop.',
					}),
					hop('phx-web-api', 'webdb', {
						via: 'direct',
						note: 'The Web API reads the industry the customer chose from the ID token and stores it in WebDB.',
					}),
				],
			},
			{
				label: 'SCIEX',
				opcos: sciexOnly,
				hops: [
					hop('auth0', 'crm', {
						via: 'direct',
						mechanism: 'api',
						note: 'An Auth0 Forms flow posts the user to SCIEX’s own Salesforce org, with flags for access to the Absorb learning portal and the Innovation Advisory Panel (IAP), SCIEX’s community network.',
					}),
					hop('storefront', 'sciex-website-db', {
						via: 'direct',
						note: 'The SCIEX website’s AEM backend reads the answers — industry, Absorb access, IAP — from the ID token and stores them in its database.',
					}),
				],
			},
			{
				label: 'Leica Microsystems',
				opcos: ['leica-microsystems'],
				hops: [
					hop('auth0', 'onelogin', {
						via: 'direct',
						sync: true,
						frequency: 'On partner sign-in',
						note: 'An enterprise connection lets Leica Microsystems partners sign in with their OneLogin profiles. A form then asks them to set an Auth0 password, so they can also sign in to Auth0 directly.',
					}),
				],
			},
		],
		variations: {
			phenomenex: 'Asks for industry. Users still in Azure AD B2C are migrated on first sign-in until the end of Q3 2027; after that, the rest move without passwords and set one on first sign-in.',
			sciex: 'Asks for industry, Absorb learning portal access, and Innovation Advisory Panel (IAP) access; posts the user to Salesforce. Users were bulk-migrated from Keycloak, hashed passwords included.',
			'leica-microsystems': 'No custom forms. Partners can sign in with OneLogin.',
			'danaher-life-sciences': 'No custom forms.',
		},
		openQuestions: [
			'Which details from the ID token does the token handler use for the user and customer, and how does it match a returning user to an existing Intershop customer?',
		],
	},
];

export function getFlow(id: DataFlow['id']): DataFlow {
	const flow = dataFlows.find((f) => f.id === id);
	if (!flow) throw new Error(`Unknown data flow "${id}"`);
	return flow;
}

/** The central-instance OpCos a flow is documented for. */
export function documentedOpcos(flow: DataFlow): string[] {
	return [...new Set(flow.routes.flatMap((r) => r.opcos))];
}
