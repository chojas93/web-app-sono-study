import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, IconName, Ionicons, ProgressBar } from "@/src/components/ui";
import { getTopic, topics, totals } from "@/src/data";
import { usesNativeTabs } from "@/src/navigation";
import { currentStreak, topicProgress, useProgress } from "@/src/store/progress";
import { fonts, makeStyles, radius, spacing, useTheme } from "@/src/theme";

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const bottomChrome = usesNativeTabs ? insets.bottom : 0;
  const styles = useStyles();
  const { colors } = useTheme();
  const { state, resetAll } = useProgress();
  const [confirm, setConfirm] = useState(false);

  const per = topics.map((t) => ({ t, p: topicProgress(state, t) }));
  const overall = Math.round(per.reduce((n, x) => n + x.p.pct, 0) / topics.length);
  const read = per.reduce((n, x) => n + x.p.read, 0);
  const known = per.reduce((n, x) => n + x.p.known, 0);
  const quizzes = Object.values(state.quizzes).reduce((n, q) => n + q.attempts, 0);

  const stats: { icon: IconName; label: string; value: string; id: string }[] = [
    { id: "notes", icon: "document-text", label: "Notes read", value: `${read}/${totals.sections}` },
    { id: "cards", icon: "albums", label: "Cards known", value: `${known}/${totals.cards}` },
    { id: "quizzes", icon: "trophy", label: "Quizzes taken", value: String(quizzes) },
    { id: "streak", icon: "flame", label: "Day streak", value: String(currentStreak(state)) },
  ];

  return (
    <View style={styles.root} testID="progress-screen">
      <View style={{ paddingTop: insets.top + spacing.sm, paddingBottom: spacing.md, backgroundColor: colors.surface }}>
        <Text style={styles.title}>Progress</Text>
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomChrome + spacing.xl }]}>
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>Overall mastery</Text>
          <Text style={styles.heroValue} testID="progress-overall-value">
            {overall}%
          </Text>
          <ProgressBar value={overall} color={colors.brandSecondary} height={12} />
        </View>

        <View style={styles.grid}>
          {stats.map((s) => (
            <View key={s.id} style={styles.stat} testID={`stat-${s.id}`}>
              <Ionicons name={s.icon} size={22} color={colors.brandPrimary} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.h2}>By topic</Text>
        {per.map(({ t, p }) => {
          const accent = colors[t.colorKey];
          return (
            <View key={t.id} style={styles.topicRow} testID={`progress-topic-${t.id}`}>
              <View style={styles.topicHead}>
                <Text style={styles.topicTitle}>{t.title}</Text>
                <Text style={styles.topicPct}>{p.pct}%</Text>
              </View>
              <Mini label="Notes" value={p.read} total={t.sections.length} color={accent} />
              <Mini label="Cards" value={p.known} total={t.flashcards.length} color={accent} />
              <Mini label="Best quiz" value={p.quiz?.best ?? 0} total={p.quiz?.total ?? 20} color={accent} />
            </View>
          );
        })}

        <Text style={styles.h2}>Recent quizzes</Text>
        {state.history.length === 0 ? (
          <Text style={styles.muted} testID="no-quiz-history">
            Take a quiz to see your scores here.
          </Text>
        ) : (
          state.history.slice(0, 8).map((h, i) => (
            <View key={h.at + i} style={styles.historyRow} testID={`quiz-history-${i}`}>
              <Text style={styles.historyTopic}>
                {h.topicId === "weak" ? `Weak spot review (${h.total})` : h.topicId.startsWith("mock") ? `Mock exam (${h.total})` : `${getTopic(h.topicId.split(":")[0])?.title ?? ""}${h.topicId.endsWith(":image") ? " · Image quiz" : h.topicId.endsWith(":book") ? " · Textbook" : ""}`}
              </Text>
              <Text style={[styles.historyScore, { color: h.score / h.total >= 0.7 ? colors.success : colors.onSurface }]}>
                {h.score}/{h.total}
              </Text>
            </View>
          ))
        )}

        <View style={styles.localNote}>
          <Ionicons name="lock-closed-outline" size={16} color={colors.muted} />
          <Text style={styles.muted}>All progress is stored privately on this device — nothing is sent to the cloud.</Text>
        </View>
        <Button testID="reset-progress-button" label="Reset all progress" icon="refresh" variant="ghost" onPress={() => setConfirm(true)} />
      </ScrollView>

      <Modal visible={confirm} transparent animationType="fade" onRequestClose={() => setConfirm(false)}>
        <Pressable style={styles.scrim} onPress={() => setConfirm(false)} testID="reset-modal-scrim">
          <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]} testID="reset-confirm-modal">
            <Text style={styles.sheetTitle}>Reset all progress?</Text>
            <Text style={styles.muted}>This clears notes read, flashcard states, quiz scores, bookmarks and your streak on this device.</Text>
            <Button
              testID="reset-confirm-button"
              label="Yes, reset"
              variant="primary"
              onPress={() => {
                resetAll();
                setConfirm(false);
              }}
            />
            <Button testID="reset-cancel-button" label="Cancel" variant="secondary" onPress={() => setConfirm(false)} />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function Mini({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const styles = useStyles();
  return (
    <View style={styles.mini}>
      <Text style={styles.miniLabel}>{label}</Text>
      <View style={{ flex: 1 }}>
        <ProgressBar value={(value / total) * 100} color={color} height={6} />
      </View>
      <Text style={styles.miniValue}>
        {value}/{total}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface },
  title: { fontFamily: fonts.display, fontSize: 30, fontWeight: "500", color: c.onSurface, paddingHorizontal: spacing.lg },
  content: { paddingHorizontal: spacing.lg, gap: spacing.md },
  hero: { backgroundColor: c.brandPrimary, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.sm },
  heroLabel: { fontFamily: fonts.text, fontSize: 14, color: c.onBrandPrimary },
  heroValue: { fontFamily: fonts.display, fontSize: 48, fontWeight: "500", color: c.onBrandPrimary },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  stat: { flexBasis: "47%", flexGrow: 1, backgroundColor: c.surfaceSecondary, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.xs },
  statValue: { fontFamily: fonts.display, fontSize: 24, fontWeight: "500", color: c.onSurface },
  statLabel: { fontFamily: fonts.text, fontSize: 13, color: c.muted },
  h2: { fontFamily: fonts.display, fontSize: 20, fontWeight: "500", color: c.onSurface, marginTop: spacing.sm },
  topicRow: { backgroundColor: c.surfaceSecondary, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm },
  topicHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  topicTitle: { fontFamily: fonts.display, fontSize: 16, fontWeight: "500", color: c.onSurface, flex: 1 },
  topicPct: { fontFamily: fonts.display, fontSize: 16, fontWeight: "500", color: c.onSurface },
  mini: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  miniLabel: { fontFamily: fonts.text, fontSize: 12, color: c.muted, width: 70 },
  miniValue: { fontFamily: fonts.text, fontSize: 12, color: c.onSurfaceTertiary, width: 40, textAlign: "right" },
  historyRow: { flexDirection: "row", justifyContent: "space-between", backgroundColor: c.surfaceSecondary, borderRadius: radius.md, padding: spacing.md },
  historyTopic: { fontFamily: fonts.text, fontSize: 14, color: c.onSurface, flex: 1 },
  historyScore: { fontFamily: fonts.display, fontSize: 16, fontWeight: "500" },
  muted: { fontFamily: fonts.text, fontSize: 14, color: c.muted, lineHeight: 20, flexShrink: 1 },
  localNote: { flexDirection: "row", gap: spacing.sm, alignItems: "center", marginTop: spacing.md },
  scrim: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: { backgroundColor: c.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.xl, gap: spacing.md },
  sheetTitle: { fontFamily: fonts.display, fontSize: 22, fontWeight: "500", color: c.onSurface },
}));
