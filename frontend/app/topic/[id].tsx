import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SlideStrip } from "@/src/components/slides";
import { IconButton, Ionicons, PressableScale, ProgressBar, StackHeader } from "@/src/components/ui";
import { getTopic } from "@/src/data";
import { imageQuizCount } from "@/src/data/quiz";
import { topicProgress, useProgress } from "@/src/store/progress";
import { fonts, makeStyles, radius, spacing, useTheme } from "@/src/theme";

export default function TopicScreen() {
  const { id, tab: initialTab } = useLocalSearchParams<{ id: string; tab?: string }>();
  const topic = getTopic(id);
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();
  const { state, toggleRead, toggleBookmark, isBookmarked } = useProgress();
  const [tab, setTab] = useState<"notes" | "mnemonics">(initialTab === "mnemonics" ? "mnemonics" : "notes");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  if (!topic) {
    return (
      <View style={styles.root}>
        <StackHeader title="Topic not found" />
      </View>
    );
  }
  const accent = colors[topic.colorKey];
  const p = topicProgress(state, topic);
  const allCollapsed = topic.sections.every((s) => collapsed[s.id]);
  const toggleAll = () => setCollapsed(allCollapsed ? {} : Object.fromEntries(topic.sections.map((s) => [s.id, true])));
  const imageQuiz = state.quizzes[`${topic.id}:image`];
  const nImageQ = imageQuizCount(topic.id);

  return (
    <View style={styles.root} testID="topic-screen">
      <StackHeader title={topic.title} subtitle={topic.chapter} />
      <View style={styles.segWrap}>
        {(["notes", "mnemonics"] as const).map((k) => {
          const active = tab === k;
          return (
            <PressableScale key={k} testID={`topic-tab-${k}`} onPress={() => setTab(k)} style={[styles.seg, active && { backgroundColor: colors.surface }]}>
              <Text style={[styles.segText, active && { color: colors.onSurface }]}>{k === "notes" ? `Notes (${topic.sections.length})` : `Mnemonics (${topic.mnemonics.length})`}</Text>
            </PressableScale>
          );
        })}
      </View>
      {tab === "notes" ? (
        <PressableScale testID="toggle-collapse-all-button" onPress={toggleAll} style={styles.collapseAll}>
          <Ionicons name={allCollapsed ? "expand" : "contract"} size={18} color={colors.brandPrimary} />
          <Text style={[styles.collapseText, { color: colors.brandPrimary }]}>{allCollapsed ? "Expand all sections" : "Minimize all sections"}</Text>
        </PressableScale>
      ) : null}
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.progressCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.progressLabel}>Topic progress</Text>
            <Text style={styles.progressPct} testID="topic-progress-pct">
              {p.pct}%
            </Text>
          </View>
          <ProgressBar value={p.pct} color={accent} />
        </View>

        <View style={styles.actions}>
          <PressableScale testID="open-flashcards-button" onPress={() => router.push(`/flashcards/${topic.id}`)} style={[styles.action, { backgroundColor: accent }]}>
            <Ionicons name="albums" size={26} color={colors.onTopic} />
            <Text style={styles.actionTitle}>Flashcards</Text>
            <Text style={styles.actionSub}>
              {p.known}/{topic.flashcards.length} known
            </Text>
          </PressableScale>
          <PressableScale testID="open-quiz-button" onPress={() => router.push(`/quiz/${topic.id}`)} style={[styles.action, { backgroundColor: colors.brandSecondary }]}>
            <Ionicons name="help-circle" size={26} color={colors.onTopic} />
            <Text style={styles.actionTitle}>Quiz</Text>
            <Text style={styles.actionSub}>{p.quiz ? `Best ${p.quiz.best}/${p.quiz.total}` : `20 of ${topic.quiz.length} questions`}</Text>
          </PressableScale>
        </View>
        {nImageQ > 0 ? (
          <PressableScale testID="open-image-quiz-button" onPress={() => router.push(`/quiz/${topic.id}?mode=image&count=${nImageQ}`)} style={[styles.imageQuizBtn, { borderColor: accent }]}>
            <Ionicons name="images" size={22} color={accent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Image quiz</Text>
              <Text style={styles.progressLabel}>{imageQuiz ? `Best ${imageQuiz.best}/${imageQuiz.total}` : `Name the finding in ${nImageQ} slide images`}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </PressableScale>
        ) : null}

        {tab === "notes"
          ? topic.sections.map((s, i) => {
              const read = !!state.readSections[s.id];
              const saved = isBookmarked(s.id);
              const isCollapsed = !!collapsed[s.id];
              return (
                <Animated.View entering={FadeIn.delay(Math.min(i, 10) * 30)} key={s.id} style={[styles.section, read && { borderColor: colors.success }]} testID={`section-card-${s.id}`}>
                  <View style={styles.rowBetween}>
                    <PressableScale testID={`section-collapse-${s.id}`} onPress={() => setCollapsed((c) => ({ ...c, [s.id]: !c[s.id] }))} style={styles.sectionHead}>
                      <Ionicons name={isCollapsed ? "chevron-forward" : "chevron-down"} size={18} color={colors.muted} />
                      <Text style={styles.sectionTitle}>{s.title}</Text>
                      {read && isCollapsed ? <Ionicons name="checkmark-circle" size={18} color={colors.success} /> : null}
                    </PressableScale>
                    <IconButton
                      testID={`section-bookmark-${s.id}`}
                      name={saved ? "bookmark" : "bookmark-outline"}
                      color={saved ? colors.brandPrimary : colors.onSurfaceTertiary}
                      bg={colors.surfaceTertiary}
                      onPress={() => toggleBookmark("section", s.id, topic.id)}
                    />
                  </View>
                  {isCollapsed ? null : (
                  <>
                  {s.points.map((pt, j) => (
                    <View key={j} style={styles.point}>
                      <View style={[styles.dot, { backgroundColor: accent }]} />
                      <Text style={styles.pointText}>{pt}</Text>
                    </View>
                  ))}
                  <SlideStrip images={s.images} testIDPrefix={`section-${s.id}`} />
                  <PressableScale
                    testID={`section-read-toggle-${s.id}`}
                    onPress={() => toggleRead(s.id)}
                    style={[styles.readBtn, read ? { backgroundColor: colors.success } : { backgroundColor: colors.surfaceTertiary }]}
                  >
                    <Ionicons name={read ? "checkmark-circle" : "ellipse-outline"} size={20} color={read ? colors.onSuccess : colors.onSurfaceTertiary} />
                    <Text style={[styles.readText, { color: read ? colors.onSuccess : colors.onSurfaceTertiary }]}>{read ? "Read" : "Mark as read"}</Text>
                  </PressableScale>
                  </>
                  )}
                </Animated.View>
              );
            })
          : topic.mnemonics.map((m, i) => {
              const saved = isBookmarked(m.id);
              return (
                <Animated.View entering={FadeIn.delay(i * 40)} key={m.id} style={[styles.mnemonic, { backgroundColor: accent + "26", borderColor: accent }]} testID={`mnemonic-card-${m.id}`}>
                  <View style={styles.rowBetween}>
                    <View style={styles.mnemonicHead}>
                      <Ionicons name="bulb" size={20} color={accent} />
                      <Text style={styles.mnemonicTitle}>{m.title}</Text>
                    </View>
                    <IconButton
                      testID={`mnemonic-bookmark-${m.id}`}
                      name={saved ? "bookmark" : "bookmark-outline"}
                      color={saved ? colors.brandPrimary : colors.onSurfaceTertiary}
                      bg={colors.surface}
                      onPress={() => toggleBookmark("mnemonic", m.id, topic.id)}
                    />
                  </View>
                  <Text style={styles.device}>{m.device}</Text>
                  <Text style={styles.meaning}>{m.meaning}</Text>
                </Animated.View>
              );
            })}
        {tab === "mnemonics" ? <Text style={styles.footnote}>Some mnemonics are memory aids created for this guide.</Text> : null}
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface },
  segWrap: { flexDirection: "row", margin: spacing.lg, marginBottom: spacing.sm, padding: spacing.xs, backgroundColor: c.surfaceTertiary, borderRadius: radius.pill },
  seg: { flex: 1, minHeight: 40, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  segText: { fontFamily: fonts.text, fontSize: 14, fontWeight: "700", color: c.muted },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, gap: spacing.md },
  progressCard: { backgroundColor: c.surfaceSecondary, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  progressLabel: { fontFamily: fonts.text, fontSize: 14, color: c.muted },
  progressPct: { fontFamily: fonts.display, fontSize: 18, fontWeight: "500", color: c.onSurface },
  actions: { flexDirection: "row", gap: spacing.md },
  action: { flex: 1, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.xs, minHeight: 110 },
  actionTitle: { fontFamily: fonts.display, fontSize: 18, fontWeight: "500", color: c.onTopic },
  actionSub: { fontFamily: fonts.text, fontSize: 13, color: c.onTopic },
  section: { backgroundColor: c.surfaceSecondary, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm, borderWidth: 1.5, borderColor: "transparent" },
  sectionHead: { flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.sm, minHeight: 44 },
  collapseAll: { flexDirection: "row", alignItems: "center", gap: spacing.sm, alignSelf: "flex-end", minHeight: 44, paddingHorizontal: spacing.lg },
  collapseText: { fontFamily: fonts.text, fontSize: 14, fontWeight: "700" },
  imageQuizBtn: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1.5, backgroundColor: c.surfaceSecondary },
  sectionTitle: { fontFamily: fonts.display, fontSize: 18, fontWeight: "500", color: c.onSurface, flex: 1 },
  point: { flexDirection: "row", gap: spacing.sm, alignItems: "flex-start" },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 8 },
  pointText: { flex: 1, fontFamily: fonts.text, fontSize: 16, lineHeight: 24, color: c.onSurfaceSecondary },
  readBtn: { flexDirection: "row", alignItems: "center", gap: spacing.sm, alignSelf: "flex-start", minHeight: 44, paddingHorizontal: spacing.lg, borderRadius: radius.pill, marginTop: spacing.xs },
  readText: { fontFamily: fonts.text, fontSize: 14, fontWeight: "700" },
  mnemonic: { borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm, borderWidth: 1.5 },
  mnemonicHead: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flex: 1 },
  mnemonicTitle: { fontFamily: fonts.text, fontSize: 13, fontWeight: "700", color: c.onSurfaceTertiary, textTransform: "uppercase", letterSpacing: 0.8, flex: 1 },
  device: { fontFamily: fonts.display, fontSize: 22, fontWeight: "500", color: c.onSurface },
  meaning: { fontFamily: fonts.text, fontSize: 15, lineHeight: 22, color: c.onSurfaceSecondary },
  footnote: { fontFamily: fonts.text, fontSize: 12, color: c.muted, textAlign: "center" },
}));
