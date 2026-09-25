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
	const system = integrationSystems.find((s) => s.id === id);
	if (!system) throw new Error(`Unknown integration system "${id}"`);
	return { title: system.name, system: system.role, perOpco: false };
}

// ---------------------------------------------------------------------------
// Flows
// ---------------------------------------------------------------------------

export interface Hop {
	from: NodeId;
	to: NodeId;
	/** `boomi` = carried by a Boomi process; `direct` = no middleware; `null` = not documented. */
	via: 'boomi' | 'direct' | null;
	/** How data moves on this hop. */
	mechanism: 'file' | 'api' | null;
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
	id: 'product-data' | 'customer-data' | 'customer-pricing' | 'quotes' | 'customer-segments';
	title: string;
	href: string;
	summary: string;
	/** What the data contains. */
	carries: string[];
	/** Where the data is created and owned. */
	master: { node: NodeId; confirmed: boolean };
	routes: Route[];
	/**
	 * How each central-instance OpCo's route differs from the one documented.
	 * Only set for flows documented as common; `null` = not documented.
	 */
	variations?: Record<string, string | null>;
	openQuestions: string[];
}

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
		title: 'Customer segments',
		href: '/flows/customer-segments/',
		summary: 'Market lists from the CRM, used to target customers in Intershop.',
		carries: ['Segment membership (demographics, purchase history, behaviour)'],
		master: { node: 'crm', confirmed: true },
		routes: [{ label: 'Phenomenex', opcos: phxOnly, hops: viaWebdb(['crm']) }],
		openQuestions: [],
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
