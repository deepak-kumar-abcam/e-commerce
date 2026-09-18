import { Badge } from '@/components/ui/badge';
import { centralOpcos } from '@/data/platform';
import { cn } from '@/lib/utils';

/**
 * Proposed commercetools target: one Project owned by the central team, one
 * Store per OpCo. Components we would have to build are drawn dashed, so the
 * build scope is visible in the picture itself.
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
			className={cn(
				'rounded-xl p-4',
				tone === 'core' ? 'border-2 border-primary/40 bg-primary/5' : 'border bg-card'
			)}
		>
			<div className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
				<span className="text-xs font-semibold tracking-wide text-foreground uppercase">{label}</span>
				{caption && <span className="text-xs text-muted-foreground">{caption}</span>}
			</div>
			{children}
		</div>
	);
}

type NodeKind = 'existing' | 'platform' | 'build' | 'partner';

const kindStyles: Record<NodeKind, string> = {
	existing: 'border bg-background',
	platform: 'border border-primary/30 bg-background',
	build: 'border-2 border-dashed border-amber-500/60 bg-amber-500/5',
	partner: 'border border-violet-500/40 bg-violet-500/5',
};

function Node({
	title,
	detail,
	kind = 'existing',
}: {
	title: string;
	detail?: string;
	kind?: NodeKind;
}) {
	return (
		<div className={cn('rounded-lg px-3 py-2', kindStyles[kind])}>
			<div className="text-sm font-medium">{title}</div>
			{detail && <div className="mt-0.5 text-xs leading-snug text-muted-foreground">{detail}</div>}
		</div>
	);
}

/** `up` flips the arrow, for data that flows up the stack (e.g. the PIM feed). */
function Connector({ label, up = false }: { label?: string; up?: boolean }) {
	return (
		<div className={cn('flex flex-col items-center py-1.5', up && 'flex-col-reverse')} aria-hidden="true">
			<div className="h-3 w-px bg-border" />
			{label && (
				<span className="my-1 text-[0.7rem] tracking-wide text-muted-foreground uppercase">{label}</span>
			)}
			<div className="h-3 w-px bg-border" />
			<svg width="9" height="6" viewBox="0 0 9 6" className={cn('fill-border', up && 'rotate-180')}>
				<path d="M4.5 6 0 0h9z" />
			</svg>
		</div>
	);
}

function Key() {
	const items: { kind: NodeKind; label: string }[] = [
		{ kind: 'existing', label: 'Existing system' },
		{ kind: 'platform', label: 'commercetools platform' },
		{ kind: 'partner', label: 'Partner or vendor connector' },
		{ kind: 'build', label: 'We would build' },
	];
	return (
		<div className="mb-3 flex flex-wrap gap-x-4 gap-y-1.5">
			{items.map((item) => (
				<span key={item.kind} className="flex items-center gap-1.5 text-xs text-muted-foreground">
					<span className={cn('inline-block h-3 w-5 rounded-sm', kindStyles[item.kind])} />
					{item.label}
				</span>
			))}
		</div>
	);
}

export function TargetArchitecture() {
	return (
		<div className="not-content">
			<div className="mb-3 flex items-center gap-2">
				<Badge variant="outline" className="border-amber-500/50 text-amber-700 dark:text-amber-300">
					Proposal
				</Badge>
				<span className="text-xs text-muted-foreground">
					Not validated — the proof of concept tests the dashed parts.
				</span>
			</div>
			<Key />

			<div className="grid gap-3 md:grid-cols-[1fr_16rem]">
				<Layer label="Front end" caption="Unchanged platform, rewritten commerce calls">
					<Node
						title="AEM storefronts"
						detail="One per OpCo. Components call commercetools REST or GraphQL directly, as they call Intershop today."
					/>
				</Layer>
				<Layer label="Identity">
					<div className="space-y-2">
						<Node title="Auth0" detail="Central SSO, unchanged." />
						<Node
							title="Token introspection service"
							detail="Maps Auth0 users to commercetools customer and Business Unit scopes."
							kind="build"
						/>
					</div>
				</Layer>
			</div>

			<Connector label="APIs" />

			<Layer label="commercetools Project" caption="One Project, owned by the central team" tone="core">
				<div className="mb-2 text-xs text-muted-foreground">
					One Store per OpCo — each fences its own customers, carts, orders, and assortments:
				</div>
				<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
					{centralOpcos.map((opco) => (
						<Node key={opco.id} title={`${opco.name} Store`} kind="platform" />
					))}
				</div>
				<div className="mt-3 grid gap-2 sm:grid-cols-3">
					<Node title="Business Units" detail="Buyer companies and divisions, roles, approval rules." kind="platform" />
					<Node title="Channels" detail="Per-OpCo prices and inventory." kind="platform" />
					<Node title="Managed Commerce MCP" detail="AI agent access, scoped to one buyer." kind="platform" />
				</div>
			</Layer>

			<Connector label="Extensions and events" />

			<div className="grid gap-3 md:grid-cols-2">
				<Layer label="Synchronous" caption="API Extensions, 2 s default timeout">
					<Node
						title="Budget and cost-center checks"
						detail="Not native in commercetools; built as Custom Types plus an extension."
						kind="build"
					/>
				</Layer>
				<Layer label="Asynchronous" caption="Subscriptions to cloud queues">
					<Node title="Order and customer events" detail="Feed the ERP and MAP services below." kind="platform" />
				</Layer>
			</div>

			<Connector label="Services" />

			<Layer label="Integration services" caption="Connect apps or our own services, replacing Java cartridges">
				<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
					<Node title="ERP connectors" detail="D365, SAP, Oracle — each rebuilt." kind="build" />
					<Node title="Punchout" detail="Shopspray PunchoutPilot (cXML, OCI)." kind="partner" />
					<Node title="Payments" detail="Stripe official connector; Cybersource via marketplace." kind="partner" />
					<Node title="MAP sync" detail="Eloqua, Pardot, SFMC — no connectors found." kind="build" />
				</div>
			</Layer>

			<Connector label="Product data feeds the Project" up />

			<Layer label="Upstream" caption="Unchanged — product data is mastered before commerce">
				<div className="grid gap-2 sm:grid-cols-2">
					<Node title="ERP → PIM" detail="Product master. The PIM product in use is not yet documented." />
					<Node title="Import API" detail="PIM feed re-pointed at commercetools." kind="platform" />
				</div>
			</Layer>
		</div>
	);
}
