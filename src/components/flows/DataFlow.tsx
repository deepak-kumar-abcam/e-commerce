import { Connector, NotDocumented, PlannedBadge } from '@/components/diagram/parts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
	dataFlows,
	documentedOpcos,
	getFlow,
	resolveNode,
	type DataFlow,
	type Hop,
	type NodeId,
	type Route,
} from '@/data/integrations';
import { centralOpcos } from '@/data/platform';
import { withBase } from '@/lib/url';
import { cn } from '@/lib/utils';

/**
 * Data-flow pages, all rendered from `integrations.ts`. Each page composes
 * these under its own markdown headings so they appear in the TOC.
 */

type FlowId = DataFlow['id'];

function Value({ value }: { value: string | null }) {
	return value ? <Badge variant="secondary">{value}</Badge> : <NotDocumented />;
}

// ---------------------------------------------------------------------------
// Summary: what it carries, where it's mastered, who it's documented for
// ---------------------------------------------------------------------------

export function FlowSummary({ flow: id }: { flow: FlowId }) {
	const flow = getFlow(id);
	const documented = documentedOpcos(flow);
	const master = resolveNode(flow.master.node, documented);

	return (
		<div className="not-content space-y-4">
			<dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[auto_1fr]">
				<dt className="text-xs tracking-wide text-muted-foreground uppercase sm:pt-1">Carries</dt>
				<dd className="flex flex-wrap gap-1.5">
					{flow.carries.map((item) => (
						<Badge key={item} variant="secondary">
							{item}
						</Badge>
					))}
				</dd>
				<dt className="text-xs tracking-wide text-muted-foreground uppercase sm:pt-1">Mastered in</dt>
				<dd className="flex flex-wrap items-center gap-1.5">
					<Badge>{master.title}</Badge>
					{!flow.master.confirmed && (
						<Badge variant="outline" className="border-amber-500/50 text-amber-700 dark:text-amber-300">
							Unconfirmed
						</Badge>
					)}
				</dd>
			</dl>

			<div className="overflow-x-auto rounded-xl border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Operating company</TableHead>
							<TableHead>Route</TableHead>
							{flow.variations && <TableHead>Variations</TableHead>}
						</TableRow>
					</TableHeader>
					<TableBody>
						{centralOpcos.map((opco) => (
							<TableRow key={opco.id}>
								<TableCell className="font-medium">{opco.name}</TableCell>
								<TableCell>
									{documented.includes(opco.id) ? (
										<Badge variant="secondary">Documented</Badge>
									) : (
										<NotDocumented />
									)}
								</TableCell>
								{flow.variations && (
									<TableCell>
										<Value value={flow.variations[opco.id] ?? null} />
									</TableCell>
								)}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Diagram
// ---------------------------------------------------------------------------

/** Split a route's hops into linear chains; a hop that doesn't continue the last one starts a branch. */
function chains(hops: Hop[]): Hop[][] {
	const result: Hop[][] = [];
	for (const hop of hops) {
		const current = result.at(-1);
		if (current && current.at(-1)!.to === hop.from) current.push(hop);
		else result.push([hop]);
	}
	return result;
}

function FlowNode({ id, opcos, planned }: { id: NodeId; opcos: string[]; planned: boolean }) {
	const node = resolveNode(id, opcos);
	return (
		<div
			className={cn(
				'w-full max-w-xs rounded-lg bg-background px-3 py-2 text-center',
				id === 'intershop' ? 'border-2 border-primary/40' : 'border',
				planned && 'border-dashed'
			)}
		>
			<div className="text-sm font-medium">{node.title}</div>
			<div className="mt-1 flex justify-center">
				{node.system ? (
					<span className="text-xs text-muted-foreground">{node.system}</span>
				) : (
					<NotDocumented />
				)}
			</div>
			{node.detail && <div className="mt-1 text-[0.7rem] leading-snug text-muted-foreground">{node.detail}</div>}
		</div>
	);
}

function hopLabel(hop: Hop): string | undefined {
	if (hop.via === 'boomi') return 'via Boomi';
	if (hop.status === 'planned') return 'Route not documented';
	return undefined;
}

function Chain({ hops, opcos }: { hops: Hop[]; opcos: string[] }) {
	return (
		<div className="flex flex-col items-center">
			<FlowNode id={hops[0].from} opcos={opcos} planned={false} />
			{hops.map((hop) => (
				<div key={`${hop.from}-${hop.to}`} className="flex w-full flex-col items-center">
					<Connector label={hopLabel(hop)} planned={hop.status === 'planned'} />
					<FlowNode id={hop.to} opcos={opcos} planned={false} />
				</div>
			))}
		</div>
	);
}

function RouteDiagram({ route }: { route: Route }) {
	const parts = chains(route.hops);
	const planned = route.hops.some((h) => h.status === 'planned');
	return (
		<div className={cn('rounded-xl bg-card p-4', planned ? 'border border-dashed' : 'border')}>
			<div className="mb-3 flex flex-wrap items-center gap-2">
				<span className="text-xs font-semibold tracking-wide text-foreground uppercase">{route.label}</span>
				{planned && <PlannedBadge />}
			</div>
			<div className={cn('grid gap-6', parts.length > 1 && 'sm:grid-cols-2')}>
				{parts.map((chain, i) => (
					<div key={i}>
						{i > 0 && (
							<div className="mb-2 text-center text-xs text-muted-foreground">
								Branch from {resolveNode(chain[0].from, route.opcos).title}
							</div>
						)}
						<Chain hops={chain} opcos={route.opcos} />
					</div>
				))}
			</div>
		</div>
	);
}

export function FlowDiagram({ flow: id }: { flow: FlowId }) {
	const flow = getFlow(id);
	return (
		<div className="not-content space-y-4">
			{flow.routes.map((route) => (
				<RouteDiagram key={route.label} route={route} />
			))}
		</div>
	);
}

// ---------------------------------------------------------------------------
// Hop table
// ---------------------------------------------------------------------------

const mechanismLabel = { file: 'File', api: 'API' } as const;

export function FlowHops({ flow: id }: { flow: FlowId }) {
	const flow = getFlow(id);
	const rows = flow.routes.flatMap((route) => route.hops.map((hop) => ({ route, hop })));
	return (
		<div className="not-content overflow-x-auto rounded-xl border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>From → to</TableHead>
						<TableHead>Via</TableHead>
						<TableHead>Mechanism</TableHead>
						<TableHead>Frequency</TableHead>
						<TableHead>Format</TableHead>
						<TableHead>Status</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{rows.map(({ route, hop }) => (
						<TableRow key={`${route.label}-${hop.from}-${hop.to}`}>
							<TableCell className="align-top">
								<div className="font-medium">
									{resolveNode(hop.from, route.opcos).title} → {resolveNode(hop.to, route.opcos).title}
								</div>
								{hop.note && (
									<div className="mt-0.5 max-w-xs text-xs whitespace-normal text-muted-foreground">
										{hop.note}
									</div>
								)}
							</TableCell>
							<TableCell className="align-top">
								<Value value={hop.via === 'boomi' ? 'Boomi' : null} />
							</TableCell>
							<TableCell className="align-top">
								<Value value={hop.mechanism && mechanismLabel[hop.mechanism]} />
							</TableCell>
							<TableCell className="align-top">
								<Value value={hop.frequency} />
							</TableCell>
							<TableCell className="align-top">
								<Value value={hop.format} />
							</TableCell>
							<TableCell className="align-top">
								{hop.status === 'planned' ? <PlannedBadge /> : <Badge variant="secondary">Live</Badge>}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Open questions
// ---------------------------------------------------------------------------

export function FlowQuestions({ flow: id }: { flow: FlowId }) {
	const { openQuestions } = getFlow(id);
	if (openQuestions.length === 0) {
		return <p className="text-sm text-muted-foreground">None recorded.</p>;
	}
	return (
		<ul>
			{openQuestions.map((q) => (
				<li key={q}>{q}</li>
			))}
		</ul>
	);
}

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

export function FlowIndex() {
	return (
		<div className="not-content grid gap-3 sm:grid-cols-2">
			{dataFlows.map((flow) => {
				const documented = documentedOpcos(flow);
				const missing = centralOpcos.filter((o) => !documented.includes(o.id));
				return (
					<a key={flow.id} href={withBase(flow.href)} className="group block no-underline">
						<Card className="h-full gap-0 py-4 transition-colors group-hover:border-primary/50">
							<CardHeader className="px-4 pb-2">
								<CardTitle className="text-base">{flow.title}</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3 px-4">
								<p className="text-sm text-muted-foreground">{flow.summary}</p>
								<div className="flex flex-wrap gap-1.5">
									{missing.length === 0 ? (
										<Badge variant="secondary">All central-instance OpCos</Badge>
									) : (
										<>
											{centralOpcos
												.filter((o) => documented.includes(o.id))
												.map((o) => (
													<Badge key={o.id} variant="secondary">
														{o.short}
													</Badge>
												))}
											<NotDocumented
												label={`Not documented: ${missing.map((o) => o.short).join(', ')}`}
											/>
										</>
									)}
								</div>
							</CardContent>
						</Card>
					</a>
				);
			})}
		</div>
	);
}
