import { sources, type Source, type SourceId } from '@/data/evaluation';
import { EvidenceTag, sourceAnchor, sourceNumber } from './parts';

/** Every source, numbered to match the [n] citations in the comparison tables. */

const vendors: Source['vendor'][] = ['Intershop', 'commercetools', 'Third party'];

export function SourceList() {
	const entries = Object.entries(sources) as [SourceId, Source][];
	return (
		<div className="not-content space-y-6">
			{vendors.map((vendor) => (
				<section key={vendor}>
					<h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">{vendor}</h3>
					<ol className="divide-y rounded-xl border bg-card">
						{entries
							.filter(([, source]) => source.vendor === vendor)
							.map(([id, source]) => (
								<li
									key={id}
									id={sourceAnchor(id)}
									className="flex scroll-mt-24 items-baseline gap-3 px-4 py-2.5 target:bg-primary/10"
								>
									<span className="w-8 shrink-0 text-xs text-muted-foreground tabular-nums">
										[{sourceNumber(id)}]
									</span>
									<div className="min-w-0 flex-1">
										<a href={source.url} className="text-sm text-foreground hover:text-primary" rel="noreferrer">
											{source.title}
										</a>
										<div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
											<EvidenceTag evidence={source.evidence} />
											<span>
												{source.date ? source.date : `Undated · read ${source.accessed}`}
											</span>
										</div>
									</div>
								</li>
							))}
					</ol>
				</section>
			))}
		</div>
	);
}
