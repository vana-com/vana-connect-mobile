import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

export default function ComponentsPage() {
  return (
    <div className="p-6 max-w-lg mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/dev" className="text-small text-muted-foreground hover:text-foreground">← Dev</Link>
        <h1 className="text-heading font-semibold">Components</h1>
      </div>

      {/* Buttons */}
      <section className="space-y-3">
        <p className="text-fine font-semibold uppercase tracking-[0.05em] text-muted-foreground">Buttons</p>
        <div className="flex flex-wrap gap-2">
          <Button>Default</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="accent">Accent</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="xs">Extra small</Button>
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
        <Button fullWidth>Full width</Button>
      </section>

      {/* Cards */}
      <section className="space-y-3">
        <p className="text-fine font-semibold uppercase tracking-[0.05em] text-muted-foreground">Card</p>
        <Card>
          <CardHeader>
            <CardTitle>Card title</CardTitle>
            <CardDescription>Supporting description text</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-small text-muted-foreground">Card body content goes here.</p>
          </CardContent>
        </Card>
      </section>

      {/* Skeletons */}
      <section className="space-y-3">
        <p className="text-fine font-semibold uppercase tracking-[0.05em] text-muted-foreground">Skeleton</p>
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </section>

      {/* Inputs */}
      <section className="space-y-3">
        <p className="text-fine font-semibold uppercase tracking-[0.05em] text-muted-foreground">Input</p>
        <Input placeholder="Email address" type="email" />
        <Input placeholder="Disabled" disabled />
      </section>

      {/* Typography */}
      <section className="space-y-2">
        <p className="text-fine font-semibold uppercase tracking-[0.05em] text-muted-foreground">Type scale</p>
        {[
          ["text-hero", "Hero 54px"],
          ["text-display", "Display 40px"],
          ["text-title", "Title 32px"],
          ["text-heading", "Heading 24px"],
          ["text-xlarge", "XLarge 18px"],
          ["text-body", "Body 15px"],
          ["text-small", "Small 13.5px"],
          ["text-fine", "Fine 12px"],
          ["text-pill", "Pill 10px"],
        ].map(([cls, label]) => (
          <p key={cls} className={`${cls} font-medium`}>{label}</p>
        ))}
      </section>

      {/* Colors */}
      <section className="space-y-2">
        <p className="text-fine font-semibold uppercase tracking-[0.05em] text-muted-foreground">Accent scale</p>
        <div className="flex h-8 rounded-card overflow-hidden">
          {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
            <div key={n} className="flex-1" style={{ background: `var(--accent-${n})` }} title={`accent-${n}`} />
          ))}
        </div>
        <div className="flex h-8 rounded-card overflow-hidden">
          {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
            <div key={n} className="flex-1" style={{ background: `var(--stonebeige-${n})` }} title={`stonebeige-${n}`} />
          ))}
        </div>
      </section>
    </div>
  );
}
