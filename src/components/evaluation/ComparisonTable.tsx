import { Badge } from '@/components/ui/badge';
import {
	architectureRows,
	b2bRows,
	integrationRows,
	operatingRows,
	protocolRows,
	type ComparisonRow,
} from '@/data/evaluation';
import { cn } from '@/lib/utils';
import { AssessmentCell } from './parts';

/**
 * Side-by-side comparison. Pages pick a row set by name so MDX never has to
 * import data directly — keeping every fact in `src/data/evaluation.ts`.
 */

const protocolComparison: ComparisonRow[] = protocolRows.map((row) => ({
	id: row.protocol.toLowerCase(),
	capability: row.protocol,
	why: row.what,
	intershop: row.intershop,
	commercetools: row.commercetools,
}));

const rowSets = {
	architecture: architectureRows,
	b2b: b2bRows,
	integrations: integrationRows,
	operating: operatingRows,
	protocols: protocolComparison,
} satisfies Record<string, ComparisonRow[]>;

export type RowSet = keyof typeof rowSets;

export function ComparisonTable({ set }: { set: RowSet }) {
	const rows = rowSets[set];
	return (
		<div className="not-content overflow-x-auto rounded-xl border">
			<table className="w-full min-w-[34rem] border-collapse text-left">
				<thead>
					<tr className="border-b bg-muted/50">
						<th className="w-[24%] px-4 py-2.5 text-xs font-semibold tracking-wide uppercase">
							Capability
						</th>
						<th className="w-[38%] px-4 py-2.5 text-xs font-semibold tracking-wide uppercase">
							Intershop
						</th>
						<th className="w-[38%] px-4 py-2.5 text-xs font-semibold tracking-wide uppercase">
							commercetools
						</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row) => (
						<tr
							key={row.id}
							id={`row-${set}-${row.id}`}
							className={cn('border-b align-top last:border-b-0', row.critical && 'bg-primary/5')}
						>
							<th scope="row" className="px-4 py-3 font-normal">
								<div className="text-sm font-medium text-foreground">{row.capability}</div>
								{row.critical && (
									<Badge variant="outline" className="mt-1.5 border-primary/40 text-primary">
										Likely deciding factor
									</Badge>
								)}
								{row.why && (
									<div className="mt-1.5 text-xs leading-snug text-muted-foreground">{row.why}</div>
								)}
							</th>
							<td className="px-4 py-3">
								<AssessmentCell assessment={row.intershop} />
							</td>
							<td className="px-4 py-3">
								<AssessmentCell assessment={row.commercetools} />
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
