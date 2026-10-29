import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Ionicons, PressableScale, StackHeader } from "@/src/components/ui";
import { topics } from "@/src/data";
import { imageQuizCount, poolSize } from "@/src/data/quiz";
import { fonts, makeStyles, radius, spacing, useTheme } from "@/src/theme";

const COUNTS = [10, 25, 50, 100];

export default function MockSetup() {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();
  const [selected, setSelected] = useState<string[]>(topics.map((t) => t.id));
  const [count, setCount] = useState(25);
  const [mode, setMode] = useState<"mixed" | "image">("mixed");
  const available = poolSize(selected, mode);
  const total = Math.min(count, available);

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <View style={styles.root} testID="mock-setup-screen">
      <StackHeader title="Mock exam" subtitle="Build your test" />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: spacing.xl }]}>
        <Text style={styles.h2}>Question type</Text>
        <View style={styles.row}>
          {(["mixed", "image"] as const).map((m) => (
            <PressableScale key={m} testID={`mock-mode-${m}`} onPress={() => setMode(m)} style={[styles.pill, mode === m && { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary }]}>
              <Text style={[styles.pillText, mode === m && { color: colors.onBrandPrimary }]}>{m === "mixed" ? "Written questions" : "Image questions"}</Text>
            </PressableScale>
          ))}
        </View>

        <Text style={styles.h2}>Number of questions</Text>
        <View style={styles.row}>
          {COUNTS.map((n) => (
            <PressableScale key={n} testID={`mock-count-${n}`} onPress={() => setCount(n)} style={[styles.pill, count === n && { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary }]}>
              <Text style={[styles.pillText, count === n && { color: colors.onBrandPrimary }]}>{n}</Text>
            </PressableScale>
          ))}
        </View>

        <View style={styles.rowBetween}>
          <Text style={styles.h2}>Chapters ({selected.length})</Text>
          <PressableScale
            testID="mock-select-all-button"
            onPress={() => setSelected(selected.length === topics.length ? [] : topics.map((t) => t.id))}
            style={styles.link}
          >
            <Text style={[styles.linkText, { color: colors.brandPrimary }]}>{selected.length === topics.length ? "Clear all" : "Select all"}</Text>
          </PressableScale>
        </View>
        {topics.map((t) => {
          const on = selected.includes(t.id);
          return (
            <PressableScale key={t.id} testID={`mock-chapter-${t.id}`} onPress={() => toggle(t.id)} style={[styles.chapter, on && { borderColor: colors[t.colorKey], backgroundColor: colors[t.colorKey] + "22" }]}>
              <Ionicons name={on ? "checkbox" : "square-outline"} size={22} color={on ? colors[t.colorKey] : colors.muted} />
              <View style={{ flex: 1 }}>
                <Text style={styles.chapterTitle}>{t.title}</Text>
                <Text style={styles.chapterSub}>
                  {t.chapter} · {mode === "image" ? `${imageQuizCount(t.id)} images` : `${t.quiz.length} questions`}
                </Text>
              </View>
            </PressableScale>
          );
        })}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Text style={styles.summary} testID="mock-summary">
          {selected.length === 0 ? "Pick at least one chapter" : `${total} questions from ${available} available`}
        </Text>
        <Button
          testID="mock-start-button"
          label="Start mock exam"
          icon="play"
          disabled={selected.length === 0 || total === 0}
          onPress={() => router.push(`/quiz/mock?topics=${selected.join(",")}&count=${total}&mode=${mode}`)}
        />
      </View>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface },
  content: { padding: spacing.lg, gap: spacing.md },
  h2: { fontFamily: fonts.display, fontSize: 18, fontWeight: "500", color: c.onSurface },
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pill: { minHeight: 44, paddingHorizontal: spacing.lg, borderRadius: radius.pill, borderWidth: 1, borderColor: c.borderStrong, backgroundColor: c.surfaceSecondary, justifyContent: "center" },
  pillText: { fontFamily: fonts.text, fontSize: 15, fontWeight: "700", color: c.onSurface },
  link: { minHeight: 44, justifyContent: "center" },
  linkText: { fontFamily: fonts.text, fontSize: 14, fontWeight: "700" },
  chapter: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderRadius: radius.md, borderWidth: 1.5, borderColor: c.border, backgroundColor: c.surfaceSecondary },
  chapterTitle: { fontFamily: fonts.display, fontSize: 16, fontWeight: "500", color: c.onSurface },
  chapterSub: { fontFamily: fonts.text, fontSize: 12, color: c.muted },
  footer: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.sm, borderTopWidth: 1, borderTopColor: c.divider, backgroundColor: c.surface },
  summary: { fontFamily: fonts.text, fontSize: 14, color: c.muted, textAlign: "center" },
}));
