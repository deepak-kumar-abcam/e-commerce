import type { DataFlow, NodeId } from '@/data/integrations';

/**
 * Presentation for the scroll-driven flow stories: where each node sits in
 * the diagram, how the curves run, and how hops group into numbered steps.
 * Facts (systems, vias, schedules, notes) are NOT here — they're read from
 * `integrations.ts` so the story and the hop table can't disagree.
 *
 * Coordinates are in a 400-wide viewBox; `height` sets its aspect ratio.
 */

export type StoryIcon = 'erp' | 'crm' | 'staging' | 'sftp' | 'pim' | 'commerce' | 'search';

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
		})),
		{ key: 'sftp', node: 'sftp', icon: 'sftp', ...sftp, label: 'right' },
		{ key: 'inriver', node: 'inriver', icon: 'pim', ...inriver, label: 'right' },
		{ key: 'intershop', node: 'intershop', icon: 'commerce', ...intershop },
		{ key: 'coveo', node: 'coveo', icon: 'search', ...coveo },
	],
	edges: [
		...Object.entries(erpX).map(([opco, x]) => ({
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
			body: 'SKUs, titles, and list prices start life in the operating company’s own ERP — a different system for each.',
			nodes: Object.keys(erpX).map((opco) => `erp-${opco}`),
			edges: [],
			facts: { source: 'erp' },
		},
		{
			title: 'Dropped on the SFTP server',
			body: 'Each ERP exports its product data as files to the Danaher Life Sciences SFTP server, the common landing point.',
			nodes: ['sftp'],
			edges: Object.keys(erpX).map((opco) => `erp-${opco}-sftp`),
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
// The CRM route: ERP or CRM → WebDB → SFTP → Intershop, documented for PHX
// ---------------------------------------------------------------------------

interface StepCopy {
	title: string;
	body: string;
}

interface CrmRouteCopy {
	/** Step 1: where the data starts. */
	source: StepCopy;
	/** The ERP → CRM step, for routes that start in the ERP. */
	toCrm?: StepCopy;
	/** The last step: loaded into Intershop. */
	load: StepCopy;
}

/**
 * Build a story for a flow on the shared CRM route. The top row shows every
 * central-instance OpCo; those the flow isn't documented for are ghosts, so
 * the gap stays visible in the picture.
 */
function crmRouteStory(
	flow: DataFlow['id'],
	start: 'erp' | 'crm',
	documentedFor: string,
	copy: CrmRouteCopy
): FlowStoryLayout {
	const chain: { node: NodeId; icon: StoryIcon }[] = [
		...(start === 'erp' ? [{ node: 'crm', icon: 'crm' as const }] : []),
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
	const generic: Partial<Record<string, StepCopy>> = {
		webdb: {
			title: 'Staged in WebDB',
			body: 'WebDB, Phenomenex’s staging database, collects the data from the CRM before it is sent on.',
		},
		sftp: {
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

export const flowStories: Partial<Record<DataFlow['id'], FlowStoryLayout>> = {
	'product-data': productDataStory,
	'customer-data': crmRouteStory('customer-data', 'erp', 'phenomenex', {
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
	}),
	'customer-pricing': crmRouteStory('customer-pricing', 'erp', 'phenomenex', {
		source: {
			title: 'Agreed in the ERP',
			body: 'Customer-specific pricing agreements are created in Phenomenex’s ERP.',
		},
		toCrm: {
			title: 'Passed to the CRM',
			body: 'The integration notes route pricing through the CRM, the same path as customer data. Whether it really goes that way is not yet confirmed.',
		},
		load: {
			title: 'Loaded into Intershop',
			body: 'Boomi picks up the files and loads each customer’s negotiated prices into Intershop.',
		},
	}),
	quotes: crmRouteStory('quotes', 'crm', 'phenomenex', {
		source: {
			title: 'Raised in the CRM',
			body: 'Quotes — their details, quoted prices, and the customer — are created in Phenomenex’s CRM.',
		},
		load: {
			title: 'Loaded into Intershop',
			body: 'Boomi picks up the files and loads the quotes into Intershop for use in the storefront.',
		},
	}),
	'customer-segments': crmRouteStory('customer-segments', 'crm', 'phenomenex', {
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
