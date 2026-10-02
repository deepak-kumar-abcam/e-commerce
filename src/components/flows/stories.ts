import { documentedOpcos, getFlow, type DataFlow, type NodeId } from '@/data/integrations';

/**
 * Presentation for the scroll-driven flow stories: where each node sits in
 * the diagram, how the curves run, and how hops group into numbered steps.
 * Facts (systems, vias, schedules, notes) are NOT here — they're read from
 * `integrations.ts` so the story and the hop table can't disagree.
 *
 * Coordinates are in a 400-wide viewBox; `height` sets its aspect ratio.
 */

export type StoryIcon =
	| 'erp'
	| 'crm'
	| 'staging'
	| 'sftp'
	| 'pim'
	| 'commerce'
	| 'search'
	| 'order'
	| 'team'
	| 'payment'
	| 'storefront'
	| 'identity'
	| 'api';

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
	/**
	 * Shorter text where the full name or role would collide with a neighbour;
	 * the full text stays in the tooltip.
	 */
	short?: { title?: string; system?: string };
}

export interface StoryEdge {
	key: string;
	/** The hop this curve draws, looked up in the flow's routes; `key` when two hops share ends. */
	hop: { from: NodeId; to: NodeId; key?: string };
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
			body: 'SKUs, titles, and list prices start life in the operating company’s own ERP — a different system for each. Danaher Life Sciences has no ERP: it is a common marketplace for the other OpCos’ products.',
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
			body: 'inRiver publishes the enriched product — list prices included — to Intershop for transactional data, and to Coveo, where AEM pages get their product content. Each product goes to its own OpCo’s channel and to Danaher Life Sciences’.',
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
// Customer pricing: SCIEX straight from Oracle, PHX through WebDB
// ---------------------------------------------------------------------------

const price = {
	webdb: { x: erpX.phenomenex, y: 210 },
	sftp: { x: 200, y: 360 },
	intershop: { x: 200, y: 500 },
};
const pricingOpcos = documentedOpcos(getFlow('customer-pricing'));

export const customerPricingStory: FlowStoryLayout = {
	flow: 'customer-pricing',
	height: 570,
	nodes: [
		...Object.entries(erpX).map(([opco, x]) => ({
			key: `source-${opco}`,
			node: 'erp' as const,
			opco,
			icon: 'erp' as const,
			x,
			y: erpY,
			ghost: !pricingOpcos.includes(opco),
		})),
		{ key: 'webdb', node: 'webdb', icon: 'staging', ...price.webdb, label: 'right' },
		{ key: 'sftp', node: 'sftp', icon: 'sftp', ...price.sftp, label: 'right' },
		{ key: 'intershop', node: 'intershop', icon: 'commerce', ...price.intershop },
	],
	edges: [
		{
			key: 'erp-webdb',
			hop: { from: 'erp', to: 'webdb' },
			d: curve(erpX.phenomenex, erpY + R + LABEL, price.webdb.x, price.webdb.y - R),
		},
		{
			key: 'erp-sftp',
			hop: { from: 'erp', to: 'sftp' },
			d: curve(erpX.sciex, erpY + R + LABEL, price.sftp.x - 8, price.sftp.y - R),
			labelAt: { x: 168, y: 210 },
		},
		{
			key: 'webdb-sftp',
			hop: { from: 'webdb', to: 'sftp' },
			d: curve(price.webdb.x, price.webdb.y + R, price.sftp.x + 8, price.sftp.y - R),
		},
		{
			key: 'sftp-intershop',
			hop: { from: 'sftp', to: 'intershop' },
			d: drop(price.sftp.x, price.sftp.y, price.intershop.x, price.intershop.y),
			labelAt: { x: 200, y: 430 },
		},
	],
	steps: [
		{
			title: 'Agreed in the ERP',
			body: 'Customer-specific pricing agreements are created in the OpCo’s ERP: Oracle for SCIEX, the ERP for Phenomenex.',
			nodes: ['source-sciex', 'source-phenomenex'],
			edges: [],
			facts: { source: 'erp' },
		},
		{
			title: 'Staged in WebDB for Phenomenex',
			body: 'Phenomenex’s prices are collected first in WebDB, its staging database.',
			nodes: ['webdb'],
			edges: ['erp-webdb'],
			facts: 'hops',
		},
		{
			title: 'Pushed to the SFTP server',
			body: 'Scheduled jobs export the prices as files to the Danaher Life Sciences SFTP server: one per data type in WebDB, and one in Oracle, which publishes over SSH.',
			nodes: ['sftp'],
			edges: ['erp-sftp', 'webdb-sftp'],
			facts: 'hops',
		},
		{
			title: 'Loaded into Intershop',
			body: 'Boomi picks up the files and loads each customer’s negotiated prices into Intershop.',
			nodes: ['intershop'],
			edges: ['sftp-intershop'],
			facts: 'hops',
		},
	],
};

// ---------------------------------------------------------------------------
// Sign-in: Auth0 for every OpCo, with each OpCo's own additions
// ---------------------------------------------------------------------------

/** Every sign-in node has a two-line label, so curves leaving one start further down. */
const LABEL2 = 62;

const sign = {
	storefront: { x: 200, y: 50 },
	sciexDb: { x: 350, y: 50 },
	b2c: { x: 50, y: 220 },
	auth0: { x: 200, y: 220 },
	onelogin: { x: 350, y: 220 },
	intershop: { x: 110, y: 410 },
	salesforce: { x: 300, y: 410 },
	webApi: { x: 60, y: 580 },
	webdb: { x: 60, y: 740 },
};

export const signInStory: FlowStoryLayout = {
	flow: 'sign-in',
	height: 810,
	nodes: [
		{ key: 'storefront', node: 'storefront', icon: 'storefront', ...sign.storefront, short: { system: 'EDS or AEM' } },
		{ key: 'sciex-website-db', node: 'sciex-website-db', icon: 'erp', ...sign.sciexDb, short: { title: 'SCIEX web DB', system: 'AEM backend' } },
		{ key: 'azure-b2c', node: 'azure-b2c', icon: 'identity', ...sign.b2c, short: { system: 'Legacy PHX IdP' } },
		{ key: 'auth0', node: 'auth0', icon: 'identity', ...sign.auth0, short: { system: 'CIAM' } },
		{ key: 'onelogin', node: 'onelogin', icon: 'identity', ...sign.onelogin, short: { system: 'LMS partner IdP' } },
		{ key: 'intershop', node: 'intershop', icon: 'commerce', ...sign.intershop },
		{ key: 'crm-sciex', node: 'crm', opco: 'sciex', icon: 'crm', ...sign.salesforce },
		{ key: 'phx-web-api', node: 'phx-web-api', icon: 'api', ...sign.webApi, short: { system: 'PHX backend' } },
		{ key: 'webdb', node: 'webdb', icon: 'staging', ...sign.webdb },
	],
	edges: [
		{
			key: 'storefront-auth0',
			hop: { from: 'storefront', to: 'auth0' },
			d: `M${sign.storefront.x},${sign.storefront.y + R + LABEL2} L${sign.auth0.x},${sign.auth0.y - R}`,
			labelAt: { x: 200, y: 166 },
		},
		{
			key: 'auth0-azure-b2c',
			hop: { from: 'auth0', to: 'azure-b2c' },
			d: `M${sign.auth0.x - R},${sign.auth0.y} L${sign.b2c.x + R},${sign.b2c.y}`,
		},
		{
			key: 'auth0-onelogin',
			hop: { from: 'auth0', to: 'onelogin' },
			d: `M${sign.auth0.x + R},${sign.auth0.y} L${sign.onelogin.x - R},${sign.onelogin.y}`,
		},
		{
			key: 'auth0-crm',
			hop: { from: 'auth0', to: 'crm' },
			d: curve(sign.auth0.x, sign.auth0.y + R + LABEL2, sign.salesforce.x, sign.salesforce.y - R),
		},
		{
			key: 'storefront-intershop',
			hop: { from: 'storefront', to: 'intershop' },
			// Out of the storefront's side, down past Auth0 into Intershop.
			d: `M${sign.storefront.x - R},${sign.storefront.y} C${sign.intershop.x},${sign.storefront.y} ${sign.intershop.x},${sign.storefront.y} ${sign.intershop.x},${sign.intershop.y - R}`,
			labelAt: { x: 110, y: 343 },
		},
		{
			key: 'intershop-phx-web-api',
			hop: { from: 'intershop', to: 'phx-web-api' },
			d: curve(sign.intershop.x, sign.intershop.y + R + LABEL2, sign.webApi.x, sign.webApi.y - R),
		},
		{
			key: 'phx-web-api-webdb',
			hop: { from: 'phx-web-api', to: 'webdb' },
			d: `M${sign.webApi.x},${sign.webApi.y + R + LABEL2} L${sign.webdb.x},${sign.webdb.y - R}`,
		},
		{
			key: 'storefront-sciex-website-db',
			hop: { from: 'storefront', to: 'sciex-website-db' },
			d: `M${sign.storefront.x + R},${sign.storefront.y} L${sign.sciexDb.x - R},${sign.sciexDb.y}`,
		},
	],
	steps: [
		{
			title: 'Universal Login, branded per OpCo',
			body: 'Edge Delivery Services pages and traditional AEM checkout both send the customer to Auth0. Every OpCo uses the same Universal Login pages for sign-in and registration, with common Danaher wording and the OpCo’s own primary branding. Where an OpCo has custom forms and triggers, they ask its own questions and store the answers in the user’s app metadata; the answers come back in the ID token.',
			nodes: ['storefront', 'auth0'],
			edges: ['storefront-auth0'],
			facts: 'hops',
		},
		{
			title: 'Legacy and partner accounts',
			body: 'Phenomenex users not yet in Auth0 are migrated on their first sign-in: Auth0 checks their password against the legacy Azure AD B2C tenant, then keeps the profile and password itself. Leica Microsystems partners can sign in with their OneLogin profiles, and are asked to set an Auth0 password too. SCIEX users were bulk-migrated from Keycloak, hashed passwords included, so no live connection remains.',
			nodes: ['azure-b2c', 'onelogin'],
			edges: ['auth0-azure-b2c', 'auth0-onelogin'],
			facts: 'hops',
		},
		{
			title: 'SCIEX users posted to Salesforce',
			body: 'SCIEX asks for the customer’s industry, and whether they want access to the Absorb learning portal and the IAP program. An Auth0 Forms flow posts the user to SCIEX’s own Salesforce org, with both access flags.',
			nodes: ['crm-sciex'],
			edges: ['auth0-crm'],
			facts: 'hops',
		},
		{
			title: 'User and customer created in Intershop',
			body: 'The storefront hands the Auth0 token to Intershop, whose custom token handler creates the user and customer in the same step. For Phenomenex it also fetches the web user ID from the PHX Web API and stores it in Intershop.',
			nodes: ['intershop', 'phx-web-api'],
			edges: ['storefront-intershop', 'intershop-phx-web-api'],
			facts: 'hops',
		},
		{
			title: 'Answers kept in the OpCo’s own database',
			body: 'Phenomenex’s Web API stores the industry the customer chose in WebDB. The SCIEX website’s AEM backend stores its three answers in its own database. Leica Microsystems and Danaher Life Sciences ask no extra questions.',
			nodes: ['webdb', 'sciex-website-db'],
			edges: ['phx-web-api-webdb', 'storefront-sciex-website-db'],
			facts: 'hops',
		},
	],
};

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

// ---------------------------------------------------------------------------
// Payments: Stripe on the left (PHX, LMS), Cybersource on the right (SCIEX)
// ---------------------------------------------------------------------------

const pay = {
	aem: { x: 210, y: 60 },
	stripe: { x: 50, y: 240 },
	intershop: { x: 210, y: 240 },
	cybersource: { x: 370, y: 240 },
	phx: { x: 105, y: 470 },
	service: { x: 210, y: 470 },
	sciex: { x: 340, y: 470 },
	finance: { x: 40, y: 600 },
};

/**
 * Where curves leave a node from under its two-line label. More room than
 * `LABEL`, since this diagram is tall and so drawn at a smaller scale.
 */
const under = (n: { x: number; y: number }) => n.y + 85;

export const paymentsStory: FlowStoryLayout = {
	flow: 'payments',
	height: 670,
	nodes: [
		{ key: 'aem', node: 'aem', icon: 'storefront', ...pay.aem },
		{ key: 'stripe', node: 'stripe', icon: 'payment', ...pay.stripe },
		{ key: 'intershop', node: 'intershop', icon: 'commerce', ...pay.intershop },
		{ key: 'cybersource', node: 'cybersource', icon: 'payment', ...pay.cybersource },
		{ key: 'erp-phx', node: 'erp', opco: 'phenomenex', icon: 'erp', ...pay.phx },
		{ key: 'lms-customer-service', node: 'lms-customer-service', icon: 'team', ...pay.service },
		{ key: 'erp-sciex', node: 'erp', opco: 'sciex', icon: 'erp', ...pay.sciex },
		{ key: 'lms-finance', node: 'lms-finance', icon: 'team', ...pay.finance },
	],
	edges: [
		{
			key: 'intershop-stripe-prepare',
			hop: { from: 'intershop', to: 'stripe', key: 'prepare' },
			d: `M${pay.intershop.x - R},${pay.intershop.y} L${pay.stripe.x + R},${pay.stripe.y}`,
		},
		{
			key: 'aem-stripe',
			hop: { from: 'aem', to: 'stripe' },
			d: curve(pay.aem.x, under(pay.aem), pay.stripe.x, pay.stripe.y - R),
		},
		{
			key: 'aem-cybersource',
			hop: { from: 'aem', to: 'cybersource' },
			d: curve(pay.aem.x, under(pay.aem), pay.cybersource.x, pay.cybersource.y - R),
		},
		{
			key: 'aem-intershop',
			hop: { from: 'aem', to: 'intershop' },
			d: `M${pay.aem.x},${under(pay.aem)} L${pay.intershop.x},${pay.intershop.y - R}`,
		},
		{
			key: 'intershop-stripe-authorise',
			hop: { from: 'intershop', to: 'stripe', key: 'authorise' },
			// Arcs over the checkout call between the same two systems.
			d: `M${pay.intershop.x - 18},${pay.intershop.y - 13} Q130,190 ${pay.stripe.x + 16},${pay.stripe.y - 13}`,
		},
		{
			key: 'intershop-cybersource-token',
			hop: { from: 'intershop', to: 'cybersource', key: 'token' },
			d: `M${pay.intershop.x + R},${pay.intershop.y} L${pay.cybersource.x - R},${pay.cybersource.y}`,
		},
		{
			key: 'intershop-cybersource-authorise',
			hop: { from: 'intershop', to: 'cybersource', key: 'authorise' },
			d: `M${pay.intershop.x + 18},${pay.intershop.y - 13} Q290,190 ${pay.cybersource.x - 16},${pay.cybersource.y - 13}`,
		},
		{
			key: 'intershop-erp-phx',
			hop: { from: 'intershop', to: 'erp', key: 'phx-order' },
			d: `M${pay.intershop.x},${under(pay.intershop)} C190,360 160,${pay.phx.y} ${pay.phx.x + R},${pay.phx.y}`,
		},
		{
			key: 'intershop-service',
			hop: { from: 'intershop', to: 'lms-customer-service' },
			d: `M${pay.intershop.x},${under(pay.intershop)} L${pay.service.x},${pay.service.y - R}`,
			labelAt: { x: pay.intershop.x, y: 395 },
		},
		{
			key: 'intershop-erp-sciex',
			hop: { from: 'intershop', to: 'erp', key: 'sciex-order' },
			d: `M${pay.intershop.x},${under(pay.intershop)} C230,360 280,${pay.sciex.y} ${pay.sciex.x - R},${pay.sciex.y}`,
		},
		{
			key: 'erp-phx-stripe',
			hop: { from: 'erp', to: 'stripe' },
			// Lands beside the finance team's curve, under Stripe's label.
			d: curve(pay.phx.x, pay.phx.y - R, pay.stripe.x + 12, under(pay.stripe)),
			labelAt: { x: 84, y: 395 },
		},
		{
			key: 'erp-sciex-cybersource',
			hop: { from: 'erp', to: 'cybersource' },
			d: curve(pay.sciex.x, pay.sciex.y - R, pay.cybersource.x, under(pay.cybersource)),
			labelAt: { x: 355, y: 395 },
		},
		{
			key: 'service-finance',
			hop: { from: 'lms-customer-service', to: 'lms-finance' },
			d: `M${pay.service.x},${under(pay.service)} C${pay.service.x},${pay.finance.y} 150,${pay.finance.y} ${pay.finance.x + R},${pay.finance.y}`,
			labelAt: { x: 160, y: 590 },
		},
		{
			key: 'finance-stripe',
			hop: { from: 'lms-finance', to: 'stripe' },
			d: curve(pay.finance.x, pay.finance.y - R, pay.stripe.x - 8, under(pay.stripe)),
			labelAt: { x: 43, y: 500 },
		},
	],
	steps: [
		{
			title: 'Stripe’s payment form prepared',
			body: 'For Phenomenex and Leica Microsystems, Intershop begins checkout by creating a Stripe SetupIntent, whose key renders Stripe’s payment form. Returning customers are shown the cards they saved before, fetched from Stripe. The integration is the platform team’s own, configured per sales channel in Intershop managed services.',
			nodes: ['intershop', 'stripe'],
			edges: ['intershop-stripe-prepare'],
			facts: 'hops',
		},
		{
			title: 'Card entered in the provider’s iframe',
			body: 'The checkout page in AEM renders the provider’s own card form in an iframe — Stripe.js for Stripe, Microform for Cybersource — so the card goes to the provider. Stripe checks it, with 3-D Secure for customers in the EU and Australia, and saves it to the customer. Cybersource checks it and returns a short-lived token with the masked card details.',
			nodes: ['aem', 'stripe', 'cybersource'],
			edges: ['aem-stripe', 'aem-cybersource'],
			facts: 'hops',
		},
		{
			title: 'SCIEX cards saved in Intershop',
			body: 'Stripe keeps saved cards itself. For SCIEX, the short-lived token goes to Intershop’s PaymentInstruments API. Intershop exchanges it with Cybersource for a stored token and saves that with the last four digits, expiry, and cardholder name, so the customer can use the card again.',
			nodes: ['intershop', 'cybersource'],
			edges: ['aem-intershop', 'intershop-cybersource-token'],
			facts: 'hops',
		},
		{
			title: 'Authorised when the order is placed',
			body: 'When the customer places the order, Intershop has Stripe authorise the order total, tax and shipping included, with manual capture: a hold on the card, not yet a charge. SCIEX orders get a $0.10 authorisation instead. If the provider declines, the order can’t be placed.',
			nodes: ['stripe', 'cybersource'],
			edges: ['intershop-stripe-authorise', 'intershop-cybersource-authorise'],
			facts: 'hops',
		},
		{
			title: 'Handed on with the order',
			body: 'Phenomenex and SCIEX create the order in their ERP through its REST API, and the payment travels in the same payload: the Stripe IDs for Phenomenex, the card details and stored token for SCIEX. Leica Microsystems orders are emailed to the customer service team; a REST API to SAP is planned for later in 2026.',
			nodes: ['erp-phx', 'lms-customer-service', 'erp-sciex'],
			edges: ['intershop-erp-phx', 'intershop-service', 'intershop-erp-sciex'],
			facts: 'hops',
		},
		{
			title: 'Captured by the ERP on invoice',
			body: 'When an order is invoiced, Phenomenex’s ERP captures through Stripe — less than authorised if the invoice is lower, more if it is higher, or in several captures for a split shipment — then records a payment journal against the paid invoice and fulfils the order. Extended authorisation is enabled; if it still expires, the ERP creates a new PaymentIntent on the saved card. Refunds go through Stripe the same way. SCIEX’s ERP authorises and captures the invoiced amount afresh on the stored token; the $0.10 hold is never captured.',
			nodes: ['stripe', 'cybersource'],
			edges: ['erp-phx-stripe', 'erp-sciex-cybersource'],
			facts: 'hops',
		},
		{
			title: 'Captured by hand for Leica Microsystems',
			body: 'Leica Microsystems has no ERP integration for payments yet; one with SAP is planned but not on the roadmap. Customer service processes the order, generates the invoice, and emails finance, who capture the amount in the Stripe Dashboard — or charge the saved card afresh if the authorisation has expired. Refunds are made by hand too.',
			nodes: ['lms-customer-service', 'lms-finance', 'stripe'],
			edges: ['service-finance', 'finance-stripe'],
			facts: 'hops',
		},
	],
};

export const flowStories: Partial<Record<DataFlow['id'], FlowStoryLayout>> = {
	payments: paymentsStory,
	'product-data': productDataStory,
	orders: ordersStory,
	'sign-in': signInStory,
	'customer-pricing': customerPricingStory,
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
