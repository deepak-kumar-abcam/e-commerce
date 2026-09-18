import { b2bRows, b2bUsage, type Usage } from '@/data/evaluation';
import { centralOpcos } from '@/data/platform';
import { cn } from '@/lib/utils';

/**
 * Which B2B features each OpCo relies on. Every cell starts as "?" — OpCo
 * technical leads confirm usage, and the answers go into `b2bUsage` in
 * `src/data/evaluation.ts`. Until then, no B2B gap can be called decisive.
 */

const usageLabel: Record<Usage, string> = {
	used: 'Used',
	customized: 'Customized',
	'not-used': 'Not used',
};

export function UsageChecklist() {
	return (
		<div className="not-content overflow-x-auto rounded-xl border">
			<table className="w-full min-w-[32rem] border-collapse text-left">
				<thead>
					<tr className="border-b bg-muted/50">
						<th className="px-3 py-2.5 text-xs font-semibold tracking-wide uppercase">Feature</th>
						{centralOpcos.map((opco) => (
							<th
								key={opco.id}
								className="px-3 py-2.5 text-center text-xs font-semibold tracking-wide uppercase"
								title={opco.name}
							>
								{opco.short}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{b2bRows.map((row) => (
						<tr key={row.id} className={cn('border-b last:border-b-0', row.critical && 'bg-primary/5')}>
							<th scope="row" className="px-3 py-2 text-sm font-normal">
								{row.capability}
							</th>
							{centralOpcos.map((opco) => {
								const usage = b2bUsage[row.id]?.[opco.id] ?? null;
								return (
									<td key={opco.id} className="px-3 py-2 text-center text-sm">
										{usage ? (
											usageLabel[usage]
										) : (
											<span className="text-muted-foreground" title="Not yet confirmed">
												?
											</span>
										)}
									</td>
								);
							})}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
