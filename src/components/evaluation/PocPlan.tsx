import { pocCriteria } from '@/data/evaluation';

/** Each criterion names what it proves and the concrete pass condition. */
export function PocPlan() {
	return (
		<ol className="not-content space-y-3">
			{pocCriteria.map((criterion, index) => (
				<li key={criterion.id} id={`poc-${criterion.id}`} className="rounded-xl border bg-card p-4">
					<div className="flex items-baseline gap-2.5">
						<span className="text-xs text-muted-foreground tabular-nums">
							{String(index + 1).padStart(2, '0')}
						</span>
						<div className="min-w-0 flex-1">
							<div className="text-sm font-semibold">{criterion.test}</div>
							<div className="mt-0.5 text-sm text-muted-foreground">{criterion.proves}</div>
							<div className="mt-3 rounded-lg border-l-2 border-emerald-500/60 bg-emerald-500/5 px-3 py-2">
								<div className="text-[0.7rem] font-semibold tracking-wide text-emerald-700 uppercase dark:text-emerald-300">
									Passes when
								</div>
								<div className="mt-0.5 text-sm leading-relaxed">{criterion.passWhen}</div>
							</div>
						</div>
					</div>
				</li>
			))}
		</ol>
	);
}
