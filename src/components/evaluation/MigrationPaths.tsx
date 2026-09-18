import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { migrationPaths } from '@/data/evaluation';

/** The four ways forward, laid out so the same questions line up across cards. */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="border-t py-2.5 first:border-t-0 first:pt-0">
			<div className="mb-1 text-[0.7rem] font-semibold tracking-wide text-muted-foreground uppercase">
				{label}
			</div>
			<div className="text-sm leading-relaxed">{children}</div>
		</div>
	);
}

function List({ items, empty }: { items: string[]; empty: string }) {
	if (items.length === 0) return <span className="text-muted-foreground">{empty}</span>;
	return (
		<ul className="list-disc space-y-1 pl-4">
			{items.map((item) => (
				<li key={item}>{item}</li>
			))}
		</ul>
	);
}

export function MigrationPaths() {
	return (
		<div className="not-content grid gap-3 lg:grid-cols-2">
			{migrationPaths.map((path, index) => (
				<Card key={path.id} id={`path-${path.id}`} className="gap-3 py-5">
					<CardHeader className="px-5">
						<CardTitle className="flex items-baseline gap-2 text-base">
							<span className="text-xs font-normal text-muted-foreground tabular-nums">{index + 1}</span>
							{path.name}
						</CardTitle>
						<p className="text-sm text-muted-foreground">{path.summary}</p>
					</CardHeader>
					<CardContent className="px-5">
						<Field label="AEM impact">{path.aemImpact}</Field>
						<Field label="ERP impact">{path.erpImpact}</Field>
						<Field label="What runs in parallel">{path.parallelRun}</Field>
						<Field label="Main risks">
							<List items={path.risks} empty="None beyond today's." />
						</Field>
						<Field label="Blockers">
							<List items={path.blockers} empty="None." />
						</Field>
						<Field label="Fits when">{path.fitsWhen}</Field>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
