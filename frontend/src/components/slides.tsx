import { Image } from "expo-image";
import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconButton, PressableScale } from "@/src/components/ui";
import { slides } from "@/src/data/slides";
import type { SlideImage } from "@/src/data/types";
import { fonts, makeStyles, radius, spacing, useTheme } from "@/src/theme";

// Horizontal strip of slide thumbnails; tap opens a full-screen viewer.
export function SlideStrip({ images, testIDPrefix }: { images: SlideImage[]; testIDPrefix: string }) {
  const styles = useStyles();
  const [open, setOpen] = useState<number | null>(null);
  if (images.length === 0) return null;
  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
        {images.map((img, i) => (
          <PressableScale key={img.key} testID={`${testIDPrefix}-image-${i}`} onPress={() => setOpen(i)} style={styles.thumbWrap}>
            <Image source={slides[img.key]} style={styles.thumb} contentFit="cover" transition={150} />
            <Text style={styles.thumbCaption} numberOfLines={2}>
              {img.caption}
            </Text>
          </PressableScale>
        ))}
      </ScrollView>
      <SlideViewer images={images} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
    </>
  );
}

export function SlideViewer({
  images,
  index,
  onClose,
  onIndex,
}: {
  images: SlideImage[];
  index: number | null;
  onClose: () => void;
  onIndex?: (i: number) => void;
}) {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();
  const img = index !== null ? images[index] : null;
  return (
    <Modal visible={img !== null} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.viewer, { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.lg }]} testID="slide-viewer">
        <View style={styles.viewerTop}>
          <Text style={styles.viewerCount}>{index !== null && images.length > 1 ? `${index + 1} / ${images.length}` : ""}</Text>
          <IconButton testID="slide-viewer-close" name="close" onPress={onClose} color="#FFFFFF" bg="rgba(255,255,255,0.15)" />
        </View>
        <Pressable style={styles.viewerBody} onPress={onClose}>
          {img ? <Image source={slides[img.key]} style={styles.full} contentFit="contain" /> : null}
        </Pressable>
        {img ? (
          <Text style={styles.viewerCaption} testID="slide-viewer-caption">
            {img.caption}
          </Text>
        ) : null}
        {index !== null && images.length > 1 && onIndex ? (
          <View style={styles.viewerNav}>
            <IconButton testID="slide-viewer-prev" name="chevron-back" onPress={() => onIndex((index - 1 + images.length) % images.length)} color="#FFFFFF" bg="rgba(255,255,255,0.15)" />
            <IconButton testID="slide-viewer-next" name="chevron-forward" onPress={() => onIndex((index + 1) % images.length)} color="#FFFFFF" bg={colors.brandPrimary} />
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const useStyles = makeStyles((c) => ({
  strip: { gap: spacing.sm, paddingVertical: spacing.xs },
  thumbWrap: { width: 150, gap: spacing.xs },
  thumb: { width: 150, height: 110, borderRadius: radius.md, backgroundColor: "#000000" },
  thumbCaption: { fontFamily: fonts.text, fontSize: 12, color: c.onSurfaceTertiary, lineHeight: 16 },
  viewer: { flex: 1, backgroundColor: "rgba(0,0,0,0.95)", paddingHorizontal: spacing.lg, gap: spacing.md },
  viewerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  viewerCount: { fontFamily: fonts.text, fontSize: 14, color: "#FFFFFF" },
  viewerBody: { flex: 1 },
  full: { flex: 1, width: "100%" },
  viewerCaption: { fontFamily: fonts.display, fontSize: 18, color: "#FFFFFF", textAlign: "center" },
  viewerNav: { flexDirection: "row", justifyContent: "center", gap: spacing.xl },
}));
