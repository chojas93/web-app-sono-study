import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { slides, type SlideKey } from "@/src/data/slides";
import type { Stroke } from "@/src/store/sketches";

// All sketches use one fixed coordinate space so they look the same as a thumbnail or full screen.
export const SKETCH_W = 900;
export const SKETCH_H = 1200;

// Paper stays white in light and dark mode so ink colours always read the same.
const PAPER = "#FFFFFF";

export function SketchView({ bg, strokes, live }: { bg: string | null; strokes: Stroke[]; live?: Stroke | null }) {
  return (
    <View style={styles.paper}>
      {bg && bg in slides ? <Image source={slides[bg as SlideKey]} style={StyleSheet.absoluteFill} contentFit="contain" /> : null}
      <Svg style={StyleSheet.absoluteFill} viewBox={`0 0 ${SKETCH_W} ${SKETCH_H}`} preserveAspectRatio="xMidYMid meet">
        {strokes.map((s, i) => (
          <Path key={i} d={s.d} stroke={s.color} strokeWidth={s.width} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        ))}
        {live ? <Path d={live.d} stroke={live.color} strokeWidth={live.width} strokeLinecap="round" strokeLinejoin="round" fill="none" /> : null}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  paper: { width: "100%", aspectRatio: SKETCH_W / SKETCH_H, backgroundColor: PAPER, overflow: "hidden" },
});
