import {
	Activity,
	BadgePercent,
	Building2,
	CalendarRange,
	ChartColumn,
	ClipboardList,
	Copy,
	CreditCard,
	Database,
	FileSignature,
	FolderTree,
	Gauge,
	GitBranch,
	Hourglass,
	IdCard,
	Images,
	Languages,
	LayoutDashboard,
	LayoutTemplate,
	Link,
	ListChecks,
	Lock,
	Megaphone,
	MessageSquareQuote,
	Network,
	Package,
	Plug,
	Receipt,
	ScrollText,
	Search,
	Server,
	ShieldCheck,
	ShoppingBasket,
	ShoppingCart,
	Sparkles,
	Tag,
	Truck,
	UserCog,
	Users,
	Wallet,
	type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
	featureCategories,
	featureCount,
	featureName,
	featureSource,
	isAddOn,
	type FeatureCategory as Category,
} from '@/data/features';

/**
 * Out-of-the-box Intershop features. Static — no client directive needed.
 * `FeatureOverview` is the quick-view grid; `FeatureCategory` renders one
 * category's groups under its markdown heading (so it appears in the TOC).
 */

const icons: Record<string, LucideIcon> = {
	Activity,
	BadgePercent,
	Building2,
	CalendarRange,
	ChartColumn,
	ClipboardList,
	Copy,
	CreditCard,
	Database,
	FileSignature,
	FolderTree,
	Gauge,
	GitBranch,
	Hourglass,
	IdCard,
	Images,
	Languages,
	LayoutDashboard,
	LayoutTemplate,
	Link,
	ListChecks,
	Lock,
	Megaphone,
	MessageSquareQuote,
	Network,
	Package,
	Plug,
	Receipt,
	ScrollText,
	Search,
	Server,
	ShieldCheck,
	ShoppingBasket,
	ShoppingCart,
	Sparkles,
	Tag,
	Truck,
	UserCog,
	Users,
	Wallet,
};

function Icon({ name, className }: { name: string; className?: string }) {
	const Component = icons[name] ?? Package;
	return <Component aria-hidden="true" className={className} />;
}

const categoryFeatureCount = (category: Category) =>
	category.groups.reduce((sum, group) => sum + group.features.length, 0);

/** Slug Starlight gives the category's markdown heading. */
const headingSlug = (title: string) => title.toLowerCase().replace(/\s+/g, '-');

export function FeatureOverview() {
	return (
		<div className="not-content space-y-3">
			<div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border bg-card px-4 py-2.5 text-xs text-muted-foreground">
				<span>
					<span className="font-medium text-foreground">{featureCount}</span> features
				</span>
				<span>
					<span className="font-medium text-foreground">{featureCategories.length}</span> areas
				</span>
				<span>
					<span className="font-medium text-foreground">Source</span>{' '}
					<a href={featureSource.url} className="text-primary hover:underline">
						Intershop feature list, {featureSource.version}
					</a>
				</span>
			</div>
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{featureCategories.map((category) => (
					<a
						key={category.id}
						href={`#${headingSlug(category.title)}`}
						className="group flex gap-3 rounded-xl border bg-card p-4 text-foreground no-underline transition-colors hover:border-primary/50"
					>
						<span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
							<Icon name={category.icon} className="size-5" />
						</span>
						<span className="min-w-0">
							<span className="block font-semibold group-hover:text-primary">{category.title}</span>
							<span className="mt-0.5 block text-sm leading-snug text-muted-foreground">
								{category.summary}
							</span>
							<span className="mt-2 block text-xs text-muted-foreground tabular-nums">
								{category.groups.length} groups · {categoryFeatureCount(category)} features
							</span>
						</span>
					</a>
				))}
			</div>
		</div>
	);
}

export function FeatureCategory({ id }: { id: string }) {
	const category = featureCategories.find((c) => c.id === id);
	if (!category) return null;

	return (
		<div className="not-content grid gap-3 md:grid-cols-2">
			{category.groups.map((group) => (
				<section key={group.id} className="rounded-xl border bg-card p-4">
					<header className="flex items-start gap-3">
						<span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-foreground">
							<Icon name={group.icon} className="size-4" />
						</span>
						<div className="min-w-0">
							<h3 className="text-sm font-semibold text-foreground">{group.title}</h3>
							<p className="text-xs leading-snug text-muted-foreground">{group.summary}</p>
						</div>
					</header>
					{/* No Preflight, so list markers must be removed explicitly. */}
					<ul className="mt-3 flex list-none flex-wrap gap-1.5 p-0">
						{group.features.map((feature) => (
							<li key={featureName(feature)} className="m-0 list-none">
								<Badge
									variant="outline"
									className={
										isAddOn(feature)
											? 'border-dashed border-amber-500/50 text-amber-800 dark:text-amber-300'
											: 'font-normal text-foreground'
									}
									title={isAddOn(feature) ? 'Additional option — separately licensed' : undefined}
								>
									{featureName(feature)}
									{isAddOn(feature) && <span className="ml-1 text-[0.65rem] uppercase">add-on</span>}
								</Badge>
							</li>
						))}
					</ul>
				</section>
			))}
		</div>
	);
}
