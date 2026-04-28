import { readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const FLOW_PATH = join(process.cwd(), "docs/flows/260428-vana-mobile-production-flow-map.excalidraw");

function unavailable() {
  return NextResponse.json({ error: "Not available in production" }, { status: 404 });
}

function isExcalidrawScene(value: unknown): value is {
  type: string;
  elements: unknown[];
  appState?: unknown;
  files?: unknown;
} {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    value.type === "excalidraw" &&
    "elements" in value &&
    Array.isArray(value.elements)
  );
}

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return unavailable();
  }

  const [contents, fileStat] = await Promise.all([readFile(FLOW_PATH, "utf8"), stat(FLOW_PATH)]);
  return NextResponse.json({
    path: FLOW_PATH,
    mtimeMs: fileStat.mtimeMs,
    scene: JSON.parse(contents),
  });
}

export async function PUT(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return unavailable();
  }

  const body = await request.json();
  const scene = body?.scene;

  if (!isExcalidrawScene(scene)) {
    return NextResponse.json({ error: "Invalid Excalidraw scene" }, { status: 400 });
  }

  await writeFile(FLOW_PATH, `${JSON.stringify(scene, null, 2)}\n`);
  const fileStat = await stat(FLOW_PATH);

  return NextResponse.json({
    path: FLOW_PATH,
    mtimeMs: fileStat.mtimeMs,
  });
}
