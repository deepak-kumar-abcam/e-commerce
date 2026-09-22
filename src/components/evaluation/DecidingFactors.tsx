import { aiUseCases, b2bRows, integrationRows, type ComparisonRow } from '@/data/evaluation';
import { withBase } from '@/lib/url';
import { EvidenceTag, RatingBadge } from './parts';

/**
 * The executive view: only the rows flagged `critical`, across every
 * category, with ratings but not the full prose. Each links to its detail page.
 */

const groups: { title: string; href: string; set: string; rows: ComparisonRow[] }[] = [
	{ title: 'B2B', href: '/platform-evaluation/b2b/', set: 'b2b', rows: b2bRows },
	{
		title: 'Integrations',
		href: '/platform-evaluation/integrations/',
		set: 'integrations',
		rows: integrationRows,
	},
	{ title: 'AI', href: '/platform-evaluation/ai/', set: 'ai', rows: aiUseCases },
];

export function DecidingFactors() {
	return (
		<div className="not-content overflow-x-auto rounded-xl border">
			<table className="w-full min-w-[36rem] border-collapse text-left">
				<thead>
					<tr className="border-b bg-muted/50">
						<th className="px-4 py-2.5 text-xs font-semibold tracking-wide uppercase">Deciding factor</th>
						<th className="px-4 py-2.5 text-xs font-semibold tracking-wide uppercase">Intershop</th>
						<th className="px-4 py-2.5 text-xs font-semibold tracking-wide uppercase">commercetools</th>
					</tr>
				</thead>
				<tbody>
					{groups.map((group) =>
						group.rows
							.filter((row) => row.critical)
							.map((row, index) => (
								<tr key={`${group.set}-${row.id}`} className="border-b align-top last:border-b-0">
									<th scope="row" className="px-4 py-2.5 font-normal">
										{index === 0 && (
											<div className="mb-0.5 text-[0.7rem] tracking-wide text-muted-foreground uppercase">
												{group.title}
											</div>
										)}
										<a
											href={withBase(`${group.href}#row-${group.set}-${row.id}`)}
											className="text-sm font-medium text-foreground no-underline hover:text-primary hover:underline"
										>
											{row.capability}
										</a>
									</th>
									{[row.intershop, row.commercetools].map((assessment, i) => (
										<td key={i} className="px-4 py-2.5">
											<div className="flex flex-wrap items-center gap-x-2 gap-y-1">
												{assessment.rating && <RatingBadge rating={assessment.rating} />}
												<EvidenceTag evidence={assessment.evidence} />
											</div>
										</td>
									))}
								</tr>
							))
					)}
				</tbody>
			</table>
		</div>
	);
}
