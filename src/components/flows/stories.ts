import { getFlow, type DataFlow, type NodeId } from '@/data/integrations';

/**
 * Presentation for the scroll-driven flow stories: where each node sits in
 * the diagram, how the curves run, and how hops group into numbered steps.
 * Facts (systems, vias, schedules, notes) are NOT here — they're read from
 * `integrations.ts` so the story and the hop table can't disagree.
 *
 * Coordinates are in a 400-wide viewBox; `height` sets its aspect ratio.
 */

export type StoryIcon = 'erp' | 'crm' | 'staging' | 'sftp' | 'pim' | 'commerce' | 'search' | 'order' | 'team';

export interface StoryNode {
	key: string;
	/** Which flow node it stands for. */
	node: NodeId;
	/** Pin a per-OpCo node (ERP, CRM) to one OpCo; its label then names that OpCo's system. */
	opco?: string;
	icon: StoryIcon;
	x: number;
	y: number;
	/** Where the label sits relative to the circle. */
	label?: 'below' | 'left' | 'right';
	/** An OpCo this flow isn't documented for: drawn dashed, never lit, no curves. */
	ghost?: boolean;
}

export interface StoryEdge {
	key: string;
	/** The hop this curve draws, looked up in the flow's routes. */
	hop: { from: NodeId; to: NodeId };
	/** SVG path in viewBox coordinates. */
	d: string;
	/** Optional label position on the curve. */
	labelAt?: { x: number; y: number };
}

export interface StoryStep {
	title: string;
	body: string;
	/** Nodes this step lights up. */
	nodes: string[];
	/** Curves this step draws. */
	edges: string[];
	/**
	 * Which facts to list under the step: each OpCo's source system (its ERP
	 * or CRM), or the hops the step draws.
	 */
	facts: { source: 'erp' | 'crm' } | 'hops';
}

export interface FlowStoryLayout {
	flow: DataFlow['id'];
	height: number;
	nodes: StoryNode[];
	edges: StoryEdge[];
	steps: StoryStep[];
}

const R = 22; // node radius, so curves start and end on the circle edge

const erpX = { 'danaher-life-sciences': 62, sciex: 154, phenomenex: 246, 'leica-microsystems': 338 };
const erpY = 56;
const sftp = { x: 200, y: 210 };
const inriver = { x: 200, y: 360 };
const intershop = { x: 112, y: 530 };
const coveo = { x: 288, y: 530 };

/** Smooth S-curve from `(x1, a)` down to `(x2, b)`. */
const curve = (x1: number, a: number, x2: number, b: number) => {
	const mid = (a + b) / 2;
	return `M${x1},${a} C${x1},${mid} ${x2},${mid} ${x2},${b}`;
};

/** From the bottom of one circle to the top of another. */
const drop = (x1: number, y1: number, x2: number, y2: number) => curve(x1, y1 + R, x2, y2 - R);

/** Below-circle labels take this much room, so curves leaving them start underneath. */
const LABEL = 28;

/** OpCos the product route is documented for; the rest are ghosts. */
const productOpcos = getFlow('product-data').routes[0].opcos;
const productErps = Object.entries(erpX).filter(([opco]) => productOpcos.includes(opco));

export const productDataStory: FlowStoryLayout = {
	flow: 'product-data',
	height: 610,
	nodes: [
		...Object.entries(erpX).map(([opco, x]) => ({
			key: `erp-${opco}`,
			node: 'erp' as const,
			opco,
			icon: 'erp' as const,
			x,
			y: erpY,
			ghost: !productOpcos.includes(opco),
		})),
		{ key: 'sftp', node: 'sftp', icon: 'sftp', ...sftp, label: 'right' },
		{ key: 'inriver', node: 'inriver', icon: 'pim', ...inriver, label: 'right' },
		{ key: 'intershop', node: 'intershop', icon: 'commerce', ...intershop },
		{ key: 'coveo', node: 'coveo', icon: 'search', ...coveo },
	],
	edges: [
		...productErps.map(([opco, x]) => ({
			key: `erp-${opco}-sftp`,
			hop: { from: 'erp', to: 'sftp' },
			d: curve(x, erpY + R + LABEL, sftp.x, sftp.y - R),
		})),
		{
			key: 'sftp-inriver',
			hop: { from: 'sftp', to: 'inriver' },
			d: drop(sftp.x, sftp.y, inriver.x, inriver.y),
			labelAt: { x: 200, y: 285 },
		},
		{
			key: 'inriver-intershop',
			hop: { from: 'inriver', to: 'intershop' },
			d: drop(inriver.x, inriver.y, intershop.x, intershop.y),
			labelAt: { x: 132, y: 440 },
		},
		{
			key: 'inriver-coveo',
			hop: { from: 'inriver', to: 'coveo' },
			d: drop(inriver.x, inriver.y, coveo.x, coveo.y),
			labelAt: { x: 268, y: 440 },
		},
		{
			key: 'erp-intershop-planned',
			hop: { from: 'erp', to: 'intershop' },
			// Down the left margin, clear of the live route, into Intershop's side.
			d: `M${erpX['danaher-life-sciences'] - R},${erpY} C8,${erpY} 8,${intershop.y} ${intershop.x - R},${intershop.y}`,
			labelAt: { x: 24, y: 300 },
		},
	],
	steps: [
		{
			title: 'Created in each OpCo’s ERP',
			body: 'SKUs, titles, and list prices start life in the operating company’s own ERP — a different system for each. Danaher Life Sciences has no ERP yet, so where its products start is not documented.',
			nodes: productErps.map(([opco]) => `erp-${opco}`),
			edges: [],
			facts: { source: 'erp' },
		},
		{
			title: 'Dropped on the SFTP server',
			body: 'Each ERP exports its product data as files to the Danaher Life Sciences SFTP server, the common landing point.',
			nodes: ['sftp'],
			edges: productErps.map(([opco]) => `erp-${opco}-sftp`),
			facts: 'hops',
		},
		{
			title: 'Enriched in inRiver',
			body: 'Boomi carries the files into inRiver, the central PIM, where descriptions, images, and attributes are added.',
			nodes: ['inriver'],
			edges: ['sftp-inriver'],
			facts: 'hops',
		},
		{
			title: 'Published to Intershop and Coveo',
			body: 'inRiver publishes the enriched product — list prices included — to Intershop for the storefront, and to Coveo for search and recommendations.',
			nodes: ['intershop', 'coveo'],
			edges: ['inriver-intershop', 'inriver-coveo'],
			facts: 'hops',
		},
		{
			title: 'Planned: list prices leave inRiver',
			body: 'List prices are to stop passing through inRiver. Where they will come from instead, and when, is not yet documented.',
			nodes: ['intershop'],
			edges: ['erp-intershop-planned'],
			facts: 'hops',
		},
	],
};

// ---------------------------------------------------------------------------
// The WebDB route: ERP or CRM → WebDB → SFTP → Intershop, documented for PHX
// ---------------------------------------------------------------------------

interface StepCopy {
	title: string;
	body: string;
}

interface WebdbRouteCopy {
	/** Step 1: where the data starts. */
	source: StepCopy;
	/** The ERP → CRM step, for routes that pass through the CRM. */
	toCrm?: StepCopy;
	/** The WebDB → SFTP step, when it differs from the generic one. */
	toSftp?: StepCopy;
	/** The last step: loaded into Intershop. */
	load: StepCopy;
}

/**
 * Build a story for a flow on the shared WebDB route. The top row shows every
 * central-instance OpCo; those the flow isn't documented for are ghosts, so
 * the gap stays visible in the picture. `throughCrm` inserts the ERP → CRM leg.
 */
function webdbRouteStory(
	flow: DataFlow['id'],
	start: 'erp' | 'crm',
	documentedFor: string,
	copy: WebdbRouteCopy,
	{ throughCrm = false } = {}
): FlowStoryLayout {
	const chain: { node: NodeId; icon: StoryIcon }[] = [
		...(throughCrm ? [{ node: 'crm', icon: 'crm' as const }] : []),
		{ node: 'webdb', icon: 'staging' },
		{ node: 'sftp', icon: 'sftp' },
		{ node: 'intershop', icon: 'commerce' },
	];
	const top = erpY;
	const first = 240; // y of the first node under the source row
	const gap = 125;
	const ys = chain.map((_, i) => first + i * gap);
	const sourceX = erpX[documentedFor as keyof typeof erpX];
	const sourceIcon: StoryIcon = start === 'erp' ? 'erp' : 'crm';

	const nodes: StoryNode[] = [
		...Object.entries(erpX).map(([opco, x]) => ({
			key: `source-${opco}`,
			node: start,
			opco,
			icon: sourceIcon,
			x,
			y: top,
			ghost: opco !== documentedFor,
		})),
		...chain.map((c, i) => ({
			key: c.node,
			node: c.node,
			icon: c.icon,
			x: 200,
			y: ys[i],
			label: c.node === 'intershop' ? ('below' as const) : ('right' as const),
		})),
	];

	const edges: StoryEdge[] = chain.map((c, i) => {
		const from = i === 0 ? start : chain[i - 1].node;
		const d =
			i === 0
				? curve(sourceX, top + R + LABEL, 200, ys[0] - R)
				: drop(200, ys[i - 1], 200, ys[i]);
		// Label only the hops that have something to say: a carrier or a doubt.
		const labelled = (from === 'erp' && c.node === 'crm') || c.node === 'intershop';
		return {
			key: `${from}-${c.node}`,
			hop: { from, to: c.node },
			d,
			labelAt: labelled ? { x: i === 0 ? (sourceX + 200) / 2 : 200, y: ((i === 0 ? top : ys[i - 1]) + ys[i]) / 2 + (i === 0 ? 14 : 0) } : undefined,
		};
	});

	const edgeInto = (node: NodeId) => edges.find((e) => e.hop.to === node)!.key;
	const feeder = throughCrm || start === 'crm' ? 'CRM' : 'ERP';
	const generic: Partial<Record<string, StepCopy>> = {
		webdb: {
			title: 'Staged in WebDB',
			body: `WebDB, Phenomenex’s staging database, collects the data from the ${feeder} before it is sent on.`,
		},
		sftp: copy.toSftp ?? {
			title: 'Dropped on the SFTP server',
			body: 'WebDB exports it as files to the Danaher Life Sciences SFTP server — the same landing point the product feed uses.',
		},
	};

	const steps: StoryStep[] = [
		{ ...copy.source, nodes: [`source-${documentedFor}`], edges: [], facts: { source: start } },
		...chain.map((c) => {
			const text = c.node === 'crm' ? copy.toCrm : c.node === 'intershop' ? copy.load : generic[c.node];
			if (!text) throw new Error(`No copy for the ${c.node} step of "${flow}"`);
			return { ...text, nodes: [c.node], edges: [edgeInto(c.node)], facts: 'hops' as const };
		}),
	];

	return { flow, height: ys.at(-1)! + 70, nodes, edges, steps };
}

// ---------------------------------------------------------------------------
// Orders, documented for PHX: simulated at checkout, then through the ERP
// ---------------------------------------------------------------------------

const ord = {
	intershop: { x: 150, y: 60 },
	erp: { x: 310, y: 60 },
	preorder: { x: 150, y: 250 },
	booking: { x: 310, y: 350 },
	sales: { x: 150, y: 480 },
};

export const ordersStory: FlowStoryLayout = {
	flow: 'orders',
	height: 550,
	nodes: [
		{ key: 'intershop', node: 'intershop', icon: 'commerce', ...ord.intershop, label: 'left' },
		{ key: 'erp', node: 'erp', icon: 'erp', ...ord.erp },
		{ key: 'preorder', node: 'preorder', icon: 'staging', ...ord.preorder, label: 'left' },
		{ key: 'order-booking', node: 'order-booking', icon: 'team', ...ord.booking },
		{ key: 'sales-order', node: 'sales-order', icon: 'order', ...ord.sales, label: 'left' },
	],
	edges: [
		{
			key: 'intershop-erp',
			hop: { from: 'intershop', to: 'erp' },
			d: `M${ord.intershop.x + R},${ord.intershop.y} L${ord.erp.x - R},${ord.erp.y}`,
			labelAt: { x: 230, y: 16 },
		},
		{
			key: 'intershop-preorder',
			hop: { from: 'intershop', to: 'preorder' },
			d: drop(ord.intershop.x, ord.intershop.y, ord.preorder.x, ord.preorder.y),
			labelAt: { x: 150, y: 155 },
		},
		{
			key: 'preorder-sales-order',
			hop: { from: 'preorder', to: 'sales-order' },
			d: drop(ord.preorder.x, ord.preorder.y, ord.sales.x, ord.sales.y),
			labelAt: { x: 150, y: 365 },
		},
		{
			key: 'preorder-order-booking',
			hop: { from: 'preorder', to: 'order-booking' },
			// Out of the pre-order table's side, down into the team.
			d: `M${ord.preorder.x + R},${ord.preorder.y} C${ord.booking.x},${ord.preorder.y} ${ord.booking.x},${ord.preorder.y} ${ord.booking.x},${ord.booking.y - R}`,
		},
		{
			key: 'order-booking-sales-order',
			hop: { from: 'order-booking', to: 'sales-order' },
			// From under the team's label, back into the sales order's side.
			d: `M${ord.booking.x},${ord.booking.y + R + LABEL} C${ord.booking.x},${ord.sales.y} ${ord.booking.x},${ord.sales.y} ${ord.sales.x + R},${ord.sales.y}`,
			labelAt: { x: 240, y: 478 },
		},
	],
	steps: [
		{
			title: 'Checked against the ERP at checkout',
			body: 'During checkout, Intershop calls Phenomenex’s ERP — Order Simulate — and gets back tax, shipping, and an estimated delivery date. If the customer’s account has a block in the ERP, they can’t place the order.',
			nodes: ['intershop', 'erp'],
			edges: ['intershop-erp'],
			facts: 'hops',
		},
		{
			title: 'Created in the pre-order table',
			body: 'When the customer places the order, Intershop creates it directly in the ERP — no Boomi, no files. It lands in a pre-order table.',
			nodes: ['preorder'],
			edges: ['intershop-preorder'],
			facts: 'hops',
		},
		{
			title: 'Converted to a sales order',
			body: 'A batch job in the ERP converts pre-orders into sales orders, which the ERP then fulfils.',
			nodes: ['sales-order'],
			edges: ['preorder-sales-order'],
			facts: 'hops',
		},
		{
			title: 'Or flagged for the order booking team',
			body: 'If information is missing — for example, the customer is new and not yet in the ERP — the order is flagged in the ERP for the order booking team to resolve by hand.',
			nodes: ['order-booking'],
			edges: ['preorder-order-booking'],
			facts: 'hops',
		},
		{
			title: 'Resolved, then processed',
			body: 'Once the team has resolved it, the order goes on to become a sales order. This leg is recorded as described, not yet confirmed.',
			nodes: ['sales-order'],
			edges: ['order-booking-sales-order'],
			facts: 'hops',
		},
	],
};

export const flowStories: Partial<Record<DataFlow['id'], FlowStoryLayout>> = {
	'product-data': productDataStory,
	orders: ordersStory,
	'customer-data': webdbRouteStory(
		'customer-data',
		'erp',
		'phenomenex',
		{
			source: {
				title: 'Starts in the ERP',
				body: 'The documented route begins in Phenomenex’s ERP — although customers are said to be created in the CRM. Which of the two masters them is not yet confirmed.',
			},
			toCrm: {
				title: 'Passed to the CRM',
				body: 'Customer profiles, contacts, and addresses move from the ERP to the CRM. This leg is recorded as described, not yet confirmed.',
			},
			load: {
				title: 'Loaded into Intershop',
				body: 'Boomi picks up the files and loads customer profiles, contacts, and addresses into Intershop.',
			},
		},
		{ throughCrm: true }
	),
	'customer-pricing': webdbRouteStory('customer-pricing', 'erp', 'phenomenex', {
		source: {
			title: 'Agreed in the ERP',
			body: 'Customer-specific pricing agreements are created in Phenomenex’s ERP.',
		},
		toSftp: {
			title: 'Pushed to the SFTP server',
			body: 'A scheduled job — one per data type — exports the prices from WebDB as files to the Danaher Life Sciences SFTP server.',
		},
		load: {
			title: 'Loaded into Intershop',
			body: 'Boomi picks up the files and loads each customer’s negotiated prices into Intershop.',
		},
	}),
	quotes: webdbRouteStory('quotes', 'erp', 'phenomenex', {
		source: {
			title: 'Created in the ERP',
			body: 'Quotes — their details, quoted prices, and the customer — are created in Phenomenex’s ERP.',
		},
		toSftp: {
			title: 'Pushed to the SFTP server',
			body: 'A scheduled job — one per data type — exports the quotes from WebDB as files to the Danaher Life Sciences SFTP server.',
		},
		load: {
			title: 'Loaded into Intershop',
			body: 'Boomi picks up the files and loads the quotes into Intershop for use in the storefront.',
		},
	}),
	'customer-segments': webdbRouteStory('customer-segments', 'crm', 'phenomenex', {
		source: {
			title: 'Maintained in the CRM',
			body: 'Market lists group customers by demographics, purchase history, and behaviour. They are maintained in Phenomenex’s CRM.',
		},
		load: {
			title: 'Loaded into Intershop',
			body: 'Boomi picks up the files and loads segment membership into Intershop for use in the storefront.',
		},
	}),
};
