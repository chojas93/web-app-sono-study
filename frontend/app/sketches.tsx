import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TextInput, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SketchView } from "@/src/components/sketch-canvas";
import { Ionicons, PressableScale, StackHeader } from "@/src/components/ui";
import { sectionById, topics } from "@/src/data";
import { type Sketch, useSketches } from "@/src/store/sketches";
import { fonts, makeStyles, radius, spacing, useTheme } from "@/src/theme";

// All saved sketches in one place, grouped by chapter (in chapter order), newest first.
export default function SketchGallery() {
  const { sketches, loaded } = useSketches();
  const { colors } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const cardW = (Math.min(width, 600) - spacing.lg * 2 - spacing.sm * 2) / 3;
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  // Search matches the sketch name, its labels, the section and the chapter.
  const matches = (sk: Sketch, topicTitle: string) =>
    !q || [sk.title ?? "", sectionById[sk.sectionId]?.title ?? "", topicTitle, ...(sk.labels ?? []).map((l) => l.text)].some((t) => t.toLowerCase().includes(q));

  const groups = topics
    .map((t) => ({
      topic: t,
      items: t.sections
        .flatMap((s) => sketches[s.id] ?? [])
        .filter((sk) => matches(sk, t.title))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    }))
    .filter((g) => g.items.length);
  const total = Object.values(sketches).reduce((n, l) => n + l.length, 0);

  return (
    <View style={styles.root} testID="sketch-gallery-screen">
      <StackHeader title="My sketches" subtitle={loaded ? `${total} saved sketch${total === 1 ? "" : "es"}` : undefined} />
      {total ? (
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            testID="sketch-gallery-search"
            value={query}
            onChangeText={setQuery}
            placeholder="Search sketch names and labels"
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
            autoCorrect={false}
            returnKeyType="search"
          />
        </View>
      ) : null}
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        {loaded && total > 0 && !groups.length ? (
          <Text style={styles.emptyText} testID="sketch-gallery-no-results">
            No sketches match “{query.trim()}”.
          </Text>
        ) : null}
        {loaded && !total ? (
          <View style={styles.empty} testID="sketch-gallery-empty">
            <View style={styles.emptyIcon}>
              <Ionicons name="brush" size={36} color={colors.brandPrimary} />
            </View>
            <Text style={styles.emptyTitle}>No sketches yet</Text>
            <Text style={styles.emptyText}>Open any chapter&apos;s notes and tap “New sketch” under a section to draw on a blank page or over a picture.</Text>
          </View>
        ) : null}
        {groups.map(({ topic, items }) => {
          const accent = colors[topic.colorKey];
          return (
            <View key={topic.id} style={styles.group} testID={`sketch-gallery-topic-${topic.id}`}>
              <PressableScale testID={`sketch-gallery-open-topic-${topic.id}`} onPress={() => router.push(`/topic/${topic.id}`)} style={styles.groupHead}>
                <View style={[styles.dot, { backgroundColor: accent }]} />
                <Text style={styles.groupTitle} numberOfLines={1}>
                  {topic.title}
                </Text>
                <Text style={styles.count}>{items.length}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
              </PressableScale>
              <View style={styles.grid}>
                {items.map((s) => (
                  <PressableScale key={s.id} testID={`sketch-gallery-item-${s.id}`} onPress={() => router.push(`/sketch/${s.sectionId}?sketch=${s.id}`)} style={{ width: cardW }}>
                    <View style={[styles.thumb, { borderColor: accent + "66" }]}>
                      <SketchView bg={s.bg} strokes={s.strokes} labels={s.labels} />
                    </View>
                    <Text style={styles.caption} numberOfLines={2} testID={`sketch-gallery-title-${s.id}`}>
                      {s.title || sectionById[s.sectionId]?.title || "Notes"}
                    </Text>
                    {s.title ? (
                      <Text style={styles.date} numberOfLines={1}>
                        {sectionById[s.sectionId]?.title}
                      </Text>
                    ) : null}
                    <Text style={styles.date}>{new Date(s.updatedAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</Text>
                  </PressableScale>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface },
  search: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginHorizontal: spacing.lg, paddingHorizontal: spacing.md, minHeight: 44, borderRadius: radius.pill, backgroundColor: c.surfaceTertiary },
  searchInput: { flex: 1, fontFamily: fonts.text, fontSize: 15, color: c.onSurface, paddingVertical: spacing.sm },
  content: { padding: spacing.lg, gap: spacing.xl, width: "100%", maxWidth: 600, alignSelf: "center" },
  group: { gap: spacing.md },
  groupHead: { flexDirection: "row", alignItems: "center", gap: spacing.sm, minHeight: 44 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  groupTitle: { flex: 1, fontFamily: fonts.display, fontSize: 18, color: c.onSurface },
  count: { fontFamily: fonts.text, fontSize: 14, color: c.muted },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  thumb: { borderRadius: radius.md, overflow: "hidden", borderWidth: 1.5 },
  caption: { fontFamily: fonts.text, fontSize: 12, color: c.onSurface, marginTop: spacing.xs },
  date: { fontFamily: fonts.text, fontSize: 11, color: c.muted },
  empty: { alignItems: "center", gap: spacing.md, paddingTop: spacing.xl * 2, paddingHorizontal: spacing.lg },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", backgroundColor: c.surfaceTertiary },
  emptyTitle: { fontFamily: fonts.display, fontSize: 20, color: c.onSurface },
  emptyText: { fontFamily: fonts.text, fontSize: 14, color: c.muted, textAlign: "center", lineHeight: 20 },
}));
