import { Badge } from '@/components/ui/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { opcos, type BackendSystem } from '@/data/platform';

/**
 * The same integration facts read two ways: down the operating companies, or
 * across the systems. Interactive, so this is the one island on the page that
 * ships JavaScript.
 */

function SystemCell({ system }: { system: BackendSystem | null }) {
	if (!system) {
		return (
			<Badge variant="outline" className="text-muted-foreground">
				Not documented
			</Badge>
		);
	}
	return <Badge variant="secondary">{system.name}</Badge>;
}

/** Which operating companies use a given system, grouped for the second view. */
function usageBySystem(pick: (o: (typeof opcos)[number]) => BackendSystem | null) {
	const map = new Map<string, string[]>();
	for (const opco of opcos) {
		const system = pick(opco);
		if (!system) continue;
		map.set(system.name, [...(map.get(system.name) ?? []), opco.name]);
	}
	return [...map.entries()].map(([system, users]) => ({ system, users }));
}

const systemViews = [
	{ category: 'Order management', rows: usageBySystem((o) => o.orderBackend) },
	{ category: 'Payment', rows: usageBySystem((o) => o.paymentProvider) },
	{ category: 'Marketing automation', rows: usageBySystem((o) => o.marketingPlatform) },
];

export function OpCoMatrix() {
	return (
		<div className="not-content">
			<Tabs defaultValue="by-opco">
				<TabsList>
					<TabsTrigger value="by-opco">By operating company</TabsTrigger>
					<TabsTrigger value="by-system">By system</TabsTrigger>
				</TabsList>

				<TabsContent value="by-opco">
					<div className="overflow-x-auto rounded-xl border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="min-w-44">Operating company</TableHead>
									<TableHead className="min-w-40">Order backend</TableHead>
									<TableHead className="min-w-32">Payment</TableHead>
									<TableHead className="min-w-44">Marketing automation</TableHead>
									<TableHead className="min-w-32">Regions live</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{opcos.map((opco) => (
									<TableRow key={opco.id}>
										<TableCell className="font-medium">{opco.name}</TableCell>
										<TableCell>
											<SystemCell system={opco.orderBackend} />
										</TableCell>
										<TableCell>
											<SystemCell system={opco.paymentProvider} />
										</TableCell>
										<TableCell>
											<SystemCell system={opco.marketingPlatform} />
										</TableCell>
										<TableCell className="text-sm text-muted-foreground">
											{opco.regions?.join(', ') ?? 'Not documented'}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
					<p className="mt-2 text-xs text-muted-foreground">
						Intershop and Auth0 are shared by every operating company and so are not repeated per row.
					</p>
				</TabsContent>

				<TabsContent value="by-system">
					<div className="overflow-x-auto rounded-xl border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="min-w-40">Category</TableHead>
									<TableHead className="min-w-44">System</TableHead>
									<TableHead>Used by</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								<TableRow>
									<TableCell className="font-medium">Commerce platform</TableCell>
									<TableCell>
										<Badge>Intershop</Badge>
									</TableCell>
									<TableCell className="text-sm">All operating companies</TableCell>
								</TableRow>
								<TableRow>
									<TableCell className="font-medium">Customer identity</TableCell>
									<TableCell>
										<Badge>Auth0</Badge>
									</TableCell>
									<TableCell className="text-sm">All operating companies</TableCell>
								</TableRow>
								{systemViews.map((view) =>
									view.rows.map((row, index) => (
										<TableRow key={`${view.category}-${row.system}`}>
											<TableCell className="font-medium">
												{index === 0 ? view.category : ''}
											</TableCell>
											<TableCell>
												<Badge variant="secondary">{row.system}</Badge>
											</TableCell>
											<TableCell className="text-sm">{row.users.join(', ')}</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
					<p className="mt-2 text-xs text-muted-foreground">
						Systems still to be confirmed for Danaher Life Sciences do not appear in this view.
					</p>
				</TabsContent>
			</Tabs>
		</div>
	);
}
