"use client";

import { Excalidraw, CaptureUpdateAction, serializeAsJSON } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
  ExcalidrawProps,
} from "@excalidraw/excalidraw/types";

type Scene = ExcalidrawInitialDataState & {
  type: "excalidraw";
  elements: NonNullable<ExcalidrawInitialDataState["elements"]>;
};

type SceneResponse = {
  path: string;
  mtimeMs: number;
  scene: Scene;
};

type SaveState = "loading" | "synced" | "saving" | "remote update" | "error";
type ChangeHandler = NonNullable<ExcalidrawProps["onChange"]>;

const POLL_INTERVAL_MS = 1000;
const SAVE_DEBOUNCE_MS = 700;

async function loadScene(): Promise<SceneResponse> {
  const response = await fetch("/api/dev/excalidraw", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load canvas: ${response.status}`);
  }
  return response.json();
}

async function saveScene(scene: Scene): Promise<{ mtimeMs: number }> {
  const response = await fetch("/api/dev/excalidraw", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scene }),
  });
  if (!response.ok) {
    throw new Error(`Failed to save canvas: ${response.status}`);
  }
  return response.json();
}

export default function ExcalidrawSyncCanvas() {
  const [scene, setScene] = useState<Scene | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("loading");
  const [message, setMessage] = useState("Loading repo canvas");
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const mtimeRef = useRef(0);
  const applyingRemoteRef = useRef(false);
  const saveTimerRef = useRef<number | null>(null);

  const applyRemoteScene = useCallback((next: SceneResponse) => {
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    mtimeRef.current = next.mtimeMs;
    setScene(next.scene);

    if (!apiRef.current) {
      return;
    }

    applyingRemoteRef.current = true;
    apiRef.current.updateScene({
      elements: next.scene.elements,
      appState: (next.scene.appState ?? null) as Parameters<ExcalidrawImperativeAPI["updateScene"]>[0]["appState"],
      captureUpdate: CaptureUpdateAction.NEVER,
    });
    if (next.scene.files) {
      apiRef.current.addFiles(Object.values(next.scene.files) as Parameters<ExcalidrawImperativeAPI["addFiles"]>[0]);
    }
    window.setTimeout(() => {
      applyingRemoteRef.current = false;
    }, 0);
  }, []);

  useEffect(() => {
    let cancelled = false;

    loadScene()
      .then((next) => {
        if (cancelled) {
          return;
        }
        applyRemoteScene(next);
        setSaveState("synced");
        setMessage("Synced with repo file");
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }
        setSaveState("error");
        setMessage(error instanceof Error ? error.message : "Failed to load canvas");
      });

    return () => {
      cancelled = true;
    };
  }, [applyRemoteScene]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      loadScene()
        .then((next) => {
          if (next.mtimeMs <= mtimeRef.current) {
            return;
          }
          setSaveState("remote update");
          setMessage("Loaded repo file change");
          applyRemoteScene(next);
          window.setTimeout(() => {
            setSaveState("synced");
            setMessage("Synced with repo file");
          }, 900);
        })
        .catch((error) => {
          setSaveState("error");
          setMessage(error instanceof Error ? error.message : "Failed to poll repo file");
        });
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [applyRemoteScene]);

  const handleChange = useCallback<ChangeHandler>((elements, appState, files) => {
    if (applyingRemoteRef.current || !scene) {
      return;
    }

    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(() => {
      setSaveState("saving");
      setMessage("Saving to repo file");

      const serialized = serializeAsJSON(elements, appState, files, "local");
      const nextScene = JSON.parse(serialized) as Scene;

      saveScene(nextScene)
        .then(({ mtimeMs }) => {
          mtimeRef.current = mtimeMs;
          setScene(nextScene);
          setSaveState("synced");
          setMessage("Saved to repo file");
        })
        .catch((error) => {
          setSaveState("error");
          setMessage(error instanceof Error ? error.message : "Failed to save canvas");
        });
    }, SAVE_DEBOUNCE_MS);
  }, [scene]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      {scene ? (
        <Excalidraw
          excalidrawAPI={(api) => {
            apiRef.current = api;
          }}
          initialData={scene}
          name="260428-vana-mobile-production-flow-map"
          onChange={handleChange}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-muted-foreground text-small">{message}</div>
      )}
      <div className="pointer-events-none absolute right-3 bottom-3 rounded-card border border-border bg-background/90 px-3 py-2 text-fine text-muted-foreground shadow-sm">
        {saveState}: {message}
      </div>
    </div>
  );
}
