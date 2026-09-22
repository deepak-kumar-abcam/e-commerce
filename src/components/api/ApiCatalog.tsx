import { Badge } from '@/components/ui/badge';
import { API_BASE, loadSpecs, SPEC_DIR } from '@/lib/openapi.mjs';
import { cn } from '@/lib/utils';

/**
 * Overview of the generated API reference, computed from the YAML files at
 * build time. Static — no client directive needed.
 */

const specHref = (id: string) => `/${API_BASE}/${id.toLowerCase()}/`;

/** `com.danaher.rest.smb.FooResource` → `FooResource` */
const shortClass = (originClass?: string) => originClass?.split('.').pop();

const methodStyles: Record<string, string> = {
	GET: 'border-sky-500/40 bg-sky-500/15 text-sky-700 dark:text-sky-300',
	POST: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
	PUT: 'border-amber-500/40 bg-amber-500/15 text-amber-800 dark:text-amber-300',
	PATCH: 'border-violet-500/40 bg-violet-500/15 text-violet-700 dark:text-violet-300',
	DELETE: 'border-red-500/40 bg-red-500/15 text-red-700 dark:text-red-300',
};

function Method({ method }: { method: string }) {
	return (
		<Badge variant="outline" className={cn('w-16 font-mono', methodStyles[method])}>
			{method}
		</Badge>
	);
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
	return (
		<th className={cn('px-3 py-2.5 text-xs font-semibold tracking-wide uppercase', className)}>{children}</th>
	);
}

export function ApiSummary() {
	const specs = loadSpecs();
	const operations = specs.reduce((n, s) => n + s.operations.length, 0);
	const custom = specs.reduce((n, s) => n + s.customCount, 0);

	return (
		<div className="not-content flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border bg-card px-4 py-2.5 text-xs text-muted-foreground">
			<span>
				<span className="font-medium text-foreground">{specs.length}</span> APIs
			</span>
			<span>
				<span className="font-medium text-foreground">{operations}</span> operations
			</span>
			<span>
				<span className="font-medium text-foreground">{custom}</span> Danaher custom
			</span>
			<span>
				<span className="font-medium text-foreground">Source</span> <code>{SPEC_DIR}/</code>
			</span>
		</div>
	);
}

export function ApiTable() {
	const specs = loadSpecs();

	return (
		<div className="not-content overflow-x-auto rounded-xl border">
			<table className="w-full min-w-[32rem] border-collapse text-left text-sm">
				<thead>
					<tr className="border-b bg-muted/50">
						<Th>API</Th>
						<Th>Version</Th>
						<Th className="text-right">Operations</Th>
						<Th className="text-right">Custom</Th>
					</tr>
				</thead>
				<tbody>
					{specs.map((spec) => (
						<tr key={spec.id} className="border-b last:border-b-0">
							<td className="px-3 py-2 align-top">
								<a
									href={specHref(spec.id)}
									className="font-medium text-foreground no-underline hover:text-primary hover:underline"
								>
									{spec.label}
								</a>
								{spec.allCustom && (
									<Badge variant="outline" className="ml-2 border-primary/40 text-primary">
										Danaher
									</Badge>
								)}
							</td>
							<td className="px-3 py-2 align-top font-mono text-xs text-muted-foreground">{spec.version}</td>
							<td className="px-3 py-2 text-right align-top tabular-nums">{spec.operations.length}</td>
							<td className="px-3 py-2 text-right align-top tabular-nums">
								{spec.customCount > 0 ? spec.customCount : <span className="text-muted-foreground">—</span>}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export function CustomEndpoints() {
	const rows = loadSpecs().flatMap((spec) =>
		spec.operations.filter((op) => op.custom).map((op) => ({ spec, op }))
	);

	return (
		<div className="not-content overflow-x-auto rounded-xl border">
			<table className="w-full min-w-[44rem] border-collapse text-left text-sm">
				<thead>
					<tr className="border-b bg-muted/50">
						<Th>Endpoint</Th>
						<Th>API</Th>
						<Th>Resource class</Th>
					</tr>
				</thead>
				<tbody>
					{rows.map(({ spec, op }) => (
						<tr key={`${spec.id} ${op.method} ${op.path}`} className="border-b last:border-b-0">
							<td className="px-3 py-2 align-top">
								<div className="flex items-start gap-2">
									<Method method={op.method} />
									<div className="min-w-0">
										<code className="text-xs break-all text-foreground">{op.path}</code>
										{op.summary && <div className="text-xs text-muted-foreground">{op.summary}</div>}
									</div>
								</div>
							</td>
							<td className="px-3 py-2 align-top whitespace-nowrap">
								<a href={specHref(spec.id)} className="text-foreground no-underline hover:text-primary hover:underline">
									{spec.label}
								</a>
							</td>
							<td className="px-3 py-2 align-top font-mono text-xs text-muted-foreground" title={op.originClass}>
								{shortClass(op.originClass)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
