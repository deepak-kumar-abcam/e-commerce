import { Badge } from '@/components/ui/badge';
import { centralOpcos, separateOpcos, type IdentityStatus } from '@/data/platform';

/** Every Intershop instance in the estate: the central one, then each separate one. */

function Identity({ identity }: { identity: IdentityStatus | null }) {
	if (!identity) return <span className="text-muted-foreground">Not documented</span>;
	return identity.status === 'planned' ? (
		<span title={identity.note}>{identity.system} — planned, central tenant</span>
	) : (
		<span>{identity.system}</span>
	);
}

export function EstateTable() {
	const central = centralOpcos[0];
	const rows = [
		{
			id: 'central',
			instance: 'Central',
			opcos: centralOpcos.map((o) => o.name).join(', '),
			version: central?.intershopVersion ?? null,
			managedBy: central?.managedBy ?? '',
			identity: central?.identity ?? null,
			inScope: true,
		},
		...separateOpcos.map((o) => ({
			id: o.id,
			instance: 'Own',
			opcos: o.name,
			version: o.intershopVersion,
			managedBy: o.managedBy,
			identity: o.identity,
			inScope: false,
		})),
	];

	return (
		<div className="not-content overflow-x-auto rounded-xl border">
			<table className="w-full min-w-[34rem] border-collapse text-left text-sm">
				<thead>
					<tr className="border-b bg-muted/50">
						{['Instance', 'OpCos', 'Intershop', 'Managed by', 'Auth0'].map((heading) => (
							<th key={heading} className="px-3 py-2.5 text-xs font-semibold tracking-wide uppercase">
								{heading}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((row) => (
						<tr key={row.id} className={row.inScope ? 'border-b bg-primary/5' : 'border-b last:border-b-0'}>
							<td className="px-3 py-2.5 align-top">
								<div className="font-medium">{row.instance}</div>
								{row.inScope && (
									<Badge variant="outline" className="mt-1 border-primary/40 text-primary">
										In scope
									</Badge>
								)}
							</td>
							<td className="px-3 py-2.5 align-top">{row.opcos}</td>
							<td className="px-3 py-2.5 align-top whitespace-nowrap">
								{row.version ?? <span className="text-muted-foreground">Not documented</span>}
							</td>
							<td className="px-3 py-2.5 align-top">{row.managedBy}</td>
							<td className="px-3 py-2.5 align-top">
								<Identity identity={row.identity} />
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
