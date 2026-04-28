import Link from "next/link";
import { notFound } from "next/navigation";
import { ExcalidrawSyncLoader } from "@/components/dev/excalidraw-sync-loader";

export default function DevExcalidrawPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main className="h-dvh overflow-hidden bg-background">
      <div className="flex h-12 items-center justify-between border-border border-b px-4">
        <div className="flex items-center gap-3">
          <Link href="/dev" className="text-muted-foreground text-small hover:text-foreground">
            Dev
          </Link>
          <h1 className="font-semibold text-button">Flow map</h1>
        </div>
        <p className="text-fine text-muted-foreground">docs/flows/260428-vana-mobile-production-flow-map.excalidraw</p>
      </div>
      <div className="h-[calc(100dvh-3rem)]">
        <ExcalidrawSyncLoader />
      </div>
    </main>
  );
}
