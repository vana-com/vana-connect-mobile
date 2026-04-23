"use client";

import { useState, useMemo } from "react";
import { ScreenHeader } from "@/components/layout/screen-header";
import { AppCard } from "@/components/discover/app-card";
import { AppDetailSheet } from "@/components/discover/app-detail-sheet";
import { cn } from "@/lib/utils";
import { APPS, type AppCategory, type DiscoverApp } from "@/lib/data/apps";

const CATEGORIES: { id: AppCategory | "all"; label: string }[] = [
  { id: "all",            label: "ALL" },
  { id: "agents",         label: "AGENTS" },
  { id: "productivity",   label: "TOOLS" },
  { id: "entertainment",  label: "FUN" },
  { id: "tools",          label: "SERIOUS" },
];

export default function DiscoverPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<AppCategory | "all">("all");
  const [selectedApp, setSelectedApp] = useState<DiscoverApp | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filtered = useMemo(() => {
    return APPS.filter((app) => {
      const matchCat = activeCategory === "all" || app.category === activeCategory;
      const matchSearch =
        !search ||
        app.name.toLowerCase().includes(search.toLowerCase()) ||
        app.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [search, activeCategory]);

  const featured = filtered.filter((a) => a.featured);
  const rest = filtered.filter((a) => !a.featured);

  function openApp(app: DiscoverApp) {
    setSelectedApp(app);
    setDetailOpen(true);
  }

  return (
    <>
      <ScreenHeader title="DISCOVER" eyebrow="BRING YOUR STUFF HERE" />

      <main className="flex-1 overflow-y-auto">
        {/* Hero */}
        <div className="px-inset pt-4 pb-3 border-b-[3px] border-real-black">
          <p className="font-display font-black text-subtitle uppercase leading-[1] tracking-tight mb-4">
            What will you do with it?
          </p>
          {/* Search */}
          <div className="relative">
            <input
              type="search"
              placeholder="SEARCH APPS"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-[48px] border-[3px] border-real-black bg-background pl-4 pr-10 font-mono text-small uppercase tracking-wide placeholder:text-muted-foreground focus:outline-none focus:ring-[3px] focus:ring-ring"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-small text-muted-foreground pointer-events-none">
              ↓
            </span>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar px-inset py-3 border-b-[3px] border-real-black">
          {CATEGORIES.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveCategory(id)}
              className={cn(
                "shrink-0 border-[2px] border-real-black px-3 py-1.5 font-mono text-small font-bold uppercase tracking-wide",
                "transition-[transform,box-shadow] duration-[80ms]",
                activeCategory === id
                  ? "bg-real-black [color:var(--background)] shadow-[2px_2px_0_#E63946]"
                  : "bg-background text-foreground hover:bg-muted"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Featured */}
        {featured.length > 0 && (
          <section className="px-inset pt-4 pb-2">
            <p className="font-mono text-fine font-bold uppercase tracking-widest text-muted-foreground mb-3">
              FEATURED
            </p>
            <div className="space-y-3">
              {featured.map((app, i) => (
                <AppCard key={app.id} app={app} lotNumber={i + 1} onTap={openApp} />
              ))}
            </div>
          </section>
        )}

        {/* All apps */}
        {rest.length > 0 && (
          <section className="px-inset pt-4 pb-8">
            {featured.length > 0 && (
              <p className="font-mono text-fine font-bold uppercase tracking-widest text-muted-foreground mb-3">
                ALL APPS
              </p>
            )}

            <div className="space-y-3">

              {rest.map((app, i) => (
                <AppCard key={app.id} app={app} lotNumber={featured.length + i + 1} onTap={openApp} />
              ))}
            </div>
          </section>
        )}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-inset text-center">
            <p className="font-display font-black text-subtitle uppercase mb-2">NOTHING.</p>
            <p className="font-mono text-small text-muted-foreground uppercase tracking-wide">
              Try a different search.
            </p>
          </div>
        )}
      </main>

      <AppDetailSheet
        app={selectedApp}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </>
  );
}
