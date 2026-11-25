import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { SketchView } from "@/src/components/sketch-canvas";
import { Ionicons, PressableScale } from "@/src/components/ui";
import { slides } from "@/src/data/slides";
import type { Section } from "@/src/data/types";
import { useSketches } from "@/src/store/sketches";
import { fonts, makeStyles, radius, spacing, useTheme } from "@/src/theme";

// Saved sketches for one notes section + a "New sketch" button (blank page or draw over a section picture).
export function SectionSketches({ section }: { section: Section }) {
  const { sketches } = useSketches();
  const { colors } = useTheme();
  const styles = useStyles();
  const [picking, setPicking] = useState(false);
  const list = sketches[section.id] ?? [];

  const start = (bg?: string) => {
    setPicking(false);
    router.push(`/sketch/${section.id}${bg ? `?bg=${bg}` : ""}`);
  };

  return (
    <View style={styles.wrap} testID={`section-sketches-${section.id}`}>
      <View style={styles.head}>
        <Ionicons name="brush" size={16} color={colors.muted} />
        <Text style={styles.label}>My sketches{list.length ? ` (${list.length})` : ""}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
        <PressableScale testID={`section-new-sketch-${section.id}`} onPress={() => (section.images.length ? setPicking(true) : start())} style={styles.newBtn}>
          <Ionicons name="add" size={26} color={colors.brandPrimary} />
          <Text style={[styles.newText, { color: colors.brandPrimary }]}>New sketch</Text>
        </PressableScale>
        {list.map((s) => (
          <PressableScale key={s.id} testID={`section-sketch-${s.id}`} onPress={() => router.push(`/sketch/${section.id}?sketch=${s.id}`)} style={styles.thumb}>
            <SketchView bg={s.bg} strokes={s.strokes} />
          </PressableScale>
        ))}
      </ScrollView>

      <Modal visible={picking} transparent animationType="fade" onRequestClose={() => setPicking(false)}>
        <Pressable style={styles.backdrop} onPress={() => setPicking(false)} testID="sketch-picker-backdrop">
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <Text style={styles.sheetTitle}>Start a sketch</Text>
            <PressableScale testID="sketch-start-blank" onPress={() => start()} style={styles.blankBtn}>
              <Ionicons name="document-outline" size={22} color={colors.onSurface} />
              <Text style={styles.blankText}>Blank page</Text>
            </PressableScale>
            <Text style={styles.label}>Or draw over a picture</Text>
            <ScrollView horizontal contentContainerStyle={styles.strip}>
              {section.images.map((im) => (
                <PressableScale key={im.key} testID={`sketch-start-bg-${im.key}`} onPress={() => start(im.key)} style={styles.pick}>
                  <Image source={slides[im.key]} style={styles.pickImg} contentFit="cover" />
                </PressableScale>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  wrap: { gap: spacing.sm },
  head: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  label: { fontFamily: fonts.text, fontSize: 13, color: c.muted },
  strip: { gap: spacing.sm, paddingVertical: 2 },
  newBtn: { width: 84, height: 112, borderRadius: radius.md, borderWidth: 1.5, borderStyle: "dashed", borderColor: c.brandPrimary, alignItems: "center", justifyContent: "center", gap: 4 },
  newText: { fontFamily: fonts.text, fontSize: 12 },
  thumb: { width: 84, borderRadius: radius.md, overflow: "hidden", borderWidth: 1, borderColor: c.border },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: { backgroundColor: c.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md },
  sheetTitle: { fontFamily: fonts.display, fontSize: 18, color: c.onSurface },
  blankBtn: { flexDirection: "row", alignItems: "center", gap: spacing.sm, minHeight: 48, paddingHorizontal: spacing.lg, borderRadius: radius.md, backgroundColor: c.surfaceTertiary },
  blankText: { fontFamily: fonts.text, fontSize: 15, color: c.onSurface },
  pick: { borderRadius: radius.md, overflow: "hidden" },
  pickImg: { width: 120, height: 90, backgroundColor: c.surfaceTertiary },
}));
