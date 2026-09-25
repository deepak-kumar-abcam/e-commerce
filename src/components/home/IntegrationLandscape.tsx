import { Badge } from '@/components/ui/badge';
import { Connector, Layer } from '@/components/diagram/parts';
import { centralOpcos } from '@/data/platform';

/**
 * A layered read of the central instance: what every OpCo on it shares (the
 * storefronts, identity, and the single Intershop instance) sits above the
 * systems that differ per operating company.
 */

function Node({ children, emphasis = false }: { children: React.ReactNode; emphasis?: boolean }) {
	return (
		<div
			className={
				emphasis
					? 'rounded-lg border border-primary/30 bg-background px-3 py-2 text-center text-sm font-medium'
					: 'rounded-lg border bg-background px-3 py-2 text-center text-sm'
			}
		>
			{children}
		</div>
	);
}

const backendGroups = [
	{
		title: 'Order management',
		caption: 'One per operating company',
		rows: centralOpcos.map((o) => ({ opco: o.short, system: o.orderBackend?.name ?? null })),
	},
	{
		title: 'Payment',
		caption: 'Two providers, shared',
		rows: centralOpcos.map((o) => ({ opco: o.short, system: o.paymentProvider?.name ?? null })),
	},
	{
		title: 'Marketing automation',
		caption: 'Campaign & lead data',
		rows: centralOpcos.map((o) => ({ opco: o.short, system: o.marketingPlatform?.name ?? null })),
	},
];

export function IntegrationLandscape() {
	return (
		<div className="not-content">
			<Layer label="Storefronts" caption="One branded experience per central-instance OpCo">
				<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
					{centralOpcos.map((opco) => (
						<Node key={opco.id}>{opco.name}</Node>
					))}
				</div>
			</Layer>

			<Connector label="Sign-in" />

			<Layer label="Customer identity" caption="Central CIAM tenant — shared by the central-instance OpCos">
				<Node emphasis>
					Auth0 <span className="text-muted-foreground">— single sign-on</span>
				</Node>
			</Layer>

			<Connector />

			<Layer label="Central Intershop instance" caption="Managed by the platform team" tone="core">
				<div className="rounded-lg border border-primary/30 bg-background px-4 py-3 text-center">
					<div className="text-base font-semibold">Intershop</div>
					<div className="mt-0.5 text-xs text-muted-foreground">
						Catalogue, cart, checkout, and customer accounts for each OpCo on it
					</div>
				</div>
			</Layer>

			<Connector label="Integrations" />

			<Layer label="Backend systems" caption="These differ per operating company">
				<div className="grid gap-3 md:grid-cols-3">
					{backendGroups.map((group) => (
						<div key={group.title} className="rounded-lg border bg-background p-3">
							<div className="text-sm font-medium">{group.title}</div>
							<div className="mt-0.5 mb-2.5 text-xs text-muted-foreground">{group.caption}</div>
							<ul className="space-y-1.5">
								{group.rows.map((row) => (
									<li key={row.opco} className="flex items-center justify-between gap-2 text-sm">
										<span className="text-muted-foreground">{row.opco}</span>
										{row.system ? (
											<Badge variant="secondary">{row.system}</Badge>
										) : (
											<Badge variant="outline" className="text-muted-foreground">
												Not documented
											</Badge>
										)}
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</Layer>
		</div>
	);
}
