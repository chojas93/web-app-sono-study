import { router, useLocalSearchParams } from "expo-router";
import { type ComponentRef, useEffect, useMemo, useRef, useState } from "react";
import { Alert, PanResponder, Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SKETCH_H, SKETCH_W, SketchView } from "@/src/components/sketch-canvas";
import { Button, Ionicons, PressableScale, StackHeader } from "@/src/components/ui";
import { getTopic } from "@/src/data";
import { useSketches, type Stroke } from "@/src/store/sketches";
import { makeStyles, radius, spacing, useTheme, fonts } from "@/src/theme";

// Ink colours are fixed (the paper is always white), so they don't follow the app theme.
const INKS = ["#1A1918", "#D64545", "#2F6FDE", "#2E9E5B", "#E8A317"];
const SIZES = [4, 9, 18];
const ERASER_R: Record<number, number> = { 4: 22, 9: 40, 18: 70 }; // eraser radius (sketch units) per size

// The points a stroke was drawn from: toPath writes "M p0 Q p1 mid Q p2 mid … L pn", so only the M point, each Q's
// first pair and the final L point are real (the midpoints are derived). Gaps are filled so none is wider than `step`.
const strokePoints = (d: string, step: number) => {
  const raw: number[][] = [];
  for (const [, cmd, args] of d.matchAll(/([MQLl])([^MQLl]*)/g)) {
    const n = (args.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
    if (cmd === "M" || cmd === "Q" || cmd === "L") raw.push([n[0], n[1]]);
  }
  const out: number[][] = [];
  raw.forEach((p, i) => {
    const q = raw[i - 1];
    if (q) {
      const k = Math.floor(Math.hypot(p[0] - q[0], p[1] - q[1]) / step);
      for (let j = 1; j < k; j++) out.push([q[0] + ((p[0] - q[0]) * j) / k, q[1] + ((p[1] - q[1]) * j) / k]);
    }
    out.push(p);
  });
  return out;
};

// Erase only the part of each stroke under the eraser: strokes are split into the pieces that remain.
const eraseAt = (strokes: Stroke[], x: number, y: number, r: number) => {
  let changed = false;
  const next = strokes.flatMap((s) => {
    const pts = strokePoints(s.d, r / 3);
    const hit = (p: number[]) => Math.hypot(p[0] - x, p[1] - y) <= r + s.width / 2;
    if (!pts.some(hit)) return [s];
    changed = true;
    const pieces: number[][][] = [[]];
    pts.forEach((p) => (hit(p) ? pieces[pieces.length - 1].length && pieces.push([]) : pieces[pieces.length - 1].push(p.map((v) => Math.round(v)))));
    return pieces.filter((pc) => pc.length > 1).map((pc) => ({ ...s, d: toPath(pc) }));
  });
  return changed ? next : strokes;
};

const ring = (x: number, y: number, r: number) => `M${x - r} ${y} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`;

const toPath = (pts: number[][]) => {
  if (pts.length === 1) return `M${pts[0][0]} ${pts[0][1]} l0.1 0`;
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2;
    const my = (pts[i][1] + pts[i + 1][1]) / 2;
    d += ` Q${pts[i][0]} ${pts[i][1]} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  const l = pts[pts.length - 1];
  return d + ` L${l[0]} ${l[1]}`;
};

export default function SketchScreen() {
  const { sectionId, sketch: sketchId, bg } = useLocalSearchParams<{ sectionId: string; sketch?: string; bg?: string }>();
  const { colors } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { getSketch, saveSketch, deleteSketch, loaded } = useSketches();
  const topicId = sectionId?.split("-")[0] ?? "";
  const section = getTopic(topicId)?.sections.find((s) => s.id === sectionId);
  const existing = sketchId ? getSketch(sectionId, sketchId) : undefined;

  const [strokes, setStrokes] = useState<Stroke[]>(existing?.strokes ?? []);
  // Saved sketches load from device storage asynchronously (e.g. after a refresh): copy them in once they arrive.
  const synced = useRef(!!existing || !sketchId);
  useEffect(() => {
    if (!synced.current && existing) {
      synced.current = true;
      setStrokes(existing.strokes);
    }
  }, [existing]);
  const ready = loaded && (synced.current || !existing);
  const [live, setLive] = useState<Stroke | null>(null);
  const [ink, setInk] = useState(INKS[1]);
  const [size, setSize] = useState(SIZES[1]);
  const [erasing, setErasing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const background = existing ? existing.bg : bg || null;

  const box = useRef({ x: 0, y: 0, w: 1, h: 1 });
  const canvasRef = useRef<ComponentRef<typeof View>>(null);
  const pts = useRef<number[][]>([]);
  const pen = useRef({ ink, size, erasing });
  pen.current = { ink, size, erasing };

  const point = (e: { nativeEvent: { pageX: number; pageY: number } }) => {
    const b = box.current;
    const x = ((e.nativeEvent.pageX - b.x) / b.w) * SKETCH_W;
    const y = ((e.nativeEvent.pageY - b.y) / b.h) * SKETCH_H;
    return [Math.round(Math.max(0, Math.min(SKETCH_W, x))), Math.round(Math.max(0, Math.min(SKETCH_H, y)))];
  };

  // Eraser: remove what's under the finger and show a grey ring where it is.
  const erased = useRef(false);
  const erase = (p: number[]) => {
    const r = ERASER_R[pen.current.size];
    setLive({ d: ring(p[0], p[1], r), color: "#9AA0A6", width: 3 });
    setStrokes((all) => {
      const next = eraseAt(all, p[0], p[1], r);
      if (next !== all) erased.current = true;
      return next;
    });
  };

  // Undo history: a snapshot before every stroke, erase drag and clear.
  const history = useRef<Stroke[][]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const strokesRef = useRef(strokes);
  strokesRef.current = strokes;
  const snapshot = () => {
    history.current = [...history.current.slice(-49), strokesRef.current];
    setCanUndo(true);
  };
  const undo = () => {
    const prev = history.current.pop();
    if (prev) setStrokes(prev);
    setCanUndo(history.current.length > 0);
    setDirty(true);
  };

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (e) => {
          canvasRef.current?.measureInWindow((x, y, w, h) => (box.current = { x, y, w, h }));
          snapshot();
          if (pen.current.erasing) {
            erased.current = false;
            return erase(point(e));
          }
          pts.current = [point(e)];
          setLive({ d: toPath(pts.current), color: pen.current.ink, width: pen.current.size });
        },
        onPanResponderMove: (e) => {
          if (pen.current.erasing) return erase(point(e));
          pts.current.push(point(e));
          setLive({ d: toPath(pts.current), color: pen.current.ink, width: pen.current.size });
        },
        onPanResponderRelease: () => {
          setLive(null);
          if (pen.current.erasing) {
            if (erased.current) setDirty(true);
            else history.current.pop(); // nothing erased: drop the snapshot
            setCanUndo(history.current.length > 0);
            return;
          }
          const s = { d: toPath(pts.current), color: pen.current.ink, width: pen.current.size };
          pts.current = [];
          setStrokes((all) => [...all, s]);
          setDirty(true);
        },
      }),
    [],
  );

  const leave = () => (router.canGoBack() ? router.back() : router.replace(`/topic/${topicId}`));

  const save = () => {
    const now = new Date().toISOString();
    saveSketch({
      id: existing?.id ?? `sk-${Date.now()}`,
      sectionId,
      topicId,
      bg: background,
      strokes,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });
    leave();
  };

  const confirm = (title: string, message: string, ok: string, action: () => void) => {
    if (Platform.OS === "web") {
      if (window.confirm(`${title}\n${message}`)) action();
      return;
    }
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      { text: ok, style: "destructive", onPress: action },
    ]);
  };

  const close = () => (dirty ? confirm("Leave without saving?", "Your new strokes will be lost.", "Discard", leave) : leave());

  const remove = () =>
    confirm("Delete this sketch?", "This can't be undone.", "Delete", () => {
      if (existing) deleteSketch(sectionId, existing.id);
      leave();
    });

  return (
    <View style={styles.root} testID="sketch-screen">
      <StackHeader title={existing ? "Edit sketch" : "New sketch"} subtitle={section?.title} onBack={close} />
      <View style={styles.canvasWrap}>
        <View
          ref={canvasRef}
          onLayout={() => canvasRef.current?.measureInWindow((x, y, w, h) => (box.current = { x, y, w, h }))}
          style={styles.canvas}
          testID="sketch-canvas"
          {...responder.panHandlers}
        >
          <SketchView bg={background} strokes={strokes} live={live} />
        </View>
      </View>

      <View style={[styles.tools, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.row}>
          {INKS.map((c) => (
            <Pressable key={c} testID={`sketch-ink-${c.slice(1)}`} hitSlop={6} onPress={() => { setInk(c); setErasing(false); }} style={[styles.swatch, { backgroundColor: c }, ink === c && !erasing && styles.swatchOn]} accessibilityLabel={`Ink colour ${c}`} />
          ))}
          <View style={styles.divider} />
          {SIZES.map((w) => (
            <Pressable key={w} testID={`sketch-size-${w}`} onPress={() => setSize(w)} style={[styles.sizeBtn, size === w && { borderColor: colors.brandPrimary }]} accessibilityLabel={`Pen size ${w}`}>
              <View style={{ width: w + 4, height: w + 4, borderRadius: 20, backgroundColor: colors.onSurface }} />
            </Pressable>
          ))}
        </View>
        <View style={styles.row}>
          <PressableScale testID="sketch-eraser-button" onPress={() => setErasing((v) => !v)} style={[styles.tool, erasing && { backgroundColor: colors.brandPrimary, borderRadius: radius.md }]}>
            <Ionicons name="bandage-outline" size={20} color={erasing ? colors.onBrandPrimary : colors.onSurface} />
            <Text style={[styles.toolText, erasing && { color: colors.onBrandPrimary }]}>Eraser</Text>
          </PressableScale>
          <PressableScale testID="sketch-undo-button" disabled={!canUndo} onPress={undo} style={[styles.tool, !canUndo && { opacity: 0.4 }]}>
            <Ionicons name="arrow-undo" size={20} color={colors.onSurface} />
            <Text style={styles.toolText}>Undo</Text>
          </PressableScale>
          <PressableScale testID="sketch-clear-button" disabled={!strokes.length} onPress={() => confirm("Clear the page?", "All strokes on this sketch will be removed.", "Clear", () => { snapshot(); setStrokes([]); setDirty(true); })} style={[styles.tool, !strokes.length && { opacity: 0.4 }]}>
            <Ionicons name="trash-bin-outline" size={20} color={colors.onSurface} />
            <Text style={styles.toolText}>Clear</Text>
          </PressableScale>
          {existing ? (
            <PressableScale testID="sketch-delete-button" onPress={remove} style={styles.tool}>
              <Ionicons name="trash" size={20} color={colors.error} />
              <Text style={[styles.toolText, { color: colors.error }]}>Delete</Text>
            </PressableScale>
          ) : null}
          <View style={{ flex: 1 }}>
            <Button testID="sketch-save-button" label="Save sketch" icon="save" onPress={save} disabled={!ready || (!existing && !strokes.length)} />
          </View>
        </View>
      </View>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface },
  canvasWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.md },
  canvas: { width: "100%", maxWidth: 520, maxHeight: "100%", aspectRatio: SKETCH_W / SKETCH_H, borderRadius: radius.md, overflow: "hidden", borderWidth: 1, borderColor: c.border },
  tools: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.md, borderTopWidth: 1, borderColor: c.border, backgroundColor: c.surfaceSecondary },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  swatch: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: "transparent" },
  swatchOn: { borderColor: c.onSurface, transform: [{ scale: 1.15 }] },
  divider: { width: 1, height: 28, backgroundColor: c.border, marginHorizontal: spacing.xs },
  sizeBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "transparent" },
  tool: { minHeight: 44, paddingHorizontal: spacing.sm, alignItems: "center", justifyContent: "center" },
  toolText: { fontFamily: fonts.text, fontSize: 12, color: c.onSurface },
}));
