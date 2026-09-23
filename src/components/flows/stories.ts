import type { DataFlow, NodeId } from '@/data/integrations';

/**
 * Presentation for the scroll-driven flow stories: where each node sits in
 * the diagram, how the curves run, and how hops group into numbered steps.
 * Facts (systems, vias, schedules, notes) are NOT here — they're read from
 * `integrations.ts` so the story and the hop table can't disagree.
 *
 * Coordinates are in a 400-wide viewBox; `height` sets its aspect ratio.
 */

export type StoryIcon = 'erp' | 'sftp' | 'pim' | 'commerce' | 'search';

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
	/** Which facts to list under the step. */
	facts: 'erp-per-opco' | 'hops';
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
const LABEL = 18;

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
			facts: 'erp-per-opco',
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

export const flowStories: Partial<Record<DataFlow['id'], FlowStoryLayout>> = {
	'product-data': productDataStory,
};
