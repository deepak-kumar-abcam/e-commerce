import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { opcos, sharedServices, type BackendSystem } from '@/data/platform';

/**
 * Who trades on the platform, and the stack behind each of them. This is the
 * page's headline fact — every operating company on one instance, diverging
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
		<div className="not-content grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
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

			{/* The counterpoint to the cards beside it: what does not vary. Sits in
			    the grid as its own cell so an odd number of OpCos leaves no hole. */}
			<Card className="gap-0 border-primary/30 bg-primary/5 py-4">
				<CardHeader className="px-4 pb-3">
					<CardTitle className="text-base">Shared by all {opcos.length}</CardTitle>
				</CardHeader>
				<CardContent className="px-4">
					{sharedServices.map((service) => (
						<div
							key={service.name}
							className="flex items-center justify-between gap-3 border-b py-2 last:border-b-0"
						>
							<span className="text-xs tracking-wide text-muted-foreground uppercase">
								{service.role}
							</span>
							<Badge>{service.name}</Badge>
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
