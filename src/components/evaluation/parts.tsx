import { Badge } from '@/components/ui/badge';
import {
	evaluationMeta,
	evidenceInfo,
	ratingInfo,
	sources,
	type Assessment,
	type Evidence,
	type Rating,
	type SourceId,
} from '@/data/evaluation';
import { withBase } from '@/lib/url';
import { cn } from '@/lib/utils';

/**
 * Building blocks shared by every Platform Evaluation page. All static — no
 * client directive needed.
 */

export const SOURCES_PAGE = withBase('/platform-evaluation/sources/');

const sourceIds = Object.keys(sources) as SourceId[];

/** Stable citation number for a source, matching the Sources page order. */
export function sourceNumber(id: SourceId) {
	return sourceIds.indexOf(id) + 1;
}

export function sourceAnchor(id: SourceId) {
	return `src-${id}`;
}

/* Ratings are colour-coded so a column can be scanned; the label always
   carries the meaning, so colour is never the only signal. */
const ratingStyles: Record<Rating, string> = {
	native: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
	configurable: 'border-sky-500/40 bg-sky-500/15 text-sky-700 dark:text-sky-300',
	partner: 'border-violet-500/40 bg-violet-500/15 text-violet-700 dark:text-violet-300',
	custom: 'border-amber-500/40 bg-amber-500/15 text-amber-800 dark:text-amber-300',
	gap: 'border-red-500/40 bg-red-500/15 text-red-700 dark:text-red-300',
	'in-production': 'border-border bg-secondary text-secondary-foreground',
	unknown: 'border-dashed border-border bg-transparent text-muted-foreground',
};

export function RatingBadge({ rating }: { rating: Rating }) {
	return (
		<Badge variant="outline" className={ratingStyles[rating]} title={ratingInfo[rating].description}>
			{ratingInfo[rating].label}
		</Badge>
	);
}

const evidenceStyles: Record<Evidence, string> = {
	documented: 'text-muted-foreground',
	'vendor-claim': 'text-amber-700 dark:text-amber-300',
	verified: 'text-emerald-700 dark:text-emerald-300',
	unconfirmed: 'text-red-700 dark:text-red-300',
};

export function EvidenceTag({ evidence }: { evidence: Evidence }) {
	return (
		<span
			className={cn('text-[0.7rem] font-medium tracking-wide uppercase', evidenceStyles[evidence])}
			title={evidenceInfo[evidence].description}
		>
			{evidenceInfo[evidence].label}
		</span>
	);
}

export function SourceRefs({ ids }: { ids: SourceId[] }) {
	if (ids.length === 0) return null;
	return (
		<span className="text-[0.7rem] text-muted-foreground">
			{ids.map((id) => (
				<a
					key={id}
					href={`${SOURCES_PAGE}#${sourceAnchor(id)}`}
					title={sources[id].title}
					className="ml-0.5 text-muted-foreground no-underline hover:text-primary hover:underline"
				>
					[{sourceNumber(id)}]
				</a>
			))}
		</span>
	);
}

/** One platform's assessment of one capability. */
export function AssessmentCell({ assessment }: { assessment: Assessment }) {
	return (
		<div className="space-y-1.5">
			<div className="flex flex-wrap items-center gap-x-2 gap-y-1">
				{assessment.rating && <RatingBadge rating={assessment.rating} />}
				<EvidenceTag evidence={assessment.evidence} />
			</div>
			<p className="text-sm leading-relaxed text-foreground">
				{assessment.summary}
				<SourceRefs ids={assessment.sources} />
			</p>
		</div>
	);
}

/** "As of" line at the top of every evaluation page. */
export function EvaluationBanner() {
	return (
		<div className="not-content flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border bg-card px-4 py-2.5 text-xs text-muted-foreground">
			<span>
				<span className="font-medium text-foreground">As of</span> {evaluationMeta.asOf}
			</span>
			<span>
				<span className="font-medium text-foreground">Owner</span> {evaluationMeta.owner}
			</span>
			<span>
				<span className="font-medium text-foreground">Next review</span> {evaluationMeta.nextReview}
			</span>
			<span>
				<span className="font-medium text-foreground">Scope</span> {evaluationMeta.scope},{' '}
				{evaluationMeta.intershopVersion}
			</span>
		</div>
	);
}

/** Key for the two scales, shown on the summary and sources pages. */
export function Legend() {
	return (
		<div className="not-content grid gap-4 rounded-xl border bg-card p-4 md:grid-cols-2">
			<div>
				<div className="mb-2 text-xs font-semibold tracking-wide text-foreground uppercase">
					How it's delivered
				</div>
				<ul className="space-y-1.5">
					{(Object.keys(ratingInfo) as Rating[]).map((rating) => (
						<li key={rating} className="flex items-start gap-2 text-sm">
							<span className="w-28 shrink-0">
								<RatingBadge rating={rating} />
							</span>
							<span className="text-muted-foreground">{ratingInfo[rating].description}</span>
						</li>
					))}
				</ul>
			</div>
			<div>
				<div className="mb-2 text-xs font-semibold tracking-wide text-foreground uppercase">
					How we know
				</div>
				<ul className="space-y-1.5">
					{(Object.keys(evidenceInfo) as Evidence[]).map((evidence) => (
						<li key={evidence} className="flex items-start gap-2 text-sm">
							<span className="w-28 shrink-0 pt-0.5">
								<EvidenceTag evidence={evidence} />
							</span>
							<span className="text-muted-foreground">{evidenceInfo[evidence].description}</span>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
