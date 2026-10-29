import { router } from "expo-router";
import { useState } from "react";
import { Platform, ScrollView, Text, TextInput, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SearchResults } from "@/src/components/search-results";
import { IconButton, IconName, Ionicons, PressableScale, ProgressBar } from "@/src/components/ui";
import { topics } from "@/src/data";
import { missedCount } from "@/src/data/quiz";
import { usesNativeTabs } from "@/src/navigation";
import { topicProgress, useProgress } from "@/src/store/progress";
import { fonts, makeStyles, radius, setColorScheme, spacing, useTheme } from "@/src/theme";

export default function Home() {
  const insets = useSafeAreaInsets();
  const bottomChrome = usesNativeTabs ? insets.bottom : 0;
  const { colors, scheme } = useTheme();
  const styles = useStyles();
  const { state } = useProgress();

  const per = topics.map((t) => topicProgress(state, t));
  const [query, setQuery] = useState("");
  const [compact, setCompact] = useState(false);
  const searching = query.trim().length > 0;
  const nMissed = missedCount(topics.map((t) => t.id), state.missed);

  return (
    <View style={styles.root} testID="home-screen">
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>Sonography exam review</Text>
          <Text style={styles.title}>Sono Study</Text>
        </View>
        <IconButton
          testID="theme-toggle-button"
          name={scheme === "dark" ? "sunny" : "moon"}
          onPress={() => setColorScheme(scheme === "dark" ? "light" : "dark")}
        />
      </View>
      <View style={styles.searchWrap}>
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            testID="home-search-input"
            value={query}
            onChangeText={setQuery}
            placeholder="Search"
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
            returnKeyType="search"
            autoCorrect={false}
          />
          {searching ? <IconButton testID="home-search-clear" name="close-circle" onPress={() => setQuery("")} color={colors.muted} bg="transparent" /> : null}
        </View>
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomChrome + spacing.xl }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        {searching ? (
          <SearchResults query={query} />
        ) : (
          <>
        <PressableScale testID="open-mock-exam-button" onPress={() => router.push("/mock")} style={styles.mock}>
          <Ionicons name="timer" size={26} color={colors.onBrandPrimary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.mockTitle}>Mock exam</Text>
            <Text style={styles.mockSub}>Pick chapters & number of questions</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={colors.onBrandPrimary} />
        </PressableScale>
        <PressableScale
          testID="open-weak-spots-button"
          disabled={nMissed === 0}
          onPress={() => router.push(`/quiz/weak?topics=${topics.map((t) => t.id).join(",")}&count=${Math.min(nMissed, 50)}&mode=weak`)}
          style={[styles.weak, { opacity: nMissed ? 1 : 0.6 }]}
        >
          <Ionicons name="medkit" size={24} color={colors.error} />
          <View style={{ flex: 1 }}>
            <Text style={styles.weakTitle}>Weak spot review</Text>
            <Text style={styles.weakSub} testID="home-missed-count">
              {nMissed ? `Retry ${Math.min(nMissed, 50)} question${nMissed === 1 ? "" : "s"} you missed${nMissed > 50 ? ` (of ${nMissed})` : ""}` : "Questions you miss will appear here"}
            </Text>
          </View>
          {nMissed ? <Ionicons name="chevron-forward" size={22} color={colors.muted} /> : null}
        </PressableScale>
        <View style={styles.labelRow}>
          <Text style={styles.sectionLabel}>Topics</Text>
          <PressableScale testID="toggle-compact-topics-button" onPress={() => setCompact((v) => !v)} style={styles.compactBtn}>
            <Ionicons name={compact ? "expand" : "contract"} size={16} color={colors.brandPrimary} />
            <Text style={[styles.compactText, { color: colors.brandPrimary }]}>{compact ? "Expand" : "Minimize"}</Text>
          </PressableScale>
        </View>
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
                {compact ? null : (
                <>
                <Text style={styles.cardSub}>{t.subtitle}</Text>
                <ProgressBar value={p.pct} color={accent} />
                <View style={styles.meta}>
                  <Meta icon="document-text-outline" text={`${p.read}/${t.sections.length} notes`} />
                  <Meta icon="albums-outline" text={`${p.known}/${t.flashcards.length} cards`} />
                  <Meta icon="trophy-outline" text={p.quiz ? `Best ${p.quiz.best}/${p.quiz.total}` : "No quiz yet"} />
                  {t.imageCount > 0 ? <Meta icon="image-outline" text={`${t.imageCount} images`} /> : null}
                </View>
                </>
                )}
              </PressableScale>
            </Animated.View>
          );
        })}
        <View style={styles.localNote}>
          <Ionicons name="phone-portrait-outline" size={16} color={colors.muted} />
          <Text style={styles.localText}>Your progress is saved only on this device.</Text>
        </View>
          </>
        )}
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
  searchWrap: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, backgroundColor: c.surface },
  search: { flexDirection: "row", alignItems: "center", gap: spacing.sm, height: 48, paddingLeft: spacing.lg, borderRadius: radius.pill, backgroundColor: c.surfaceSecondary, borderWidth: 1, borderColor: c.border },
  searchInput: { flex: 1, height: 48, fontFamily: fonts.text, fontSize: 16, color: c.onSurface, ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as object) : {}) },
  mock: { flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: c.brandPrimary, borderRadius: radius.lg, padding: spacing.lg },
  mockTitle: { fontFamily: fonts.display, fontSize: 20, fontWeight: "500", color: c.onBrandPrimary },
  mockSub: { fontFamily: fonts.text, fontSize: 13, color: c.onBrandPrimary },
  weak: { flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: c.surfaceSecondary, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1.5, borderColor: c.error },
  weakTitle: { fontFamily: fonts.display, fontSize: 18, fontWeight: "500", color: c.onSurface },
  weakSub: { fontFamily: fonts.text, fontSize: 13, color: c.muted },
  labelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.sm },
  compactBtn: { flexDirection: "row", alignItems: "center", gap: spacing.xs, minHeight: 44, paddingHorizontal: spacing.sm },
  compactText: { fontFamily: fonts.text, fontSize: 14, fontWeight: "700" },
  localNote: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs, marginTop: spacing.sm },
  localText: { fontFamily: fonts.text, fontSize: 12, color: c.muted },
}));
