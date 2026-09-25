import { useEffect, useRef, useState } from 'react';
import { Database, FolderInput, Layers, Search, ShoppingCart, TableProperties, Users, type LucideIcon } from 'lucide-react';

import { NotDocumented, UnconfirmedBadge } from '@/components/diagram/parts';
import { Badge } from '@/components/ui/badge';
import { getFlow, resolveNode, type Hop, type NodeId } from '@/data/integrations';
import { centralOpcos } from '@/data/platform';
import { cn } from '@/lib/utils';

import { flowStories, type FlowStoryLayout, type StoryIcon, type StoryNode } from './stories';

/**
 * A flow told as numbered steps beside a diagram that builds as you read:
 * each step lights its nodes and draws its curves when it scrolls into the
 * middle of the viewport. Hydrated (`client:visible`) for the scroll tracking;
 * the server render shows the finished diagram, so it reads fine without JS.
 */

const icons: Record<StoryIcon, LucideIcon> = {
	erp: Database,
	crm: Users,
	staging: TableProperties,
	sftp: FolderInput,
	pim: Layers,
	commerce: ShoppingCart,
	search: Search,
};

type FlowId = FlowStoryLayout['flow'];

function findHop(flowId: FlowId, from: NodeId, to: NodeId): Hop {
	const hop = getFlow(flowId)
		.routes.flatMap((r) => r.hops)
		.find((h) => h.from === from && h.to === to);
	if (!hop) throw new Error(`No ${from} → ${to} hop in flow "${flowId}"`);
	return hop;
}

function nodeText(node: StoryNode, opcos: string[]) {
	if (node.opco) {
		const opco = centralOpcos.find((o) => o.id === node.opco)!;
		return { title: opco.short, system: resolveNode(node.node, [node.opco]).system };
	}
	const resolved = resolveNode(node.node, opcos);
	return { title: resolved.title, system: resolved.system };
}

// ---------------------------------------------------------------------------
// Diagram
// ---------------------------------------------------------------------------

type Stage = 'idle' | 'reached' | 'active';

function Diagram({ layout, stageOf }: { layout: FlowStoryLayout; stageOf: (key: string, kind: 'node' | 'edge') => Stage }) {
	const flow = getFlow(layout.flow);
	const opcos = [...new Set(flow.routes.flatMap((r) => r.opcos))];
	const pct = (v: number, of: number) => `${(v / of) * 100}%`;

	return (
		<div className="relative w-full" style={{ aspectRatio: `400 / ${layout.height}` }}>
			<svg viewBox={`0 0 400 ${layout.height}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
				<defs>
					<marker id="flow-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
						<path d="M1,1 L8,5 L1,9" fill="none" stroke="context-stroke" strokeWidth="1.5" />
					</marker>
				</defs>
				{layout.edges.map((edge) => {
					const stage = stageOf(edge.key, 'edge');
					const planned = findHop(layout.flow, edge.hop.from, edge.hop.to).status === 'planned';
					return (
						<g key={edge.key}>
							{/* Faint track, always visible, so the whole route reads before it's drawn. */}
							<path d={edge.d} fill="none" className="stroke-border" strokeWidth={1} strokeDasharray={planned ? '4 5' : undefined} />
							<path
								d={edge.d}
								fill="none"
								pathLength={1}
								markerEnd={stage === 'idle' ? undefined : 'url(#flow-arrow)'}
								className={cn(
									'stroke-primary transition-[stroke-dashoffset,opacity] duration-700 ease-out motion-reduce:transition-none',
									stage === 'active' ? 'opacity-100' : 'opacity-60'
								)}
								strokeWidth={stage === 'active' ? 1.75 : 1.25}
								// Planned hops fade in dashed; live ones draw along their length.
								strokeDasharray={planned ? '0.012 0.015' : 1}
								strokeDashoffset={planned ? 0 : stage === 'idle' ? 1 : 0}
								style={planned ? { opacity: stage === 'idle' ? 0 : undefined } : undefined}
							/>
						</g>
					);
				})}
			</svg>

			{layout.edges.map((edge) => {
				if (!edge.labelAt) return null;
				const hop = findHop(layout.flow, edge.hop.from, edge.hop.to);
				const text = hop.status === 'planned'
					? 'Planned'
					: hop.unconfirmed
						? 'Unconfirmed'
						: hop.via === 'boomi'
							? 'via Boomi'
							: 'via ?';
				const stage = stageOf(edge.key, 'edge');
				return (
					<span
						key={edge.key}
						className={cn(
							'absolute -translate-x-1/2 -translate-y-1/2 rounded-full border bg-background px-1.5 py-px text-[0.65rem] whitespace-nowrap transition-colors duration-500',
							stage === 'idle' ? 'text-muted-foreground' : 'border-primary/50 text-primary',
							hop.status === 'planned' && 'border-dashed',
							hop.unconfirmed && 'border-dashed border-amber-500/60 text-amber-700 dark:text-amber-300'
						)}
						style={{ left: pct(edge.labelAt.x, 400), top: pct(edge.labelAt.y, layout.height) }}
					>
						{text}
					</span>
				);
			})}

			{layout.nodes.map((node) => {
				const Icon = icons[node.icon];
				const stage = stageOf(node.key, 'node');
				const { title, system } = nodeText(node, opcos);
				const side = node.label ?? 'below';
				return (
					<div
						key={node.key}
						className="absolute"
						style={{ left: pct(node.x, 400), top: pct(node.y, layout.height) }}
						title={node.ghost ? `${title}: not documented for this flow` : undefined}
					>
						<div
							className={cn(
								'absolute flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-background transition-all duration-500',
								node.ghost && 'border-dashed opacity-50',
								stage === 'idle' && 'text-muted-foreground',
								stage === 'reached' && 'border-primary/50 text-primary',
								stage === 'active' && 'border-primary text-primary shadow-[0_0_0_5px] shadow-primary/15'
							)}
						>
							<Icon className="size-[1.1rem]" strokeWidth={1.75} />
						</div>
						<div
							className={cn(
								'absolute w-max max-w-[7.5rem] text-[0.7rem] leading-tight',
								side === 'below' && 'top-7 -translate-x-1/2 text-center',
								side === 'right' && 'left-8 -translate-y-1/2',
								side === 'left' && 'right-8 -translate-y-1/2 text-right'
							)}
						>
							<div className={cn('font-medium', stage === 'idle' ? 'text-muted-foreground' : 'text-foreground')}>
								{title}
								{node.ghost && <span className="sr-only"> (not documented for this flow)</span>}
							</div>
							{/* Per-OpCo nodes sit too close together to name their system; step 1 lists them. */}
							{!node.opco && (
								<div className="text-muted-foreground">{system ?? <span className="italic">not documented</span>}</div>
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

function FactRow({
	label,
	children,
	stacked = false,
}: {
	label: string;
	children: React.ReactNode;
	/** Label above the values, for rows whose values won't fit beside it. */
	stacked?: boolean;
}) {
	return (
		<div
			className={cn(
				'border-b border-primary/20 py-2 text-sm last:border-b-0',
				stacked ? 'space-y-1.5' : 'flex items-center justify-between gap-3'
			)}
		>
			<div className="text-muted-foreground">{label}</div>
			<div className={cn('flex flex-wrap gap-1', !stacked && 'justify-end')}>{children}</div>
		</div>
	);
}

function HopFacts({ hop, opcos }: { hop: Hop; opcos: string[] }) {
	const label = `${resolveNode(hop.from, opcos).title} → ${resolveNode(hop.to, opcos).title}`;
	const chip = (text: string) => (
		<Badge key={text} variant="secondary">
			{text}
		</Badge>
	);
	if (hop.status === 'planned') {
		return (
			<FactRow label={label} stacked>
				<NotDocumented label="Route not documented" />
			</FactRow>
		);
	}
	const doubt = hop.unconfirmed && <UnconfirmedBadge key="unconfirmed" />;
	const known = [
		hop.via === 'boomi' && 'via Boomi',
		hop.mechanism && (hop.mechanism === 'file' ? 'File' : 'API'),
		hop.frequency,
		hop.format,
	].filter(Boolean) as string[];
	const missing = [
		hop.via === null && 'carrier',
		!hop.mechanism && 'mechanism',
		!hop.frequency && 'schedule',
		!hop.format && 'format',
	].filter(Boolean) as string[];
	return (
		<FactRow label={label} stacked>
			{doubt}
			{known.map(chip)}
			{missing.length > 0 && <NotDocumented label={`Not documented: ${missing.join(', ')}`} />}
		</FactRow>
	);
}

export function FlowStory({ flow: flowId }: { flow: FlowId }) {
	const layout = flowStories[flowId];
	if (!layout) throw new Error(`No story layout for flow "${flowId}"`);
	const flow = getFlow(flowId);
	const opcos = [...new Set(flow.routes.flatMap((r) => r.opcos))];

	// Server render and no-JS: every step reached, so the diagram is complete.
	const [active, setActive] = useState(layout.steps.length - 1);
	const [animating, setAnimating] = useState(false);
	const stepRefs = useRef<(HTMLElement | null)[]>([]);

	useEffect(() => {
		const wide = window.matchMedia('(min-width: 50rem)');
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
		// Narrow screens show the diagram above the steps, not beside them, so
		// there's nothing to sync; reduced motion keeps the finished diagram.
		if (!wide.matches || reduced.matches) return;

		setAnimating(true);
		setActive(0);
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.step));
				}
			},
			// A thin band across the middle of the viewport decides the active step.
			{ rootMargin: '-45% 0px -50% 0px' }
		);
		stepRefs.current.forEach((el) => el && observer.observe(el));
		return () => observer.disconnect();
	}, []);

	const stageOf = (key: string, kind: 'node' | 'edge'): Stage => {
		const owner = (i: number) => (kind === 'node' ? layout.steps[i].nodes : layout.steps[i].edges).includes(key);
		if (owner(active)) return animating ? 'active' : 'reached';
		for (let i = 0; i < active; i++) if (owner(i)) return 'reached';
		return 'idle';
	};

	return (
		<div className="not-content grid gap-8 min-[50rem]:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
			<ol className="order-2 m-0 list-none p-0 min-[50rem]:order-1">
				{layout.steps.map((step, i) => {
					const hops = [
						...new Map(
							step.edges
								.map((key) => layout.edges.find((e) => e.key === key)!)
								.map((e) => [`${e.hop.from}-${e.hop.to}`, findHop(flowId, e.hop.from, e.hop.to)])
						).values(),
					];
					return (
						<li
							key={step.title}
							data-step={i}
							ref={(el) => {
								stepRefs.current[i] = el;
							}}
							className={cn(
								'py-6 transition-opacity duration-500 min-[50rem]:min-h-[55vh] min-[50rem]:first:pt-0',
								animating && i !== active && 'min-[50rem]:opacity-45'
							)}
						>
							<h3 className="text-lg font-semibold text-primary">
								{i + 1}. {step.title}
							</h3>
							<p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
							<div className="mt-4">
								{step.facts !== 'hops'
									? centralOpcos.map((o) => {
											const source = step.facts !== 'hops' && step.facts.source;
											const system = source && resolveNode(source, [o.id]).system;
											return (
												<FactRow key={o.id} label={o.name}>
													{!opcos.includes(o.id) ? (
														<NotDocumented label="Route not documented" />
													) : system ? (
														<Badge variant="secondary">{system}</Badge>
													) : (
														<NotDocumented />
													)}
												</FactRow>
											);
										})
									: hops.map((hop) => <HopFacts key={`${hop.from}-${hop.to}`} hop={hop} opcos={opcos} />)}
							</div>
						</li>
					);
				})}
			</ol>

			<div className="order-1 min-[50rem]:order-2">
				<div className="relative rounded-xl border bg-card px-10 py-8 min-[50rem]:sticky min-[50rem]:top-[calc(var(--sl-nav-height)+1.5rem)]">
					<Corners />
					<Diagram layout={layout} stageOf={stageOf} />
				</div>
			</div>
		</div>
	);
}

/** Bracket corners framing the diagram. */
function Corners() {
	const base = 'pointer-events-none absolute size-5 border-primary/40';
	return (
		<>
			<span className={cn(base, 'top-2 left-2 border-t border-l')} />
			<span className={cn(base, 'top-2 right-2 border-t border-r')} />
			<span className={cn(base, 'bottom-2 left-2 border-b border-l')} />
			<span className={cn(base, 'right-2 bottom-2 border-r border-b')} />
		</>
	);
}
