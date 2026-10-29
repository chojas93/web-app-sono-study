import { router } from "expo-router";
import { Text, View } from "react-native";

import { Ionicons, PressableScale } from "@/src/components/ui";
import { topics } from "@/src/data";
import { fonts, makeStyles, radius, spacing, useTheme } from "@/src/theme";

type Hit = { id: string; topicId: string; kind: "Topic" | "Note" | "Flashcard" | "Mnemonic"; title: string; snippet: string; tab?: string };

function snippet(text: string, q: string) {
  const i = text.toLowerCase().indexOf(q);
  if (i < 0) return text.slice(0, 110);
  const start = Math.max(0, i - 40);
  return (start > 0 ? "…" : "") + text.slice(start, start + 120) + (start + 120 < text.length ? "…" : "");
}

export function search(query: string): Hit[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const hits: Hit[] = [];
  for (const t of topics) {
    if (t.title.toLowerCase().includes(q)) hits.push({ id: t.id, topicId: t.id, kind: "Topic", title: t.title, snippet: t.subtitle });
    for (const s of t.sections) {
      const body = s.points.join(" ");
      if (s.title.toLowerCase().includes(q) || body.toLowerCase().includes(q)) hits.push({ id: s.id, topicId: t.id, kind: "Note", title: s.title, snippet: snippet(body, q) });
    }
    for (const c of t.flashcards) {
      const body = `${c.front} — ${c.back}`;
      if (body.toLowerCase().includes(q)) hits.push({ id: c.id, topicId: t.id, kind: "Flashcard", title: c.front, snippet: c.back });
    }
    for (const m of t.mnemonics) {
      const body = `${m.title} ${m.device} ${m.meaning}`;
      if (body.toLowerCase().includes(q)) hits.push({ id: m.id, topicId: t.id, kind: "Mnemonic", title: `${m.title}: ${m.device}`, snippet: m.meaning, tab: "mnemonics" });
    }
  }
  const rank = (h: Hit) => (h.kind === "Topic" ? 0 : h.title.toLowerCase().includes(q) ? 1 : 2);
  return hits.sort((a, b) => rank(a) - rank(b)).slice(0, 60);
}

export function SearchResults({ query }: { query: string }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const hits = search(query);
  if (query.trim().length < 2) return <Text style={styles.muted}>Type at least 2 letters to search notes, flashcards and mnemonics.</Text>;
  if (hits.length === 0)
    return (
      <Text style={styles.muted} testID="search-no-results">
        No results for “{query}”.
      </Text>
    );
  return (
    <View style={{ gap: spacing.sm }} testID="search-results">
      <Text style={styles.count}>{hits.length === 60 ? "60+" : hits.length} results</Text>
      {hits.map((h) => {
        const t = topics.find((x) => x.id === h.topicId)!;
        return (
          <PressableScale
            key={`${h.kind}-${h.id}`}
            testID={`search-result-${h.id}`}
            onPress={() => router.push(h.tab ? `/topic/${h.topicId}?tab=${h.tab}` : `/topic/${h.topicId}`)}
            style={[styles.hit, { borderLeftColor: colors[t.colorKey] }]}
          >
            <Text style={styles.kind}>
              {h.kind} · {t.title}
            </Text>
            <Text style={styles.title} numberOfLines={2}>
              {h.title}
            </Text>
            <Text style={styles.snippet} numberOfLines={3}>
              {h.snippet}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} style={styles.chev} />
          </PressableScale>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  muted: { fontFamily: fonts.text, fontSize: 14, color: c.muted, textAlign: "center", marginTop: spacing.xl },
  count: { fontFamily: fonts.text, fontSize: 13, color: c.muted },
  hit: { backgroundColor: c.surfaceSecondary, borderRadius: radius.md, padding: spacing.lg, paddingRight: spacing.xxl, gap: spacing.xs, borderLeftWidth: 5 },
  kind: { fontFamily: fonts.text, fontSize: 11, color: c.muted, textTransform: "uppercase", letterSpacing: 1 },
  title: { fontFamily: fonts.display, fontSize: 16, fontWeight: "500", color: c.onSurface },
  snippet: { fontFamily: fonts.text, fontSize: 14, lineHeight: 20, color: c.onSurfaceTertiary },
  chev: { position: "absolute", right: spacing.md, top: "50%" },
}));
