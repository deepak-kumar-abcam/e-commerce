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

/** Everything a flow step can name besides an OpCo's own ERP or CRM. */
const flowNodes = [...integrationSystems, ...erpStages, ...paymentProviders, ...lmsTeams];

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
	id: 'product-data' | 'customer-data' | 'customer-pricing' | 'quotes' | 'customer-segments' | 'orders' | 'payments';
	/** `inbound` = into Intershop from the systems that own the data; `outbound` = from Intershop. */
	direction: 'inbound' | 'outbound';
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
 * `unconfirmedErpHop` flags an ERP → CRM leg where the notes contradict
 * themselves or haven't been checked; `scheduled` marks WebDB's per-data-type
 * scheduled export.
 */
const viaWebdb = (start: NodeId[], { unconfirmedErpHop = false, scheduled = false } = {}): Hop[] => {
	const chain: NodeId[] = [...start, 'webdb'];
	return [
		...chain
			.slice(1)
			.map((to, i) => hop(chain[i], to, chain[i] === 'erp' && unconfirmedErpHop ? { unconfirmed: true } : {})),
		scheduled
			? hop('webdb', 'sftp', { mechanism: 'file', note: 'Pushed by a scheduled job, one per data type.' })
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
		variations: Object.fromEntries(allCentral.map((id) => [id, null])),
		openQuestions: [
			'Danaher Life Sciences has no ERP yet (no legal entity). Where do its products originate?',
			'Does inRiver feed AEM? The platform evaluation says the PIM feeds AEM as well as Intershop; the integration notes mention only Intershop and Coveo.',
			'Where will list prices come from once they leave inRiver, and when?',
		],
	},
	{
		id: 'customer-data',
		direction: 'inbound',
		title: 'Customer data',
		href: '/flows/customer-data/',
		summary: 'Customer accounts, contacts, and addresses, from the CRM into Intershop.',
		carries: ['Customer profiles', 'Contacts', 'Addresses'],
		master: { node: 'crm', confirmed: false },
		routes: [
			{ label: 'Phenomenex', opcos: phxOnly, hops: viaWebdb(['erp', 'crm'], { unconfirmedErpHop: true }) },
		],
		openQuestions: [
			'Which system masters customer data? The integration notes say customers are created in the CRM, but the route they give starts in the ERP.',
		],
	},
	{
		id: 'customer-pricing',
		direction: 'inbound',
		title: 'Customer-specific pricing',
		href: '/flows/customer-pricing/',
		summary: 'Negotiated prices per customer, from the ERP into Intershop.',
		carries: ['Customer-specific pricing agreements'],
		master: { node: 'erp', confirmed: true },
		routes: [{ label: 'Phenomenex', opcos: phxOnly, hops: viaWebdb(['erp'], { scheduled: true }) }],
		openQuestions: [
			'How do customer-specific prices reach Intershop from the SCIEX (Oracle) and Leica Microsystems (SAP) ERPs?',
			'How often does WebDB’s scheduled job run, and what file format does it write?',
		],
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
		openQuestions: [
			'How do quotes reach Intershop from the SCIEX (Oracle) and Leica Microsystems (SAP) ERPs?',
			'How often does WebDB’s scheduled job run, and what file format does it write?',
		],
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
			'Checked against the ERP during checkout, then created directly in it and converted to a sales order.',
		carries: [
			'Orders',
			'Tax, shipping, and estimated delivery date (from Order Simulate)',
			'Account blocks (from Order Simulate)',
		],
		master: { node: 'intershop', confirmed: true },
		notApplicable: { 'danaher-life-sciences': 'No direct transactions' },
		routes: [
			{
				label: 'Phenomenex',
				opcos: phxOnly,
				hops: [
					hop('intershop', 'erp', {
						via: 'direct',
						mechanism: 'api',
						sync: true,
						frequency: 'During checkout',
						note: 'Order Simulate: returns tax, shipping, and an estimated delivery date, and stops the order if the account has a block in the ERP.',
					}),
					hop('intershop', 'preorder', {
						via: 'direct',
						mechanism: 'api',
						frequency: 'Real-time, on submit',
						note: 'Intershop creates the order directly in the ERP.',
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
		],
		openQuestions: [
			'When is Order Simulate called: on entering checkout, on each address or shipping change, or at final review?',
			'If Order Simulate fails or times out, can the customer still place the order?',
			'Which kinds of ERP block stop an order, and what does the customer see?',
			'Is the ERP’s tax final on the order? Is shipping a cost, a choice of options, or both? Is the delivery date per order or per line?',
			'Does the ERP return anything when the order is created, such as an order number, and how are failed calls retried?',
			'How often does the batch job run?',
			'Besides a new customer, what flags an order for manual intervention?',
			'Do order status, shipment, or invoice updates flow back to Intershop, and is the customer told when an order is held?',
			'How do Leica Microsystems (SAP) orders reach the ERP? SCIEX orders go to Oracle through its REST order-create API (see Payments); the rest of that route is not documented.',
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
		notApplicable: { 'danaher-life-sciences': 'No direct transactions' },
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
						note: 'The order lands in the customer service team’s queue. How it gets there is not documented.',
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
						note: 'The checkout page renders Cybersource’s card fields in an iframe with the Microform library. Cybersource checks the card and returns a short-lived token with the masked card details. Cards are offered in the US and Canada only.',
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
			'Where does an uploaded purchase order document go when a customer pays by invoice?',
			'Is the Cybersource integration also built by the platform team?',
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
