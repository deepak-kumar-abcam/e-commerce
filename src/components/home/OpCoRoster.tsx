import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { opcos, sharedServices, type BackendSystem } from '@/data/platform';

/**
 * Who trades on the platform, and the stack behind each of them. This is the
 * page's headline fact — four operating companies on one instance, diverging
 * the moment an order leaves Intershop.
 */

function StackRow({ label, system }: { label: string; system: BackendSystem | null }) {
	return (
		<div className="flex items-center justify-between gap-3 border-b py-2 last:border-b-0">
			<span className="text-xs tracking-wide text-muted-foreground uppercase">{label}</span>
			{system ? (
				<Badge variant="secondary" className="text-right">
					{system.name}
				</Badge>
			) : (
				<Badge variant="outline" className="text-muted-foreground">
					Not documented
				</Badge>
			)}
		</div>
	);
}

export function OpCoRoster() {
	return (
		<div className="not-content">
			<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
				{opcos.map((opco) => (
					<Card key={opco.id} className="gap-0 py-4">
						<CardHeader className="px-4 pb-3">
							<CardTitle className="text-base">{opco.name}</CardTitle>
						</CardHeader>
						<CardContent className="px-4">
							<StackRow label="Orders" system={opco.orderBackend} />
							<StackRow label="Payment" system={opco.paymentProvider} />
							<StackRow label="Marketing" system={opco.marketingPlatform} />
						</CardContent>
					</Card>
				))}
			</div>

			{/* The counterpoint to the four cards above: what does not vary. */}
			<div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
				<span className="text-xs font-semibold tracking-wide text-foreground uppercase">
					Shared by all four
				</span>
				{sharedServices.map((service) => (
					<span key={service.name} className="flex items-center gap-1.5 text-sm">
						<Badge>{service.name}</Badge>
						<span className="text-muted-foreground">{service.role}</span>
					</span>
				))}
			</div>
		</div>
	);
}
