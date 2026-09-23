import { Connector, Layer, NotDocumented } from '@/components/diagram/parts';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { integrationSystems } from '@/data/integrations';
import { centralOpcos, opcos, type BackendSystem, type OpCo } from '@/data/platform';
import { cn } from '@/lib/utils';

/**
 * Every system around the central instance, stacked from the customer down to
 * each OpCo's systems of record. Product and customer data flow up the stack;
 * the Flow Diagrams section follows each flow hop by hop.
 */

function System({ id, emphasis = false }: { id: string; emphasis?: boolean }) {
	const system = integrationSystems.find((s) => s.id === id);
	if (!system) throw new Error(`Unknown integration system "${id}"`);
	const scopedTo = system.opcos && opcos.filter((o) => system.opcos!.includes(o.id)).map((o) => o.short);
	return (
		<div
			className={cn(
				'rounded-lg bg-background px-3 py-2',
				emphasis ? 'border border-primary/30' : 'border'
			)}
		>
			<div className="flex flex-wrap items-center gap-x-2 gap-y-1">
				<span className="text-sm font-medium">{system.name}</span>
				<span className="text-xs text-muted-foreground">{system.role}</span>
				{scopedTo && (
					<Badge variant="outline">
						{scopedTo.join(', ')} only
					</Badge>
				)}
			</div>
			<div className="mt-1 text-xs leading-snug text-muted-foreground">{system.detail}</div>
		</div>
	);
}

const recordGroups: { title: string; pick: (o: OpCo) => BackendSystem | null }[] = [
	{ title: 'ERP', pick: (o) => o.orderBackend },
	{ title: 'CRM', pick: (o) => o.crm },
	{ title: 'Payment', pick: (o) => o.paymentProvider },
	{ title: 'Marketing automation', pick: (o) => o.marketingPlatform },
];

export function ArchitectureMap() {
	return (
		<div className="not-content">
			<Layer label="Experience" caption="What customers see — one branded storefront per OpCo">
				<div className="grid gap-2 md:grid-cols-2">
					<System id="aem" />
					<System id="coveo" />
				</div>
			</Layer>

			<Connector label="Sign-in" />

			<Layer label="Customer identity" caption="Central CIAM tenant">
				<System id="auth0" />
			</Layer>

			<Connector label="REST APIs, called directly by AEM" />

			<Layer label="Commerce" caption="Central Intershop instance, managed by the platform team" tone="core">
				<System id="intershop" emphasis />
			</Layer>

			<Connector label="Product data & list prices" up />

			<Layer label="Product information" caption="Also feeds Coveo">
				<System id="inriver" />
			</Layer>

			<Connector label="Enriches ERP product data" up />

			<Layer label="Integration" caption="How files reach inRiver and Intershop">
				<div className="grid gap-2 md:grid-cols-3">
					<System id="boomi" />
					<System id="sftp" />
					<System id="webdb" />
				</div>
			</Layer>

			<Connector label="Product, customer, pricing, quote & segment data" up />

			<Layer label="Systems of record" caption="These differ per operating company">
				<div className="overflow-x-auto rounded-lg border bg-background">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>OpCo</TableHead>
								{recordGroups.map((group) => (
									<TableHead key={group.title}>{group.title}</TableHead>
								))}
							</TableRow>
						</TableHeader>
						<TableBody>
							{centralOpcos.map((opco) => (
								<TableRow key={opco.id}>
									<TableCell className="font-medium">{opco.short}</TableCell>
									{recordGroups.map((group) => {
										const system = group.pick(opco);
										return (
											<TableCell key={group.title}>
												{system ? <Badge variant="secondary">{system.name}</Badge> : <NotDocumented />}
											</TableCell>
										);
									})}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</Layer>
		</div>
	);
}
