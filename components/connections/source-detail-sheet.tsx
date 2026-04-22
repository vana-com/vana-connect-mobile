"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from "@/components/ui/drawer";
import type { ConnectionState, DataSource } from "@/lib/data/connections";
import { NODE_ITEMS, type NodeItem } from "@/lib/data/node-items";
import SEED from "@/lib/data/seed-memory";

interface SourceDetailSheetProps {
  source: DataSource | null;
  currentState: ConnectionState;
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
  onDeepConnect: () => void;
}

interface MemoryEntry {
  nodeId: string;
  nodeName: string;
  clusterName: string;
  itemIdx: number;
  item: NodeItem;
}

function getMemoriesForSource(sourceNames: string[]): MemoryEntry[] {
  if (!sourceNames.length) return [];
  const nodeMap = Object.fromEntries(SEED.nodes.map(n => [n.id, n]));
  const clusterMap = Object.fromEntries(SEED.clusters.map(c => [c.id, c]));
  const results: MemoryEntry[] = [];
  for (const [nodeId, items] of Object.entries(NODE_ITEMS)) {
    items.forEach((item, idx) => {
      if (item.source && sourceNames.includes(item.source)) {
        const node = nodeMap[nodeId];
        const cluster = node ? clusterMap[node.cluster] : null;
        results.push({
          nodeId,
          nodeName: node?.name ?? nodeId.toUpperCase(),
          clusterName: cluster?.name ?? "",
          itemIdx: idx,
          item,
        });
      }
    });
  }
  return results;
}

export function SourceDetailSheet({
  source,
  currentState,
  isOpen,
  onClose,
  onConnect,
  onDeepConnect,
}: SourceDetailSheetProps) {
  const [connecting, setConnecting] = useState(false);
  const [edits, setEdits] = useState<Map<string, NodeItem>>(new Map());
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ title: string; content: string }>({ title: "", content: "" });

  const memories = useMemo(
    () => getMemoriesForSource(source?.sourceNames ?? []),
    [source]
  );

  if (!source) return null;
  const isConnected = currentState !== "none";
  const isDeep = currentState === "deep";
  const connectionDepth = isDeep ? "DEEP" : "LITE";

  async function handleConnect() {
    setConnecting(true);
    await new Promise(r => setTimeout(r, 1200));
    setConnecting(false);
    onConnect();
  }

  function startEdit(key: string, item: NodeItem) {
    setDraft({ title: item.title, content: item.content });
    setEditingKey(key);
  }

  function saveEdit(key: string) {
    setEdits(prev => {
      const next = new Map(prev);
      const base = memories.find(m => `${m.nodeId}:${m.itemIdx}` === key)?.item;
      next.set(key, { ...(base ?? {}), ...draft });
      return next;
    });
    setEditingKey(null);
  }

  function getItem(entry: MemoryEntry): NodeItem {
    const key = `${entry.nodeId}:${entry.itemIdx}`;
    return edits.get(key) ?? entry.item;
  }

  return (
    <Drawer open={isOpen} onOpenChange={o => !o && onClose()}>
      <DrawerContent className="max-h-[88vh] flex flex-col">

        {/* ── Header ───────────────────────────────────────────── */}
        <div className="border-b-[3px] border-real-black px-4 pt-5 pb-4 flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-[32px] leading-none">{source.emoji}</span>
              <div>
                <p className="font-display font-black text-heading uppercase leading-tight tracking-tight">
                  {source.name}
                </p>
                <p className="font-mono text-fine text-muted-foreground uppercase tracking-wide mt-0.5">
                  {source.description}
                </p>
              </div>
            </div>

            {/* Depth badge / toggle — LITE is always active on mobile; DEEP always opens desktop prompt */}
            {isConnected && (
              <div className="flex border-[2px] border-real-black flex-shrink-0 mt-0.5">
                <button
                  className="px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest cursor-default bg-real-black [color:var(--background)]"
                >
                  LITE
                </button>
                <button
                  onClick={onDeepConnect}
                  className="px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest border-l-[2px] border-real-black bg-transparent text-real-black cursor-pointer hover:bg-black/8 active:bg-real-black active:[color:var(--background)]"
                >
                  DEEP
                </button>
              </div>
            )}
          </div>

          {/* Last synced */}
          {isConnected && source.lastSynced && (
            <div className="mt-3 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-acid-green" />
              <span className="font-mono text-fine uppercase tracking-widest text-muted-foreground">
                {connectionDepth} · Last synced {source.lastSynced}
              </span>
            </div>
          )}
        </div>

        {/* ── Scrollable body ──────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto min-h-0">

          {/* Pulling scopes */}
          <div className="px-4 py-3 border-b-[2px] border-real-black/20">
            <p className="font-mono text-fine font-bold uppercase tracking-widest text-muted-foreground mb-2">
              {isConnected ? "PULLING" : "WILL PULL"}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {source.liteScopes.map(scope => (
                <span key={scope} className="font-mono text-fine uppercase tracking-wide border-[2px] border-real-black px-2 py-0.5">
                  {scope}
                </span>
              ))}
            </div>
          </div>

          {/* Memories — only shown once connected */}
          {isConnected && (
          <div className="px-4 pt-3 pb-2">
            <p className="font-mono text-fine font-bold uppercase tracking-widest text-muted-foreground mb-3">
              MEMORIES FROM {source.name.toUpperCase()}
              <span className="ml-2 opacity-50">({memories.length})</span>
            </p>

            {memories.length === 0 ? (
              <p className="font-mono text-fine text-muted-foreground uppercase tracking-wide py-4 text-center border-[2px] border-dashed border-real-black/20">
                No memories synced from this source yet.
              </p>
            ) : (
              memories.map(entry => {
                const key = `${entry.nodeId}:${entry.itemIdx}`;
                const item = getItem(entry);
                const isEditing = editingKey === key;
                return (
                  <div key={key} className="border-b-[2px] border-real-black/15 py-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="font-mono text-[9px] font-bold uppercase tracking-widest border-[1.5px] border-real-black px-1.5 py-0.5">
                        {entry.clusterName}
                      </span>
                      <span className="font-mono text-[9px] font-bold uppercase tracking-widest opacity-50">
                        {entry.nodeName}
                      </span>
                    </div>

                    {isEditing ? (
                      <div className="flex flex-col gap-2">
                        <input
                          autoFocus
                          value={draft.title}
                          onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
                          className="w-full font-sans text-small font-bold uppercase tracking-tight border-[2px] border-real-black bg-black/5 px-2 py-1.5 outline-none"
                        />
                        <textarea
                          value={draft.content}
                          rows={3}
                          onChange={e => setDraft(d => ({ ...d, content: e.target.value }))}
                          className="w-full font-mono text-fine border-[2px] border-real-black bg-black/5 px-2 py-1.5 outline-none resize-none leading-relaxed"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdit(key)}
                            className="px-3 py-1.5 font-mono text-fine font-bold uppercase tracking-wide border-[2px] border-real-black bg-real-black [color:var(--background)] cursor-pointer"
                          >
                            SAVE
                          </button>
                          <button
                            onClick={() => setEditingKey(null)}
                            className="px-3 py-1.5 font-mono text-fine font-bold uppercase tracking-wide border-[2px] border-real-black/40 cursor-pointer bg-transparent"
                          >
                            CANCEL
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-sans text-small font-bold uppercase tracking-tight leading-snug">{item.title}</p>
                          <button
                            onClick={() => startEdit(key, item)}
                            className="shrink-0 w-[22px] h-[22px] flex items-center justify-center border-[1.5px] border-real-black/25 bg-black/8 cursor-pointer text-[11px] mt-0.5"
                          >
                            ✎
                          </button>
                        </div>
                        <p className="font-mono text-fine text-muted-foreground leading-relaxed mt-1">{item.content}</p>
                        {item.meta && (
                          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60 mt-1.5">{item.meta}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
          )}

        </div>

        {/* ── Footer ───────────────────────────────────────────── */}
        <DrawerFooter className="flex-shrink-0 border-t-[3px] border-real-black pt-3">
          {!isConnected ? (
            <Button fullWidth onClick={handleConnect} disabled={connecting}>
              {connecting ? "CONNECTING..." : `CONNECT ${source.name.toUpperCase()}`}
            </Button>
          ) : (
            <Button fullWidth variant="outline" onClick={onClose}>
              DONE
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
