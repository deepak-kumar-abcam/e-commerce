import { Connector, Layer, SystemValue } from '@/components/diagram/parts';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { integrationSystems } from '@/data/integrations';
import { centralOpcos, opcos, type OpCo, type SystemSlot } from '@/data/platform';
import { cn } from '@/lib/utils';

/**
 * Every system around the central instance, stacked from the customer down to
 * each OpCo's systems of record. Product and customer data flow up the stack;
 * the Flow Diagrams section follows each flow hop by hop. Coveo sits under the
 * storefront because pages query it at runtime; its feeds from inRiver and AEM
 * would cross layers, so the Search layer's caption names them instead.
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
				{system.status && (
					<Badge variant="outline" className="border-dashed">
						{system.status}
					</Badge>
				)}
			</div>
			<div className="mt-1 text-xs leading-snug text-muted-foreground">{system.detail}</div>
		</div>
	);
}

const recordGroups: { title: string; pick: (o: OpCo) => SystemSlot }[] = [
	{ title: 'ERP', pick: (o) => o.orderBackend },
	{ title: 'CRM', pick: (o) => o.crm },
	{ title: 'Payment', pick: (o) => o.paymentProvider },
	{ title: 'Marketing automation', pick: (o) => o.marketingPlatform },
];

export function ArchitectureMap() {
	return (
		<div className="not-content">
			<Layer
				label="Experience"
				caption="What customers see — one branded storefront per OpCo, moving page by page to Edge Delivery Services"
			>
				<div className="grid gap-2 md:grid-cols-2">
					<System id="aem" />
					<System id="aem-eds" />
				</div>
			</Layer>

			<Connector label="Coveo Headless & Atomic, queried from the page" />

			<Layer label="Search" caption="Indexes product data from inRiver and content from AEM">
				<System id="coveo" />
			</Layer>

			<Connector label="Sign-in, from traditional AEM" />

			<Layer label="Customer identity" caption="Central CIAM tenant">
				<System id="auth0" />
			</Layer>

			<Connector label="REST APIs, called directly by traditional AEM" />

			<Layer
				label="Commerce"
				caption="Central Intershop instance, managed by the platform team. Calls each OpCo's ERP directly for orders, and for PHX to simulate them at checkout"
				tone="core"
			>
				<System id="intershop" emphasis />
			</Layer>

			<Connector label="Product data & list prices" up />

			<Layer label="Product information" caption="Also feeds Coveo, directly">
				<System id="inriver" />
			</Layer>

			<Connector label="Enriches ERP product data" up />

			<Layer
				label="Integration"
				caption="How files reach inRiver and Intershop: ERPs, and PHX's WebDB on scheduled jobs, drop them on SFTP for Boomi"
			>
				<div className="grid gap-2 md:grid-cols-3">
					<System id="webdb" />
					<System id="sftp" />
					<System id="boomi" />
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
										return (
											<TableCell key={group.title}>
												<SystemValue slot={group.pick(opco)} />
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
