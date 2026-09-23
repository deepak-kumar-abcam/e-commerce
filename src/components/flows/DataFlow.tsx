import { NotDocumented, PlannedBadge, UnconfirmedBadge } from '@/components/diagram/parts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
	dataFlows,
	documentedOpcos,
	getFlow,
	resolveNode,
	type DataFlow,
} from '@/data/integrations';
import { centralOpcos } from '@/data/platform';
import { withBase } from '@/lib/url';

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
						// Long items must wrap on phones rather than widen the page.
						<Badge key={item} variant="secondary" className="shrink whitespace-normal">
							{item}
						</Badge>
					))}
				</dd>
				<dt className="text-xs tracking-wide text-muted-foreground uppercase sm:pt-1">Mastered in</dt>
				<dd className="flex flex-wrap items-center gap-1.5">
					<Badge>{master.title}</Badge>
					{!flow.master.confirmed && <UnconfirmedBadge />}
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
								<div className="flex flex-wrap gap-1">
									{hop.status === 'planned' ? <PlannedBadge /> : <Badge variant="secondary">Live</Badge>}
									{hop.unconfirmed && <UnconfirmedBadge />}
								</div>
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
