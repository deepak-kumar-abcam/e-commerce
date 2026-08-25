import { Badge } from '@/components/ui/badge';
import { opcos } from '@/data/platform';

/**
 * A layered read of the platform: what every operating company shares (the
 * storefronts, identity, and the single Intershop instance) sits above the
 * systems that differ per operating company.
 */

function Layer({
	label,
	caption,
	children,
	tone = 'default',
}: {
	label: string;
	caption?: string;
	children: React.ReactNode;
	tone?: 'default' | 'core';
}) {
	return (
		<div
			className={
				tone === 'core'
					? 'rounded-xl border-2 border-primary/40 bg-primary/5 p-4'
					: 'rounded-xl border bg-card p-4'
			}
		>
			<div className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
				<span className="text-xs font-semibold tracking-wide text-foreground uppercase">{label}</span>
				{caption && <span className="text-xs text-muted-foreground">{caption}</span>}
			</div>
			{children}
		</div>
	);
}

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

/** Vertical connector between layers, so the stack reads as a flow. */
function Connector({ label }: { label?: string }) {
	return (
		<div className="flex flex-col items-center py-1.5" aria-hidden="true">
			<div className="h-3 w-px bg-border" />
			{label && (
				<span className="my-1 text-[0.7rem] tracking-wide text-muted-foreground uppercase">
					{label}
				</span>
			)}
			<div className="h-3 w-px bg-border" />
			<svg width="9" height="6" viewBox="0 0 9 6" className="fill-border">
				<path d="M4.5 6 0 0h9z" />
			</svg>
		</div>
	);
}

const backendGroups = [
	{
		title: 'Order management',
		caption: 'One per operating company',
		rows: opcos.map((o) => ({ opco: o.short, system: o.orderBackend?.name ?? null })),
	},
	{
		title: 'Payment',
		caption: 'Two providers, shared',
		rows: opcos.map((o) => ({ opco: o.short, system: o.paymentProvider?.name ?? null })),
	},
	{
		title: 'Marketing automation',
		caption: 'Campaign & lead data',
		rows: opcos.map((o) => ({ opco: o.short, system: o.marketingPlatform?.name ?? null })),
	},
];

export function IntegrationLandscape() {
	return (
		<div className="not-content">
			<Layer label="Storefronts" caption="One branded experience per operating company">
				<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
					{opcos.map((opco) => (
						<Node key={opco.id}>{opco.name}</Node>
					))}
				</div>
			</Layer>

			<Connector label="Sign-in" />

			<Layer label="Customer identity" caption="Central CIAM — shared by every operating company">
				<Node emphasis>
					Auth0 <span className="text-muted-foreground">— single sign-on</span>
				</Node>
			</Layer>

			<Connector />

			<Layer label="Commerce platform" caption="Single instance, centrally managed" tone="core">
				<div className="rounded-lg border border-primary/30 bg-background px-4 py-3 text-center">
					<div className="text-base font-semibold">Intershop</div>
					<div className="mt-0.5 text-xs text-muted-foreground">
						Catalogue, cart, checkout, and customer accounts for all four operating companies
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
