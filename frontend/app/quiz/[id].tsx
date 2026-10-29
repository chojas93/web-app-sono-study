import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { useMemo, useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Ionicons, PressableScale, ProgressBar, StackHeader } from "@/src/components/ui";
import { getTopic } from "@/src/data";
import { buildQuiz, shuffle } from "@/src/data/quiz";
import { slides } from "@/src/data/slides";
import type { Question } from "@/src/data/types";
import { useProgress } from "@/src/store/progress";
import { fonts, makeStyles, radius, spacing, useTheme } from "@/src/theme";

function prepare(qs: Question[]) {
  return shuffle(qs).map((q) => {
    const perm = shuffle(q.options.map((_, i) => i));
    return { ...q, options: perm.map((i) => q.options[i]), answer: perm.indexOf(q.answer) };
  });
}

export default function QuizScreen() {
  const { id, topics: tp, count: cp, mode: mp } = useLocalSearchParams<{ id: string; topics?: string; count?: string; mode?: string }>();
  const topic = getTopic(id);
  const isMock = id === "mock";
  const config = useMemo(
    () => ({
      topicIds: isMock ? (tp ?? "").split(",").filter(Boolean) : [id],
      count: Number(cp) || 20,
      mode: (mp === "image" ? "image" : "mixed") as "image" | "mixed",
    }),
    [isMock, tp, id, cp, mp],
  );
  const recordId = isMock ? `mock:${config.count}` : config.mode === "image" ? `${id}:image` : id;
  const title = isMock ? "Mock exam" : config.mode === "image" ? "Image quiz" : "Quiz";
  const subtitle = isMock ? `${config.topicIds.length} chapters` : (topic?.title ?? "");
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();
  const { state, recordQuiz } = useProgress();
  const [questions, setQuestions] = useState<Question[]>(() => prepare(buildQuiz(config)));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [missed, setMissed] = useState<Question[]>([]);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const recorded = useRef(false);

  if (!topic && !isMock) return <StackHeader title="Topic not found" />;
  if (questions.length === 0)
    return (
      <View style={styles.root} testID="quiz-empty">
        <StackHeader title={title} subtitle={subtitle} />
        <Text style={[styles.explain, { padding: spacing.xl, textAlign: "center" }]}>No questions available for this selection yet.</Text>
      </View>
    );
  const accent = topic ? colors[topic.colorKey] : colors.brandPrimary;
  const q = questions[index];
  const total = questions.length;

  const submit = () => {
    if (selected === null) return;
    setSubmitted(true);
    if (selected === q.answer) setScore((s) => s + 1);
    else setMissed((m) => [...m, q]);
  };
  const next = () => {
    if (index + 1 >= total) {
      if (recorded.current) return;
      recorded.current = true;
      recordQuiz(recordId, score, total);
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setSubmitted(false);
  };
  const retry = () => {
    setQuestions(prepare(buildQuiz(config)));
    setIndex(0);
    setSelected(null);
    setSubmitted(false);
    setMissed([]);
    setScore(0);
    setFinished(false);
    recorded.current = false;
  };

  if (finished) {
    const pct = Math.round((score / total) * 100);
    const best = state.quizzes[recordId]?.best ?? score;
    return (
      <View style={styles.root} testID="quiz-results">
        <StackHeader title="Results" subtitle={isMock ? "Mock exam" : subtitle} />
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}>
          <Animated.View entering={FadeInDown} style={[styles.resultCard, { backgroundColor: pct >= 70 ? colors.success : colors.brandPrimary }]}>
            <Ionicons name={pct >= 70 ? "trophy" : "school"} size={44} color={colors.onSuccess} />
            <Text style={styles.resultScore} testID="quiz-final-score">
              {score}/{total}
            </Text>
            <Text style={styles.resultText}>{pct >= 90 ? "Outstanding!" : pct >= 70 ? "Great work!" : "Keep practicing — you've got this!"}</Text>
            <Text style={styles.resultText} testID="quiz-best-score">
              Best: {best}/{total}
            </Text>
          </Animated.View>
          {missed.length > 0 ? <Text style={styles.h2}>Review missed questions</Text> : null}
          {missed.map((m) => (
            <View key={m.id} style={styles.missed} testID={`missed-${m.id}`}>
              <Text style={styles.missedQ}>{m.q}</Text>
              <Text style={[styles.missedA, { color: colors.success }]}>✓ {m.options[m.answer]}</Text>
              <Text style={styles.explain}>{m.explanation}</Text>
            </View>
          ))}
          <Button testID="quiz-retry-button" label="Retry quiz" icon="refresh" onPress={retry} />
          <Button testID="quiz-back-to-topic-button" label={isMock ? "Back" : "Back to topic"} variant="secondary" onPress={() => router.back()} />
        </ScrollView>
      </View>
    );
  }

  const correct = submitted && selected === q.answer;

  return (
    <View style={styles.root} testID="quiz-screen">
      <StackHeader title={title} subtitle={subtitle} />
      <View style={styles.progressRow}>
        <View style={{ flex: 1 }}>
          <ProgressBar value={((index + (submitted ? 1 : 0)) / total) * 100} color={accent} />
        </View>
        <Text style={styles.counter} testID="quiz-counter">
          {index + 1}/{total}
        </Text>
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: spacing.xl }]}>
        {q.image ? <Image source={slides[q.image]} style={styles.qImage} contentFit="contain" testID="quiz-question-image" /> : null}
        {q.source === "textbook" ? <Text style={styles.sourceTag} testID="quiz-source-textbook">Textbook review question</Text> : null}
        <Animated.Text key={q.id} entering={FadeInDown} style={styles.question} testID="quiz-question-text">
          {q.q}
        </Animated.Text>
        {q.options.map((opt, i) => {
          const isSel = selected === i;
          const isAns = i === q.answer;
          let bg = colors.surfaceSecondary;
          let border = colors.border;
          let icon: "checkmark-circle" | "close-circle" | null = null;
          if (submitted && isAns) {
            bg = colors.success + "26";
            border = colors.success;
            icon = "checkmark-circle";
          } else if (submitted && isSel) {
            bg = colors.error + "22";
            border = colors.error;
            icon = "close-circle";
          } else if (isSel) {
            bg = colors.brandTertiary;
            border = colors.brandPrimary;
          }
          return (
            <PressableScale key={i} testID={`quiz-option-${i}`} disabled={submitted} onPress={() => setSelected(i)} style={[styles.option, { backgroundColor: bg, borderColor: border }]}>
              <View style={[styles.letter, { borderColor: border }]}>
                <Text style={styles.letterText}>{String.fromCharCode(65 + i)}</Text>
              </View>
              <Text style={styles.optionText}>{opt}</Text>
              {icon ? <Ionicons name={icon} size={24} color={icon === "checkmark-circle" ? colors.success : colors.error} /> : null}
            </PressableScale>
          );
        })}
        {submitted ? (
          <Animated.View entering={FadeInDown} style={[styles.explainCard, { borderColor: correct ? colors.success : colors.error }]} testID="quiz-explanation">
            <Text style={[styles.verdict, { color: correct ? colors.success : colors.error }]}>{correct ? "Correct!" : "Not quite"}</Text>
            <Text style={styles.explain}>{q.explanation}</Text>
          </Animated.View>
        ) : null}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        {submitted ? (
          <Button testID="quiz-next-button" label={index + 1 >= total ? "See results" : "Next question"} icon="arrow-forward" onPress={next} />
        ) : (
          <Button testID="quiz-submit-button" label="Submit" disabled={selected === null} onPress={submit} />
        )}
      </View>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface },
  progressRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  counter: { fontFamily: fonts.display, fontSize: 16, fontWeight: "500", color: c.onSurface },
  content: { padding: spacing.lg, gap: spacing.md },
  qImage: { width: "100%", height: 220, borderRadius: radius.md, backgroundColor: "#000000" },
  sourceTag: { fontFamily: fonts.text, fontSize: 12, fontWeight: "700", color: c.muted, textTransform: "uppercase", letterSpacing: 1 },
  question: { fontFamily: fonts.display, fontSize: 22, fontWeight: "500", color: c.onSurface, lineHeight: 30, marginBottom: spacing.sm },
  option: { flexDirection: "row", alignItems: "center", gap: spacing.md, minHeight: 60, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 2 },
  letter: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  letterText: { fontFamily: fonts.display, fontSize: 14, fontWeight: "500", color: c.onSurface },
  optionText: { flex: 1, fontFamily: fonts.text, fontSize: 16, color: c.onSurface, lineHeight: 22 },
  explainCard: { backgroundColor: c.surfaceSecondary, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm, borderLeftWidth: 6 },
  verdict: { fontFamily: fonts.display, fontSize: 18, fontWeight: "500" },
  explain: { fontFamily: fonts.text, fontSize: 15, lineHeight: 22, color: c.onSurfaceSecondary },
  footer: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.divider },
  resultCard: { borderRadius: radius.lg, padding: spacing.xl, alignItems: "center", gap: spacing.sm },
  resultScore: { fontFamily: fonts.display, fontSize: 48, fontWeight: "500", color: c.onSuccess },
  resultText: { fontFamily: fonts.text, fontSize: 16, color: c.onSuccess, textAlign: "center" },
  h2: { fontFamily: fonts.display, fontSize: 20, fontWeight: "500", color: c.onSurface, marginTop: spacing.sm },
  missed: { backgroundColor: c.surfaceSecondary, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.xs },
  missedQ: { fontFamily: fonts.text, fontSize: 15, fontWeight: "700", color: c.onSurface },
  missedA: { fontFamily: fonts.text, fontSize: 15, fontWeight: "700" },
}));
