import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * Building blocks shared by the stacked-layer diagrams (home landscape,
 * architecture map, commercetools target, data flows), so they read as one
 * visual language.
 */

export function Layer({
	label,
	caption,
	children,
	tone = 'default',
}: {
	label: string;
	caption?: string;
	children: React.ReactNode;
	tone?: 'default' | 'core';
}) {
	return (
		<div
			className={cn(
				'rounded-xl p-4',
				tone === 'core' ? 'border-2 border-primary/40 bg-primary/5' : 'border bg-card'
			)}
		>
			<div className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
				<span className="text-xs font-semibold tracking-wide text-foreground uppercase">{label}</span>
				{caption && <span className="text-xs text-muted-foreground">{caption}</span>}
			</div>
			{children}
		</div>
	);
}

/**
 * Vertical connector between layers or steps. `up` flips the arrow, for data
 * that flows up the stack; `planned` draws it dashed.
 */
export function Connector({
	label,
	up = false,
	planned = false,
}: {
	label?: string;
	up?: boolean;
	planned?: boolean;
}) {
	const line = planned ? 'h-3 border-l border-dashed border-muted-foreground/60' : 'h-3 w-px bg-border';
	return (
		<div className={cn('flex flex-col items-center py-1.5', up && 'flex-col-reverse')} aria-hidden="true">
			<div className={line} />
			{label && (
				<span className="my-1 text-center text-[0.7rem] tracking-wide text-muted-foreground uppercase">
					{label}
				</span>
			)}
			<div className={line} />
			<svg width="9" height="6" viewBox="0 0 9 6" className={cn('fill-border', up && 'rotate-180')}>
				<path d="M4.5 6 0 0h9z" />
			</svg>
		</div>
	);
}

/** The explicit gap marker used wherever a fact is `null`. */
export function NotDocumented({ label = 'Not documented' }: { label?: string }) {
	return (
		<Badge variant="outline" className="text-muted-foreground">
			{label}
		</Badge>
	);
}

export function PlannedBadge({ title }: { title?: string }) {
	return (
		<Badge variant="outline" className="border-dashed" title={title}>
			Planned
		</Badge>
	);
}

/** A fact recorded as described but not yet confirmed. */
export function UnconfirmedBadge({ label = 'Unconfirmed' }: { label?: string }) {
	return (
		<Badge variant="outline" className="border-amber-500/50 text-amber-700 dark:text-amber-300">
			{label}
		</Badge>
	);
}
