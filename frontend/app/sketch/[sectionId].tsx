import { router, useLocalSearchParams } from "expo-router";
import { type ComponentRef, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  labelBox,
  SKETCH_H,
  SKETCH_W,
  SketchView,
} from "@/src/components/sketch-canvas";
import {
  Button,
  Ionicons,
  PressableScale,
  StackHeader,
} from "@/src/components/ui";
import { getTopic } from "@/src/data";
import {
  useSketches,
  type SketchLabel,
  type Stroke,
} from "@/src/store/sketches";
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
      for (let j = 1; j < k; j++)
        out.push([
          q[0] + ((p[0] - q[0]) * j) / k,
          q[1] + ((p[1] - q[1]) * j) / k,
        ]);
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
    const hit = (p: number[]) =>
      Math.hypot(p[0] - x, p[1] - y) <= r + s.width / 2;
    if (!pts.some(hit)) return [s];
    changed = true;
    const pieces: number[][][] = [[]];
    pts.forEach((p) =>
      hit(p)
        ? pieces[pieces.length - 1].length && pieces.push([])
        : pieces[pieces.length - 1].push(p.map((v) => Math.round(v))),
    );
    return pieces
      .filter((pc) => pc.length > 1)
      .map((pc) => ({ ...s, d: toPath(pc) }));
  });
  return changed ? next : strokes;
};

const ring = (x: number, y: number, r: number) =>
  `M${x - r} ${y} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`;

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
  const {
    sectionId,
    sketch: sketchId,
    bg,
  } = useLocalSearchParams<{
    sectionId: string;
    sketch?: string;
    bg?: string;
  }>();
  const { colors } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { getSketch, saveSketch, deleteSketch, loaded } = useSketches();
  const topicId = sectionId?.split("-")[0] ?? "";
  const section = getTopic(topicId)?.sections.find((s) => s.id === sectionId);
  const existing = sketchId ? getSketch(sectionId, sketchId) : undefined;

  const [strokes, setStrokes] = useState<Stroke[]>(existing?.strokes ?? []);
  const [labels, setLabels] = useState<SketchLabel[]>(existing?.labels ?? []);
  const [title, setTitle] = useState(existing?.title ?? "");
  // Saved sketches load from device storage asynchronously (e.g. after a refresh): copy them in once they arrive.
  const synced = useRef(!!existing || !sketchId);
  useEffect(() => {
    if (!synced.current && existing) {
      synced.current = true;
      setStrokes(existing.strokes);
      setLabels(existing.labels ?? []);
      setTitle(existing.title ?? "");
    }
  }, [existing]);
  const ready = loaded && (synced.current || !existing);
  const [live, setLive] = useState<Stroke | null>(null);
  const [ink, setInk] = useState(INKS[1]);
  const [size, setSize] = useState(SIZES[1]);
  const [mode, setMode] = useState<"draw" | "erase" | "text">("draw");
  const erasing = mode === "erase";
  // Label being typed: a new one at x,y, or an existing one (id) being edited.
  const [editing, setEditing] = useState<{
    id: string | null;
    x: number;
    y: number;
    text: string;
  } | null>(null);
  const [dirty, setDirty] = useState(false);
  const background = existing ? existing.bg : bg || null;

  const box = useRef({ x: 0, y: 0, w: 1, h: 1 });
  const canvasRef = useRef<ComponentRef<typeof View>>(null);
  const pts = useRef<number[][]>([]);
  const pen = useRef({ ink, size, mode });
  pen.current = { ink, size, mode };

  const point = (e: { nativeEvent: { pageX: number; pageY: number } }) => {
    const b = box.current;
    const x = ((e.nativeEvent.pageX - b.x) / b.w) * SKETCH_W;
    const y = ((e.nativeEvent.pageY - b.y) / b.h) * SKETCH_H;
    return [
      Math.round(Math.max(0, Math.min(SKETCH_W, x))),
      Math.round(Math.max(0, Math.min(SKETCH_H, y))),
    ];
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
  const history = useRef<{ s: Stroke[]; l: SketchLabel[] }[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const strokesRef = useRef(strokes);
  strokesRef.current = strokes;
  const labelsRef = useRef(labels);
  labelsRef.current = labels;
  const snapshot = () => {
    history.current = [
      ...history.current.slice(-49),
      { s: strokesRef.current, l: labelsRef.current },
    ];
    setCanUndo(true);
  };
  const undo = () => {
    const prev = history.current.pop();
    if (prev) {
      setStrokes(prev.s);
      setLabels(prev.l);
    }
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
          canvasRef.current?.measureInWindow(
            (x, y, w, h) => (box.current = { x, y, w, h }),
          );
          if (pen.current.mode === "text") {
            // Text tool: press on a label to drag it (or tap to edit it); press elsewhere to add a new label.
            const p = point(e);
            const hit = [...labelsRef.current].reverse().find((l) => {
              const b = labelBox(l);
              return (
                Math.abs(p[0] - l.x) <= b.w / 2 + 16 &&
                Math.abs(p[1] - l.y) <= b.h / 2 + 16
              );
            });
            drag.current = {
              id: hit?.id ?? null,
              start: p,
              moved: false,
              off: hit ? [hit.x - p[0], hit.y - p[1]] : [0, 0],
            };
            if (hit) snapshot();
            return;
          }
          snapshot();
          if (pen.current.mode === "erase") {
            erased.current = false;
            return erase(point(e));
          }
          pts.current = [point(e)];
          setLive({
            d: toPath(pts.current),
            color: pen.current.ink,
            width: pen.current.size,
          });
        },
        onPanResponderMove: (e) => {
          if (pen.current.mode === "text") {
            const dr = drag.current;
            const p = point(e);
            if (
              dr.id &&
              (dr.moved ||
                Math.hypot(p[0] - dr.start[0], p[1] - dr.start[1]) > 12)
            ) {
              dr.moved = true;
              setLabels((all) =>
                all.map((l) =>
                  l.id === dr.id
                    ? { ...l, x: p[0] + dr.off[0], y: p[1] + dr.off[1] }
                    : l,
                ),
              );
            }
            return;
          }
          if (pen.current.mode === "erase") return erase(point(e));
          pts.current.push(point(e));
          setLive({
            d: toPath(pts.current),
            color: pen.current.ink,
            width: pen.current.size,
          });
        },
        onPanResponderTerminate: () => release(),
        onPanResponderRelease: () => release(),
      }),
    [],
  );

  // End of a press (or a gesture the system cut off): finish the stroke / drag / erase cleanly.
  function release() {
    setLive(null);
    if (pen.current.mode === "text") {
      const dr = drag.current;
      if (dr.id && dr.moved) setDirty(true);
      else {
        if (dr.id) history.current.pop(); // just a tap: drop the drag snapshot
        setCanUndo(history.current.length > 0);
        const l = labelsRef.current.find((x) => x.id === dr.id);
        setEditing(
          l
            ? { id: l.id, x: l.x, y: l.y, text: l.text }
            : { id: null, x: dr.start[0], y: dr.start[1], text: "" },
        );
      }
      return;
    }
    if (pen.current.mode === "erase") {
      if (erased.current) setDirty(true);
      else history.current.pop(); // nothing erased: drop the snapshot
      setCanUndo(history.current.length > 0);
      return;
    }
    const s = {
      d: toPath(pts.current),
      color: pen.current.ink,
      width: pen.current.size,
    };
    pts.current = [];
    setStrokes((all) => [...all, s]);
    setDirty(true);
  }

  const drag = useRef<{
    id: string | null;
    start: number[];
    moved: boolean;
    off: number[];
  }>({ id: null, start: [0, 0], moved: false, off: [0, 0] });

  const saveLabel = () => {
    if (!editing) return;
    const text = editing.text.trim();
    snapshot();
    setLabels((all) =>
      editing.id
        ? text
          ? all.map((l) => (l.id === editing.id ? { ...l, text } : l))
          : all.filter((l) => l.id !== editing.id)
        : text
          ? [
              ...all,
              {
                id: `lb-${Date.now()}`,
                x: editing.x,
                y: editing.y,
                text,
                color: ink,
              },
            ]
          : all,
    );
    if (text || editing.id) setDirty(true);
    else history.current.pop();
    setCanUndo(history.current.length > 0);
    setEditing(null);
  };

  const deleteLabel = () => {
    if (!editing?.id) return setEditing(null);
    snapshot();
    setLabels((all) => all.filter((l) => l.id !== editing.id));
    setDirty(true);
    setEditing(null);
  };

  const leave = () =>
    router.canGoBack() ? router.back() : router.replace(`/topic/${topicId}`);

  const save = () => {
    const now = new Date().toISOString();
    saveSketch({
      id: existing?.id ?? `sk-${Date.now()}`,
      sectionId,
      topicId,
      title: title.trim() || undefined,
      bg: background,
      strokes,
      labels,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });
    leave();
  };

  const confirm = (
    title: string,
    message: string,
    ok: string,
    action: () => void,
  ) => {
    if (Platform.OS === "web") {
      if (window.confirm(`${title}\n${message}`)) action();
      return;
    }
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      { text: ok, style: "destructive", onPress: action },
    ]);
  };

  const close = () =>
    dirty
      ? confirm(
          "Leave without saving?",
          "Your changes to this sketch will be lost.",
          "Discard",
          leave,
        )
      : leave();

  const remove = () =>
    confirm("Delete this sketch?", "This can't be undone.", "Delete", () => {
      if (existing) deleteSketch(sectionId, existing.id);
      leave();
    });

  return (
    <View style={styles.root} testID="sketch-screen">
      <StackHeader
        title={existing ? "Edit sketch" : "New sketch"}
        subtitle={section?.title}
        onBack={close}
      />
      <View style={styles.titleWrap}>
        <Ionicons name="pricetag-outline" size={18} color={colors.muted} />
        <TextInput
          testID="sketch-title-input"
          value={title}
          onChangeText={(t) => {
            setTitle(t);
            setDirty(true);
          }}
          placeholder="Name this sketch (optional)"
          placeholderTextColor={colors.muted}
          style={styles.titleInput}
          maxLength={60}
          returnKeyType="done"
        />
      </View>
      {/* Fixed-height hint row so switching tools never moves the canvas under the finger. */}
      <Text
        style={styles.hint}
        numberOfLines={1}
        testID={mode === "text" ? "sketch-text-hint" : undefined}
      >
        {mode === "text"
          ? "Tap to add a label · drag to move · tap a label to edit"
          : " "}
      </Text>
      <View style={styles.canvasWrap}>
        <View
          ref={canvasRef}
          onLayout={() =>
            canvasRef.current?.measureInWindow(
              (x, y, w, h) => (box.current = { x, y, w, h }),
            )
          }
          style={styles.canvas}
          testID="sketch-canvas"
          {...responder.panHandlers}
        >
          <SketchView
            bg={background}
            strokes={strokes}
            labels={labels}
            live={live}
            selected={editing?.id}
          />
        </View>
      </View>

      <View
        style={[styles.tools, { paddingBottom: insets.bottom + spacing.md }]}
      >
        <View style={styles.row}>
          {INKS.map((c) => (
            <Pressable
              key={c}
              testID={`sketch-ink-${c.slice(1)}`}
              hitSlop={6}
              onPress={() => {
                setInk(c);
                if (mode === "erase") setMode("draw");
              }}
              style={[
                styles.swatch,
                { backgroundColor: c },
                ink === c && !erasing && styles.swatchOn,
              ]}
              accessibilityLabel={`Ink colour ${c}`}
            />
          ))}
          <View style={styles.divider} />
          {SIZES.map((w) => (
            <Pressable
              key={w}
              testID={`sketch-size-${w}`}
              onPress={() => setSize(w)}
              style={[
                styles.sizeBtn,
                size === w && { borderColor: colors.brandPrimary },
              ]}
              accessibilityLabel={`Pen size ${w}`}
            >
              <View
                style={{
                  width: w + 4,
                  height: w + 4,
                  borderRadius: 20,
                  backgroundColor: colors.onSurface,
                }}
              />
            </Pressable>
          ))}
        </View>
        <View style={styles.row}>
          <PressableScale
            testID="sketch-text-button"
            onPress={() => setMode((m) => (m === "text" ? "draw" : "text"))}
            style={[
              styles.tool,
              mode === "text" && {
                backgroundColor: colors.brandPrimary,
                borderRadius: radius.md,
              },
            ]}
          >
            <Ionicons
              name="text"
              size={20}
              color={mode === "text" ? colors.onBrandPrimary : colors.onSurface}
            />
            <Text
              style={[
                styles.toolText,
                mode === "text" && { color: colors.onBrandPrimary },
              ]}
            >
              Text
            </Text>
          </PressableScale>
          <PressableScale
            testID="sketch-eraser-button"
            onPress={() => setMode((m) => (m === "erase" ? "draw" : "erase"))}
            style={[
              styles.tool,
              erasing && {
                backgroundColor: colors.brandPrimary,
                borderRadius: radius.md,
              },
            ]}
          >
            <Ionicons
              name="bandage-outline"
              size={20}
              color={erasing ? colors.onBrandPrimary : colors.onSurface}
            />
            <Text
              style={[
                styles.toolText,
                erasing && { color: colors.onBrandPrimary },
              ]}
            >
              Eraser
            </Text>
          </PressableScale>
          <PressableScale
            testID="sketch-undo-button"
            disabled={!canUndo}
            onPress={undo}
            style={[styles.tool, !canUndo && { opacity: 0.4 }]}
          >
            <Ionicons name="arrow-undo" size={20} color={colors.onSurface} />
            <Text style={styles.toolText}>Undo</Text>
          </PressableScale>
          <PressableScale
            testID="sketch-clear-button"
            disabled={!strokes.length && !labels.length}
            onPress={() =>
              confirm(
                "Clear the page?",
                "All strokes and labels on this sketch will be removed.",
                "Clear",
                () => {
                  snapshot();
                  setStrokes([]);
                  setLabels([]);
                  setDirty(true);
                },
              )
            }
            style={[
              styles.tool,
              !strokes.length && !labels.length && { opacity: 0.4 },
            ]}
          >
            <Ionicons
              name="trash-bin-outline"
              size={20}
              color={colors.onSurface}
            />
            <Text style={styles.toolText}>Clear</Text>
          </PressableScale>
          {existing ? (
            <PressableScale
              testID="sketch-delete-button"
              onPress={remove}
              style={styles.tool}
            >
              <Ionicons name="trash" size={20} color={colors.error} />
              <Text style={[styles.toolText, { color: colors.error }]}>
                Delete
              </Text>
            </PressableScale>
          ) : null}
          <View style={{ flex: 1 }}>
            <Button
              testID="sketch-save-button"
              label="Save sketch"
              icon="save"
              onPress={save}
              disabled={
                !ready || (!existing && !strokes.length && !labels.length)
              }
            />
          </View>
        </View>
      </View>

      <Modal
        visible={!!editing}
        transparent
        animationType="fade"
        onRequestClose={() => setEditing(null)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setEditing(null)}
          testID="sketch-label-backdrop"
        >
          <Pressable style={styles.labelSheet} onPress={() => undefined}>
            <Text style={styles.sheetTitle}>
              {editing?.id ? "Edit label" : "Add a label"}
            </Text>
            <TextInput
              testID="sketch-label-input"
              autoFocus
              value={editing?.text ?? ""}
              onChangeText={(t) =>
                setEditing((e) => (e ? { ...e, text: t } : e))
              }
              placeholder="e.g. Portal vein"
              placeholderTextColor={colors.muted}
              style={styles.labelInput}
              maxLength={40}
              returnKeyType="done"
              onSubmitEditing={saveLabel}
            />
            <View style={styles.row}>
              {editing?.id ? (
                <PressableScale
                  testID="sketch-label-delete"
                  onPress={deleteLabel}
                  style={styles.tool}
                >
                  <Ionicons name="trash" size={20} color={colors.error} />
                  <Text style={[styles.toolText, { color: colors.error }]}>
                    Delete
                  </Text>
                </PressableScale>
              ) : null}
              <View style={{ flex: 1 }} />
              <Button
                testID="sketch-label-cancel"
                label="Cancel"
                variant="ghost"
                onPress={() => setEditing(null)}
              />
              <Button
                testID="sketch-label-save"
                label="Done"
                icon="checkmark"
                onPress={saveLabel}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface },
  titleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    borderRadius: radius.md,
    backgroundColor: c.surfaceTertiary,
  },
  titleInput: {
    flex: 1,
    fontFamily: fonts.text,
    fontSize: 15,
    color: c.onSurface,
    paddingVertical: spacing.sm,
  },
  hint: {
    fontFamily: fonts.text,
    fontSize: 12,
    lineHeight: 16,
    height: 16,
    color: c.muted,
    textAlign: "center",
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-start",
    paddingTop: 120,
    paddingHorizontal: spacing.lg,
  },
  labelSheet: {
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  sheetTitle: { fontFamily: fonts.display, fontSize: 18, color: c.onSurface },
  labelInput: {
    fontFamily: fonts.text,
    fontSize: 16,
    color: c.onSurface,
    borderWidth: 1.5,
    borderColor: c.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  canvasWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  canvas: {
    userSelect: "none",
    width: "100%",
    maxWidth: 520,
    maxHeight: "100%",
    aspectRatio: SKETCH_W / SKETCH_H,
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: c.border,
  },
  tools: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
    borderTopWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surfaceSecondary,
  },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  swatchOn: { borderColor: c.onSurface, transform: [{ scale: 1.15 }] },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: c.border,
    marginHorizontal: spacing.xs,
  },
  sizeBtn: {
    width: 44,
    height: 44,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  tool: {
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  toolText: { fontFamily: fonts.text, fontSize: 12, color: c.onSurface },
}));
