import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { docSections } from '@/data/platform';

const statusLabel: Record<string, string> = {
	'in-progress': 'In progress',
	planned: 'Planned',
};

export function DocSections() {
	return (
		<div className="not-content grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
			{docSections.map((section, index) => (
				<Card
					key={section.href}
					className="relative gap-3 py-5 transition-colors hover:border-primary/50 focus-within:border-primary/50"
				>
					<CardHeader className="px-5">
						<CardTitle className="flex items-center gap-2.5">
							<span className="text-xs font-normal text-muted-foreground tabular-nums">
								{String(index + 1).padStart(2, '0')}
							</span>
							{/* Stretched link keeps the whole card clickable without nesting
							    interactive elements. */}
							<a href={section.href} className="text-foreground no-underline after:absolute after:inset-0">
								{section.title}
							</a>
						</CardTitle>
					</CardHeader>
					<CardContent className="px-5">
						<CardDescription className="leading-relaxed">{section.description}</CardDescription>
						<Badge variant="outline" className="mt-3 text-muted-foreground">
							{statusLabel[section.status]}
						</Badge>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
