import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Ionicons, PressableScale, StackHeader } from "@/src/components/ui";
import { midtermQuestions, midtermSections } from "@/src/data/midterm";
import { midtermMissed } from "@/src/data/quiz";
import { useProgress } from "@/src/store/progress";
import { fonts, makeStyles, radius, spacing, useTheme } from "@/src/theme";

export default function MidtermScreen() {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();
  const { state } = useProgress();
  const nMissed = midtermMissed(state.missed).length;
  const rows = [{ key: "all", label: "Full midterm (all sections)", count: midtermQuestions.length }].concat(
    midtermSections.map((s) => ({ key: s, label: s, count: midtermQuestions.filter((q) => q.section === s).length })),
  );

  return (
    <View style={styles.root} testID="midterm-screen">
      <StackHeader title="Midterm Quiz 1" subtitle="Personal review" />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.info}>
          <Ionicons name="school" size={22} color={colors.brandPrimary} />
          <Text style={styles.infoText}>
            Your class midterm, kept separate from the textbook chapters. After each answer you will see why every choice is right or wrong.
          </Text>
        </View>
        <PressableScale
          testID="midterm-missed-review-button"
          onPress={() => router.push("/quiz/midterm?topics=missed")}
          style={[styles.row, styles.missedRow, { opacity: nMissed ? 1 : 0.6 }]}
        >
          <Ionicons name="refresh-circle" size={28} color={colors.error} />
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Review missed questions</Text>
            <Text style={styles.rowSub} testID="midterm-missed-count">
              {nMissed ? `Retry ${nMissed} midterm question${nMissed === 1 ? "" : "s"} you got wrong` : "Midterm questions you miss will appear here"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.muted} />
        </PressableScale>
        {rows.map((r) => {
          const rec = state.quizzes[r.key === "all" ? "midterm" : `midterm:${r.key}`];
          return (
            <PressableScale key={r.key} testID={`midterm-section-${r.key}`} onPress={() => router.push(`/quiz/midterm?topics=${encodeURIComponent(r.key)}`)} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{r.label}</Text>
                <Text style={styles.rowSub}>
                  {r.count} questions{rec ? ` · Best ${rec.best}/${rec.total}` : ""}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.muted} />
            </PressableScale>
          );
        })}
        <Text style={styles.note}>The quiz PDF has no answer key, so the answers and explanations were written by AI from standard sonography references. Check them against your class notes.</Text>
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface },
  content: { padding: spacing.lg, gap: spacing.md },
  info: { flexDirection: "row", gap: spacing.md, backgroundColor: c.brandTertiary, borderRadius: radius.lg, padding: spacing.lg },
  infoText: { flex: 1, fontFamily: fonts.text, fontSize: 14, lineHeight: 20, color: c.onBrandTertiary },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: c.surfaceSecondary, borderRadius: radius.lg, padding: spacing.lg, minHeight: 64 },
  missedRow: { borderWidth: 1.5, borderColor: c.error },
  rowTitle: { fontFamily: fonts.display, fontSize: 17, fontWeight: "500", color: c.onSurface },
  rowSub: { fontFamily: fonts.text, fontSize: 13, color: c.muted },
  note: { fontFamily: fonts.text, fontSize: 12, color: c.muted, textAlign: "center", lineHeight: 18 },
}));
