import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { docSections } from '@/data/platform';
import { withBase } from '@/lib/url';
import { cn } from '@/lib/utils';

const statusLabel: Record<string, string> = {
	'in-progress': 'In progress',
	planned: 'Planned',
};

export function DocSections() {
	// Featured sections sit outside the numbered sequence.
	let number = 0;

	return (
		<div className="not-content grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
			{docSections.map((section) => {
				const label = section.featured ? null : String(++number).padStart(2, '0');
				return (
					<Card
						key={section.href}
						className={cn(
							'relative gap-3 py-5 transition-colors hover:border-primary/50 focus-within:border-primary/50',
							section.featured && 'border-primary/30 bg-primary/5 sm:col-span-2 lg:col-span-3'
						)}
					>
						<CardHeader className="px-5">
							<CardTitle className="flex items-center gap-2.5">
								{label && (
									<span className="text-xs font-normal text-muted-foreground tabular-nums">{label}</span>
								)}
								{/* Stretched link keeps the whole card clickable without nesting
								    interactive elements. */}
								<a
									href={withBase(section.href)}
									className="text-foreground no-underline after:absolute after:inset-0"
								>
									{section.title}
								</a>
							</CardTitle>
						</CardHeader>
						<CardContent className="px-5">
							<CardDescription className="leading-relaxed">{section.description}</CardDescription>
							<Badge
								variant={section.status === 'in-progress' ? 'default' : 'outline'}
								className={cn('mt-3', section.status !== 'in-progress' && 'text-muted-foreground')}
							>
								{statusLabel[section.status]}
							</Badge>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
