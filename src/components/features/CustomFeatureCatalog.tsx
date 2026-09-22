import {
	BadgePercent,
	FileCheck,
	KeyRound,
	LayoutList,
	Link,
	MessageSquareQuote,
	Package,
	Tag,
	type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
	customFeatures,
	featuresInArea,
	statusInfo,
	type CustomFeature,
	type CustomFeatureStatus,
} from '@/data/customFeatures';
import { centralOpcos, opcos } from '@/data/platform';
import { cn } from '@/lib/utils';

/**
 * Platform-team customizations on the central instance. Static — no client
 * directive needed. `CustomFeatureMatrix` shows every feature against every
 * central OpCo; `CustomFeatureArea` renders one area's feature cards under its
 * markdown heading (so the area appears in the TOC).
 */

const icons: Record<string, LucideIcon> = {
	BadgePercent,
	FileCheck,
	KeyRound,
	LayoutList,
	Link,
	MessageSquareQuote,
	Tag,
};

function Icon({ name, className }: { name: string; className?: string }) {
	const Component = icons[name] ?? Package;
	return <Component aria-hidden="true" className={className} />;
}

const opcoShort = (id: string) => opcos.find((o) => o.id === id)?.short ?? id;

/* The label always carries the meaning, so colour is never the only signal. */
const statusStyles: Record<CustomFeatureStatus | 'unknown', string> = {
	enabled: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
	available: 'border-border bg-secondary text-secondary-foreground',
	unknown: 'border-dashed border-border bg-transparent text-muted-foreground',
};

function StatusBadge({ status }: { status: CustomFeatureStatus | undefined }) {
	const key = status ?? 'unknown';
	return (
		<Badge variant="outline" className={statusStyles[key]} title={statusInfo[key].description}>
			{statusInfo[key].label}
		</Badge>
	);
}

export function CustomFeatureMatrix() {
	return (
		<div className="not-content space-y-3">
			<div className="overflow-x-auto rounded-xl border">
				<table className="w-full min-w-[40rem] border-collapse text-left text-sm">
					<thead>
						<tr className="border-b bg-muted/50">
							<th className="px-3 py-2.5 text-xs font-semibold tracking-wide uppercase">Customization</th>
							{centralOpcos.map((opco) => (
								<th
									key={opco.id}
									className="px-3 py-2.5 text-xs font-semibold tracking-wide uppercase"
									title={opco.name}
								>
									{opco.short}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{customFeatures.map((feature) => (
							<tr key={feature.id} className="border-b last:border-b-0">
								<td className="px-3 py-2.5 align-top">
									<a
										href={`#${feature.id}`}
										className="font-medium text-foreground no-underline hover:text-primary hover:underline"
									>
										{feature.title}
									</a>
								</td>
								{centralOpcos.map((opco) => (
									<td key={opco.id} className="px-3 py-2.5 align-top">
										<StatusBadge status={feature.status[opco.id]} />
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<ul className="m-0 flex list-none flex-wrap gap-x-5 gap-y-1.5 p-0 text-xs text-muted-foreground">
				{(['enabled', 'available', undefined] as const).map((status) => (
					<li key={status ?? 'unknown'} className="m-0 flex items-center gap-2">
						<StatusBadge status={status} />
						{statusInfo[status ?? 'unknown'].description}
					</li>
				))}
			</ul>
		</div>
	);
}

function Label({ children }: { children: React.ReactNode }) {
	return (
		<div className="mb-1 text-[0.7rem] font-semibold tracking-wide text-muted-foreground uppercase">
			{children}
		</div>
	);
}

function FeatureCard({ feature }: { feature: CustomFeature }) {
	return (
		<section id={feature.id} className="scroll-mt-36 rounded-xl border bg-card p-4">
			<header className="flex items-start gap-3">
				<span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
					<Icon name={feature.icon} className="size-5" />
				</span>
				<div className="min-w-0">
					<h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
					<p className="text-sm leading-snug text-muted-foreground">{feature.summary}</p>
				</div>
			</header>

			<div className="mt-4 grid gap-3 md:grid-cols-2">
				<div className="rounded-lg border border-dashed p-3">
					<Label>Standard Intershop</Label>
					<p className="text-sm leading-relaxed text-foreground">{feature.standard}</p>
				</div>
				<div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
					<Label>Our customization</Label>
					<p className="text-sm leading-relaxed text-foreground">{feature.custom}</p>
					{feature.details && (
						<ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
							{feature.details.map((detail) => (
								<li key={detail}>{detail}</li>
							))}
						</ul>
					)}
				</div>
			</div>

			{feature.opcoNotes && (
				<div className="mt-3">
					<Label>OpCo-specific behaviour</Label>
					<ul className="m-0 list-none space-y-1 p-0">
						{feature.opcoNotes.map(({ opco, note }) => (
							<li key={opco} className="m-0 flex items-start gap-2 text-sm text-foreground">
								<Badge variant="secondary" className="mt-0.5">
									{opcoShort(opco)}
								</Badge>
								{note}
							</li>
						))}
					</ul>
				</div>
			)}

			<div className="mt-4 flex flex-wrap items-start gap-x-8 gap-y-3 border-t pt-3">
				<div>
					<Label>APIs</Label>
					<div className="flex flex-wrap gap-1.5">
						{feature.apis.map((api) => (
							<Badge key={api} variant="outline" className="font-mono font-normal">
								{api}
							</Badge>
						))}
					</div>
				</div>
				<div>
					<Label>Central OpCos</Label>
					<div className="flex flex-wrap gap-1.5">
						{centralOpcos.map((opco) => {
							const status = feature.status[opco.id];
							const key = status ?? 'unknown';
							return (
								<Badge
									key={opco.id}
									variant="outline"
									className={cn(statusStyles[key])}
									title={`${opco.name}: ${statusInfo[key].label}`}
								>
									{opco.short}
									<span className="text-[0.65rem] opacity-80">· {statusInfo[key].label}</span>
								</Badge>
							);
						})}
					</div>
				</div>
			</div>

			{feature.openQuestions && (
				<div className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
					<Label>Still to document</Label>
					<ul className="list-disc space-y-0.5 pl-5 text-sm text-amber-800 dark:text-amber-200">
						{feature.openQuestions.map((question) => (
							<li key={question}>{question}</li>
						))}
					</ul>
				</div>
			)}
		</section>
	);
}

export function CustomFeatureArea({ id }: { id: string }) {
	return (
		<div className="not-content space-y-4">
			{featuresInArea(id).map((feature) => (
				<FeatureCard key={feature.id} feature={feature} />
			))}
		</div>
	);
}
