import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, IconButton, Ionicons, PressableScale, ProgressBar, StackHeader, tap } from "@/src/components/ui";
import { getTopic } from "@/src/data";
import { slides } from "@/src/data/slides";
import type { Flashcard } from "@/src/data/types";
import { useProgress } from "@/src/store/progress";
import { fonts, makeStyles, radius, spacing, useTheme } from "@/src/theme";

type Mode = "all" | "learning" | "new";
const MODES: { key: Mode; label: string }[] = [
  { key: "all", label: "All cards" },
  { key: "learning", label: "Still learning" },
  { key: "new", label: "Not seen" },
];

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FlashcardsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const topic = getTopic(id);
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();
  const { state, setCard, toggleBookmark, isBookmarked } = useProgress();
  const [mode, setMode] = useState<Mode>("all");
  const [seed, setSeed] = useState(0);
  const [shuffled, setShuffled] = useState(false);
  const [index, setIndex] = useState(0);
  const [session, setSession] = useState({ known: 0, learning: 0 });
  const rot = useSharedValue(0);

  // Snapshot the deck when mode/seed changes so marking cards doesn't reshuffle mid-session.
  const deck: Flashcard[] = useMemo(() => {
    if (!topic) return [];
    const base = topic.flashcards.filter((c) => (mode === "all" ? true : mode === "learning" ? state.cards[c.id] === "learning" : !state.cards[c.id]));
    return shuffled ? shuffle(base) : base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic, mode, seed, shuffled]);

  const front = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${rot.value}deg` }],
    opacity: interpolate(rot.value, [0, 89, 90, 180], [1, 1, 0, 0]),
  }));
  const back = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${rot.value - 180}deg` }],
    opacity: interpolate(rot.value, [0, 89, 90, 180], [0, 0, 1, 1]),
  }));

  if (!topic) return <StackHeader title="Topic not found" />;
  const accent = colors[topic.colorKey];
  const card = deck[index];
  const done = index >= deck.length;

  const restart = (m: Mode = mode) => {
    rot.value = 0;
    setMode(m);
    setIndex(0);
    setSession({ known: 0, learning: 0 });
    setSeed((s) => s + 1);
  };
  const flip = () => {
    tap();
    rot.value = withTiming(rot.value >= 90 ? 0 : 180, { duration: 350 });
  };
  const mark = (status: "known" | "learning") => {
    if (!card) return;
    setCard(card.id, status);
    setSession((s) => ({ ...s, [status]: s[status] + 1 }));
    rot.value = 0;
    setIndex((i) => i + 1);
  };
  const saved = card ? isBookmarked(card.id) : false;
  const status = card ? state.cards[card.id] : undefined;

  return (
    <View style={styles.root} testID="flashcards-screen">
      <StackHeader
        title="Flashcards"
        subtitle={topic.title}
        right={
          <IconButton
            testID="shuffle-toggle-button"
            name="shuffle"
            color={shuffled ? colors.onBrandPrimary : colors.onSurface}
            bg={shuffled ? colors.brandPrimary : colors.surfaceSecondary}
            onPress={() => {
              setShuffled((v) => !v);
              setSession({ known: 0, learning: 0 });
              rot.value = 0;
              setIndex(0);
            }}
          />
        }
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} contentContainerStyle={styles.chipContent}>
        {MODES.map((m) => {
          const active = m.key === mode;
          return (
            <PressableScale key={m.key} testID={`flashcard-mode-${m.key}`} onPress={() => restart(m.key)} style={[styles.chip, active && { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary }]}>
              <Text style={[styles.chipText, active && { color: colors.onBrandPrimary }]}>{m.label}</Text>
            </PressableScale>
          );
        })}
      </ScrollView>

      {deck.length === 0 ? (
        <View style={styles.center} testID="flashcards-empty">
          <Ionicons name="checkmark-done-circle" size={64} color={colors.success} />
          <Text style={styles.doneTitle}>No cards here</Text>
          <Text style={styles.muted}>{mode === "learning" ? "You have no cards marked as still learning." : "You've seen every card in this deck."}</Text>
          <Button testID="flashcards-show-all-button" label="Study all cards" onPress={() => restart("all")} />
        </View>
      ) : done ? (
        <View style={styles.center} testID="flashcards-done">
          <Ionicons name="trophy" size={64} color={colors.brandSecondary} />
          <Text style={styles.doneTitle}>Deck complete!</Text>
          <Text style={styles.muted} testID="flashcards-session-summary">
            {session.known} known · {session.learning} still learning
          </Text>
          <Button testID="flashcards-restart-button" label="Restart deck" icon="refresh" onPress={() => restart()} style={{ alignSelf: "stretch" }} />
          <Button testID="flashcards-review-learning-button" label="Review still learning" variant="secondary" onPress={() => restart("learning")} style={{ alignSelf: "stretch" }} />
        </View>
      ) : (
        <View style={[styles.body, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.progressRow}>
            <View style={{ flex: 1 }}>
              <ProgressBar value={(index / deck.length) * 100} color={accent} />
            </View>
            <Text style={styles.counter} testID="flashcard-counter">
              {index + 1}/{deck.length}
            </Text>
          </View>
          <Pressable testID="flashcard-flip-area" onPress={flip} style={styles.cardArea}>
            <Animated.View style={[styles.card, { borderColor: accent }, front]}>
              <View style={styles.cardTop}>
                <Text style={[styles.badge, { backgroundColor: accent + "33" }]}>Question</Text>
                {status ? <Text style={[styles.badge, { backgroundColor: status === "known" ? colors.success + "33" : colors.warning + "44" }]}>{status === "known" ? "Known" : "Learning"}</Text> : null}
              </View>
              {card.image ? <Image source={slides[card.image]} style={styles.cardImage} contentFit="contain" testID="flashcard-image" /> : null}
              <Text style={[styles.cardText, card.image && styles.cardTextSmall]} testID="flashcard-front-text">
                {card.front}
              </Text>
              <Text style={styles.hint}>Tap to flip</Text>
            </Animated.View>
            <Animated.View style={[styles.card, styles.cardBack, { backgroundColor: accent }, back]}>
              <Text style={[styles.badge, { backgroundColor: colors.surface + "66", alignSelf: "flex-start" }]}>Answer</Text>
              <Text style={[styles.cardText, { color: colors.onTopic }]} testID="flashcard-back-text">
                {card.back}
              </Text>
              <Text style={[styles.hint, { color: colors.onTopic }]}>Tap to flip back</Text>
            </Animated.View>
          </Pressable>
          <View style={styles.controls}>
            <IconButton
              testID="flashcard-bookmark-button"
              name={saved ? "bookmark" : "bookmark-outline"}
              color={saved ? colors.brandPrimary : colors.onSurface}
              onPress={() => toggleBookmark("card", card.id, topic.id)}
            />
            <Button testID="flashcard-learning-button" label="Still learning" variant="warning" onPress={() => mark("learning")} style={{ flex: 1, paddingHorizontal: spacing.md }} />
            <Button testID="flashcard-known-button" label="Know it" icon="checkmark" variant="success" onPress={() => mark("known")} style={{ flex: 1, paddingHorizontal: spacing.md }} />
          </View>
        </View>
      )}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface },
  chipRow: { height: 56, flexGrow: 0 },
  chipContent: { gap: spacing.sm, paddingHorizontal: spacing.lg, alignItems: "center" },
  chip: { height: 36, flexShrink: 0, paddingHorizontal: spacing.lg, borderRadius: radius.pill, borderWidth: 1, borderColor: c.borderStrong, backgroundColor: c.surfaceSecondary, justifyContent: "center" },
  chipText: { fontFamily: fonts.text, fontSize: 14, fontWeight: "600", color: c.onSurface },
  body: { flex: 1, paddingHorizontal: spacing.lg, gap: spacing.lg },
  progressRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  counter: { fontFamily: fonts.display, fontSize: 16, fontWeight: "500", color: c.onSurface },
  cardArea: { flex: 1, minHeight: 300 },
  card: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: c.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: spacing.xl,
    justifyContent: "space-between",
    backfaceVisibility: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  cardBack: { borderColor: "transparent" },
  cardTop: { flexDirection: "row", gap: spacing.sm },
  badge: { fontFamily: fonts.text, fontSize: 12, fontWeight: "700", color: c.onSurface, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill, overflow: "hidden" },
  cardText: { fontFamily: fonts.display, fontSize: 24, fontWeight: "500", color: c.onSurface, textAlign: "center", lineHeight: 32 },
  cardImage: { flex: 1, width: "100%", marginVertical: spacing.sm, borderRadius: radius.md, backgroundColor: "#000000" },
  cardTextSmall: { fontSize: 18, lineHeight: 24 },
  hint: { fontFamily: fonts.text, fontSize: 13, color: c.muted, textAlign: "center" },
  controls: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.md },
  doneTitle: { fontFamily: fonts.display, fontSize: 26, fontWeight: "500", color: c.onSurface },
  muted: { fontFamily: fonts.text, fontSize: 15, color: c.muted, textAlign: "center" },
}));
