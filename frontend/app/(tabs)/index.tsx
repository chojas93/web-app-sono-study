import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconButton, IconName, Ionicons, PressableScale, ProgressBar } from "@/src/components/ui";
import { topics } from "@/src/data";
import { usesNativeTabs } from "@/src/navigation";
import { currentStreak, topicProgress, useProgress } from "@/src/store/progress";
import { fonts, makeStyles, radius, setColorScheme, spacing, useTheme } from "@/src/theme";

export default function Home() {
  const insets = useSafeAreaInsets();
  const bottomChrome = usesNativeTabs ? insets.bottom : 0;
  const { colors, scheme } = useTheme();
  const styles = useStyles();
  const { state } = useProgress();

  const per = topics.map((t) => topicProgress(state, t));
  const overall = Math.round(per.reduce((n, p) => n + p.pct, 0) / topics.length);
  const streak = currentStreak(state);

  return (
    <View style={styles.root} testID="home-screen">
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>Abdominal sonography</Text>
          <Text style={styles.title}>Sono Study</Text>
        </View>
        <IconButton
          testID="theme-toggle-button"
          name={scheme === "dark" ? "sunny" : "moon"}
          onPress={() => setColorScheme(scheme === "dark" ? "light" : "dark")}
        />
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomChrome + spacing.xl }]} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.hero} testID="overall-progress-card">
          <View style={{ flex: 1, gap: spacing.xs }}>
            <Text style={styles.heroLabel}>Overall mastery</Text>
            <Text style={styles.heroValue} testID="overall-progress-value">
              {overall}%
            </Text>
            <ProgressBar value={overall} color={colors.brandSecondary} height={10} />
          </View>
          <View style={styles.streak} testID="streak-badge">
            <Ionicons name="flame" size={22} color={colors.onBrandSecondary} />
            <Text style={styles.streakNum}>{streak}</Text>
            <Text style={styles.streakLbl}>day streak</Text>
          </View>
        </Animated.View>

        <Text style={styles.sectionLabel}>Topics</Text>
        {topics.map((t, i) => {
          const p = per[i];
          const accent = colors[t.colorKey];
          return (
            <Animated.View key={t.id} entering={FadeInDown.delay(80 + i * 60).duration(400)}>
              <PressableScale testID={`topic-card-${t.id}`} onPress={() => router.push(`/topic/${t.id}`)} style={[styles.card, { backgroundColor: accent + "22", borderColor: accent + "55" }]}>
                <View style={styles.cardTop}>
                  <View style={[styles.iconWrap, { backgroundColor: accent }]}>
                    <Ionicons name={t.icon as IconName} size={24} color={colors.onTopic} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.chapter}>{t.chapter}</Text>
                    <Text style={styles.cardTitle}>{t.title}</Text>
                  </View>
                  <Text style={styles.pct} testID={`topic-progress-${t.id}`}>
                    {p.pct}%
                  </Text>
                </View>
                <Text style={styles.cardSub}>{t.subtitle}</Text>
                <ProgressBar value={p.pct} color={accent} />
                <View style={styles.meta}>
                  <Meta icon="document-text-outline" text={`${p.read}/${t.sections.length} notes`} />
                  <Meta icon="albums-outline" text={`${p.known}/${t.flashcards.length} cards`} />
                  <Meta icon="trophy-outline" text={p.quiz ? `Best ${p.quiz.best}/${p.quiz.total}` : "No quiz yet"} />
                </View>
              </PressableScale>
            </Animated.View>
          );
        })}
        <View style={styles.localNote}>
          <Ionicons name="phone-portrait-outline" size={16} color={colors.muted} />
          <Text style={styles.localText}>Your progress is saved only on this device.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function Meta({ icon, text }: { icon: IconName; text: string }) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={14} color={colors.onSurfaceTertiary} />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg, paddingBottom: spacing.md, backgroundColor: c.surface },
  kicker: { fontFamily: fonts.text, fontSize: 12, color: c.muted, textTransform: "uppercase", letterSpacing: 1.2 },
  title: { fontFamily: fonts.display, fontSize: 30, fontWeight: "500", color: c.onSurface },
  content: { paddingHorizontal: spacing.lg, gap: spacing.md },
  hero: {
    backgroundColor: c.brandPrimary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  heroLabel: { fontFamily: fonts.text, fontSize: 14, color: c.onBrandPrimary, opacity: 0.9 },
  heroValue: { fontFamily: fonts.display, fontSize: 44, fontWeight: "500", color: c.onBrandPrimary },
  streak: { backgroundColor: c.brandSecondary, borderRadius: radius.lg, padding: spacing.md, alignItems: "center", minWidth: 84 },
  streakNum: { fontFamily: fonts.display, fontSize: 24, fontWeight: "500", color: c.onBrandSecondary },
  streakLbl: { fontFamily: fonts.text, fontSize: 11, color: c.onBrandSecondary },
  sectionLabel: { fontFamily: fonts.display, fontSize: 20, fontWeight: "500", color: c.onSurface, marginTop: spacing.sm },
  card: { borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md, borderWidth: 1 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  iconWrap: { width: 48, height: 48, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  chapter: { fontFamily: fonts.text, fontSize: 12, color: c.muted, textTransform: "uppercase", letterSpacing: 1 },
  cardTitle: { fontFamily: fonts.display, fontSize: 18, fontWeight: "500", color: c.onSurface },
  pct: { fontFamily: fonts.display, fontSize: 18, fontWeight: "500", color: c.onSurface },
  cardSub: { fontFamily: fonts.text, fontSize: 14, color: c.onSurfaceTertiary },
  meta: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  metaItem: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  metaText: { fontFamily: fonts.text, fontSize: 12, color: c.onSurfaceTertiary },
  localNote: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs, marginTop: spacing.sm },
  localText: { fontFamily: fonts.text, fontSize: 12, color: c.muted },
}));
