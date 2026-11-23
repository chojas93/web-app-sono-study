import { View, Text } from "react-native";

import type { QuizHistory } from "@/src/store/progress";
import { fonts, makeStyles, radius, spacing, useTheme } from "@/src/theme";

// Simple bar chart of a chapter's quiz scores over time (oldest → newest).
export function ScoreTrend({ entries, color, testID, label = "Score trend" }: { entries: QuizHistory[]; color: string; testID: string; label?: string }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const data = [...entries].reverse().slice(-10);
  if (data.length === 0) return null;
  const pcts = data.map((h) => Math.round((h.score / h.total) * 100));
  const first = pcts[0];
  const last = pcts[pcts.length - 1];
  const delta = last - first;
  return (
    <View style={styles.wrap} testID={testID}>
      <View style={styles.head}>
        <Text style={styles.label}>{label}</Text>
        {pcts.length > 1 ? (
          <Text style={[styles.delta, { color: delta > 0 ? colors.success : delta < 0 ? colors.error : colors.muted }]}>
            {delta > 0 ? "▲" : delta < 0 ? "▼" : "–"} {Math.abs(delta)}% since first try
          </Text>
        ) : null}
      </View>
      <View style={styles.chart}>
        {pcts.map((p, i) => (
          <View key={i} style={styles.col}>
            <Text style={styles.val}>{p}</Text>
            <View style={styles.track}>
              <View style={[styles.bar, { height: `${Math.max(p, 4)}%`, backgroundColor: color, opacity: i === pcts.length - 1 ? 1 : 0.6 }]} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  wrap: { gap: spacing.xs, marginTop: spacing.xs },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { fontFamily: fonts.text, fontSize: 12, color: c.muted },
  delta: { fontFamily: fonts.text, fontSize: 12, fontWeight: "700" },
  chart: { flexDirection: "row", alignItems: "flex-end", gap: spacing.xs, height: 84 },
  col: { flex: 1, alignItems: "center", gap: 2, height: "100%", justifyContent: "flex-end" },
  val: { fontFamily: fonts.text, fontSize: 10, color: c.onSurfaceTertiary },
  track: { width: "100%", flex: 1, justifyContent: "flex-end", backgroundColor: c.surfaceTertiary, borderRadius: radius.sm, overflow: "hidden" },
  bar: { width: "100%", borderRadius: radius.sm },
}));
