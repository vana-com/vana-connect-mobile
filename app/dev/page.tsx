import Link from "next/link";

const links = [
  { href: "/dev/audit", label: "Audit trail", description: "Every approve/deny logged to Supabase" },
  { href: "/dev/reset", label: "Reset local data", description: "Clears connection state from localStorage" },
  { href: "/dev/components", label: "Component preview", description: "Every UI primitive in isolation" },
  { href: "/memory", label: "Memory screen", description: "" },
  { href: "/connections", label: "Connections screen", description: "" },
  { href: "/discover", label: "Discover screen", description: "" },
];

export default function DevPage() {
  return (
    <div className="p-6 max-w-lg mx-auto">
      <p className="text-fine font-semibold uppercase tracking-[0.05em] text-muted-foreground mb-1">Dev</p>
      <h1 className="text-heading font-semibold mb-6">Vana Connect</h1>
      <ul className="space-y-2">
        {links.map(({ href, label, description }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex items-baseline justify-between px-4 py-3 rounded-card border border-border hover:bg-muted transition-colors"
            >
              <span className="text-button font-medium">{label}</span>
              {description && (
                <span className="text-fine text-muted-foreground ml-3 text-right">{description}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
