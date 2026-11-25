import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { storage } from "@/src/utils/storage";

// Sketches are saved on this device only (vector strokes, so they stay small and sharp).
const KEY = "sono_study_sketches_v1";

export type Stroke = { d: string; color: string; width: number };
export type SketchLabel = { id: string; x: number; y: number; text: string; color: string; ax?: number; ay?: number }; // ax/ay = arrow tip
export type Sketch = {
  id: string;
  sectionId: string;
  topicId: string;
  title?: string;
  bg: string | null;
  strokes: Stroke[];
  labels?: SketchLabel[];
  createdAt: string;
  updatedAt: string;
};

type Ctx = {
  sketches: Record<string, Sketch[]>; // by section id, newest first
  loaded: boolean;
  saveSketch: (s: Sketch) => void;
  deleteSketch: (sectionId: string, id: string) => void;
  getSketch: (sectionId: string, id: string) => Sketch | undefined;
};

const SketchContext = createContext<Ctx | null>(null);

export function SketchProvider({ children }: { children: ReactNode }) {
  const [sketches, setSketches] = useState<Record<string, Sketch[]>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    storage.getItem(KEY, null as string | null).then((raw) => {
      if (raw) {
        try {
          setSketches(JSON.parse(raw));
        } catch {
          // corrupted data: start fresh
        }
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) storage.setItem(KEY, JSON.stringify(sketches));
  }, [sketches, loaded]);

  const saveSketch = useCallback((s: Sketch) => {
    setSketches((all) => {
      const list = all[s.sectionId] ?? [];
      const rest = list.filter((x) => x.id !== s.id);
      return { ...all, [s.sectionId]: [s, ...rest] };
    });
  }, []);

  const deleteSketch = useCallback((sectionId: string, id: string) => {
    setSketches((all) => ({ ...all, [sectionId]: (all[sectionId] ?? []).filter((x) => x.id !== id) }));
  }, []);

  const getSketch = useCallback((sectionId: string, id: string) => sketches[sectionId]?.find((x) => x.id === id), [sketches]);

  const value = useMemo(() => ({ sketches, loaded, saveSketch, deleteSketch, getSketch }), [sketches, loaded, saveSketch, deleteSketch, getSketch]);
  return <SketchContext.Provider value={value}>{children}</SketchContext.Provider>;
}

export function useSketches() {
  const ctx = useContext(SketchContext);
  if (!ctx) throw new Error("useSketches must be used inside SketchProvider");
  return ctx;
}
