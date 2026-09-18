import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { aiUseCases } from '@/data/evaluation';
import { cn } from '@/lib/utils';
import { AssessmentCell } from './parts';

/**
 * The four AI use cases as cards, in order of relevance to us. Cards rather
 * than a table because each needs a plain-language description before the
 * comparison makes sense to a business reader.
 */
export function AiUseCases() {
	const ranked = [...aiUseCases].sort((a, b) => a.rank - b.rank);
	return (
		<div className="not-content space-y-3">
			{ranked.map((useCase) => (
				<Card
					key={useCase.id}
					id={`row-ai-${useCase.id}`}
					className={cn('gap-4 py-5', useCase.critical && 'border-primary/30')}
				>
					<CardHeader className="px-5">
						<div className="flex flex-wrap items-center gap-2">
							<span className="text-xs text-muted-foreground tabular-nums">#{useCase.rank}</span>
							<CardTitle className="text-base">{useCase.capability}</CardTitle>
							{useCase.critical && (
								<Badge variant="outline" className="border-primary/40 text-primary">
									Most relevant to us
								</Badge>
							)}
						</div>
						<p className="text-sm text-muted-foreground">{useCase.description}</p>
					</CardHeader>
					<CardContent className="grid gap-4 px-5 md:grid-cols-2">
						<div className="rounded-lg border bg-background p-3">
							<div className="mb-2 text-xs font-semibold tracking-wide uppercase">Intershop</div>
							<AssessmentCell assessment={useCase.intershop} />
						</div>
						<div className="rounded-lg border bg-background p-3">
							<div className="mb-2 text-xs font-semibold tracking-wide uppercase">commercetools</div>
							<AssessmentCell assessment={useCase.commercetools} />
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
