import { router } from "expo-router";
import { useState } from "react";
import { FlatList, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconButton, Ionicons, PressableScale } from "@/src/components/ui";
import { cardById, getTopic, mnemonicById, sectionById } from "@/src/data";
import { usesNativeTabs } from "@/src/navigation";
import { Bookmark, BookmarkType, useProgress } from "@/src/store/progress";
import { fonts, makeStyles, radius, spacing, useTheme } from "@/src/theme";

const FILTERS: { key: "all" | BookmarkType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "section", label: "Notes" },
  { key: "card", label: "Flashcards" },
  { key: "mnemonic", label: "Mnemonics" },
];

export default function Bookmarks() {
  const insets = useSafeAreaInsets();
  const bottomChrome = usesNativeTabs ? insets.bottom : 0;
  const styles = useStyles();
  const { colors } = useTheme();
  const { state } = useProgress();
  const [filter, setFilter] = useState<"all" | BookmarkType>("all");
  const items = state.bookmarks.filter((b) => filter === "all" || b.type === filter);

  return (
    <View style={styles.root} testID="bookmarks-screen">
      <View style={{ paddingTop: insets.top + spacing.sm, backgroundColor: colors.surface }}>
        <Text style={styles.title}>Saved</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} contentContainerStyle={styles.chipContent}>
          {FILTERS.map((f) => {
            const active = f.key === filter;
            return (
              <PressableScale
                key={f.key}
                testID={`bookmark-filter-${f.key}`}
                onPress={() => setFilter(f.key)}
                style={[styles.chip, active && { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary }]}
              >
                <Text style={[styles.chipText, active && { color: colors.onBrandPrimary }]}>{f.label}</Text>
              </PressableScale>
            );
          })}
        </ScrollView>
      </View>
      <FlatList
        data={items}
        keyExtractor={(b) => b.refId}
        contentContainerStyle={[styles.list, { paddingBottom: bottomChrome + spacing.xl }]}
        ListEmptyComponent={
          <View style={styles.empty} testID="bookmarks-empty">
            <View style={styles.emptyIcon}>
              <Ionicons name="bookmark-outline" size={36} color={colors.brandPrimary} />
            </View>
            <Text style={styles.emptyTitle}>Nothing saved yet</Text>
            <Text style={styles.emptyText}>Tap the bookmark icon on any note, flashcard or mnemonic to keep it here for quick review.</Text>
          </View>
        }
        renderItem={({ item }) => <BookmarkRow b={item} />}
      />
    </View>
  );
}

function BookmarkRow({ b }: { b: Bookmark }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { toggleBookmark } = useProgress();
  const topic = getTopic(b.topicId);
  const accent = topic ? colors[topic.colorKey] : colors.brandPrimary;
  let label = "";
  let title = "";
  let body = "";
  if (b.type === "section") {
    const s = sectionById[b.refId];
    if (!s) return null;
    label = "Note";
    title = s.title;
    body = s.points.map((p) => `• ${p}`).join("\n");
  } else if (b.type === "card") {
    const c = cardById[b.refId];
    if (!c) return null;
    label = "Flashcard";
    title = c.front;
    body = c.back;
  } else {
    const m = mnemonicById[b.refId];
    if (!m) return null;
    label = "Mnemonic";
    title = `${m.title}: ${m.device}`;
    body = m.meaning;
  }
  return (
    <View style={[styles.row, { borderLeftColor: accent }]} testID={`bookmark-item-${b.refId}`}>
      <View style={styles.rowTop}>
        <Text style={styles.rowLabel}>
          {label} · {topic?.title}
        </Text>
        <IconButton testID={`bookmark-remove-${b.refId}`} name="bookmark" color={colors.brandPrimary} bg={colors.surfaceTertiary} onPress={() => toggleBookmark(b.type, b.refId, b.topicId)} />
      </View>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={styles.rowBody}>{body}</Text>
      <PressableScale testID={`bookmark-open-${b.refId}`} onPress={() => router.push(b.type === "mnemonic" ? `/topic/${b.topicId}?tab=mnemonics` : `/topic/${b.topicId}`)} style={styles.open}>
        <Text style={[styles.openText, { color: colors.brandPrimary }]}>Open topic</Text>
        <Ionicons name="arrow-forward" size={16} color={colors.brandPrimary} />
      </PressableScale>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface },
  title: { fontFamily: fonts.display, fontSize: 30, fontWeight: "500", color: c.onSurface, paddingHorizontal: spacing.lg },
  chipRow: { height: 56, flexGrow: 0 },
  chipContent: { gap: spacing.sm, paddingHorizontal: spacing.lg, alignItems: "center" },
  chip: {
    height: 36,
    flexShrink: 0,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: c.borderStrong,
    backgroundColor: c.surfaceSecondary,
    justifyContent: "center",
  },
  chipText: { fontFamily: fonts.text, fontSize: 14, fontWeight: "600", color: c.onSurface },
  list: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, gap: spacing.md, flexGrow: 1 },
  row: { backgroundColor: c.surfaceSecondary, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm, borderLeftWidth: 6 },
  rowTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowLabel: { fontFamily: fonts.text, fontSize: 12, color: c.muted, textTransform: "uppercase", letterSpacing: 1, flex: 1 },
  rowTitle: { fontFamily: fonts.display, fontSize: 17, fontWeight: "500", color: c.onSurface },
  rowBody: { fontFamily: fonts.text, fontSize: 15, lineHeight: 22, color: c.onSurfaceSecondary },
  open: { flexDirection: "row", alignItems: "center", gap: spacing.xs, alignSelf: "flex-start", minHeight: 44 },
  openText: { fontFamily: fonts.text, fontSize: 14, fontWeight: "700" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xxl, gap: spacing.md },
  emptyIcon: { width: 80, height: 80, borderRadius: radius.pill, backgroundColor: c.brandTertiary, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontFamily: fonts.display, fontSize: 20, fontWeight: "500", color: c.onSurface },
  emptyText: { fontFamily: fonts.text, fontSize: 15, color: c.muted, textAlign: "center", lineHeight: 22 },
}));
