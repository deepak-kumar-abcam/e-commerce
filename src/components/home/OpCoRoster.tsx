import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	centralOpcos,
	instanceCount,
	opcos,
	separateOpcos,
	sharedServices,
	type IdentityStatus,
} from '@/data/platform';

/**
 * The whole Intershop estate in two groups: the central instance our team
 * runs (documented in depth across this site), and the OpCos on their own
 * instances (summarised only — their teams own them).
 */

function Row({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="flex items-center justify-between gap-3 border-b py-2 last:border-b-0">
			<span className="text-xs tracking-wide text-muted-foreground uppercase">{label}</span>
			{children}
		</div>
	);
}

function Value({ value }: { value: string | null | undefined }) {
	return value ? (
		<Badge variant="secondary" className="text-right">
			{value}
		</Badge>
	) : (
		<Badge variant="outline" className="text-muted-foreground">
			Not documented
		</Badge>
	);
}

function Identity({ identity }: { identity: IdentityStatus | null }) {
	if (!identity) return <Value value={null} />;
	if (identity.status === 'planned') {
		return (
			<Badge variant="outline" className="border-dashed" title={identity.note}>
				{identity.system} · planned
			</Badge>
		);
	}
	return <Value value={identity.system} />;
}

function GroupHeading({ title, caption }: { title: string; caption: string }) {
	return (
		<div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
			<h3 className="text-sm font-semibold tracking-wide text-foreground uppercase">{title}</h3>
			<span className="text-sm text-muted-foreground">{caption}</span>
		</div>
	);
}

export function OpCoRoster() {
	return (
		<div className="not-content space-y-8">
			<p className="text-sm text-muted-foreground">
				{opcos.length} operating companies sell on Intershop, across {instanceCount} instances.
			</p>

			<section>
				<GroupHeading
					title="Central instance"
					caption={`${centralOpcos.length} OpCos · managed by the platform team · documented in depth on this site`}
				/>
				<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
					{centralOpcos.map((opco) => (
						<Card key={opco.id} className="gap-0 py-4">
							<CardHeader className="px-4 pb-3">
								<CardTitle className="text-base">{opco.name}</CardTitle>
							</CardHeader>
							<CardContent className="px-4">
								<Row label="Orders">
									<Value value={opco.orderBackend?.name} />
								</Row>
								<Row label="Payment">
									<Value value={opco.paymentProvider?.name} />
								</Row>
								<Row label="Marketing">
									<Value value={opco.marketingPlatform?.name} />
								</Row>
							</CardContent>
						</Card>
					))}
				</div>

				<div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
					<span className="text-xs font-semibold tracking-wide text-foreground uppercase">
						Shared on the central instance
					</span>
					{sharedServices.map((service) => (
						<span key={service.name} className="flex items-center gap-1.5 text-sm">
							<Badge>{service.name}</Badge>
							<span className="text-muted-foreground">{service.role}</span>
						</span>
					))}
					<span className="text-sm text-muted-foreground">· {centralOpcos[0]?.intershopVersion}</span>
				</div>
			</section>

			<section>
				<GroupHeading
					title="Separately managed instances"
					caption="Each OpCo runs its own instance, code, and team — summarised here, not documented in depth"
				/>
				<div className="grid gap-3 md:grid-cols-3">
					{separateOpcos.map((opco) => (
						<Card key={opco.id} className="gap-0 py-4">
							<CardHeader className="px-4 pb-3">
								<CardTitle className="text-base">{opco.name}</CardTitle>
							</CardHeader>
							<CardContent className="px-4">
								<Row label="Intershop">
									<Value value={opco.intershopVersion} />
								</Row>
								<Row label="Managed by">
									<Value value={opco.managedBy} />
								</Row>
								<Row label="Auth0">
									<Identity identity={opco.identity} />
								</Row>
							</CardContent>
						</Card>
					))}
				</div>
			</section>
		</div>
	);
}
