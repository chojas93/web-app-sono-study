import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import Svg, { Path, Text as SvgText } from "react-native-svg";

import { slides, type SlideKey } from "@/src/data/slides";
import type { SketchLabel, Stroke } from "@/src/store/sketches";

// All sketches use one fixed coordinate space so they look the same as a thumbnail or full screen.
export const SKETCH_W = 900;
export const SKETCH_H = 1200;
export const LABEL_SIZE = 44; // label font size in sketch units

// Rough label box (for tapping / dragging labels), centred on the label's x,y.
export const labelBox = (l: SketchLabel) => ({ w: Math.max(60, l.text.length * LABEL_SIZE * 0.56), h: LABEL_SIZE * 1.2 });

// Paper stays white in light and dark mode so ink colours always read the same.
const PAPER = "#FFFFFF";

export function SketchView({ bg, strokes, labels, live, selected }: { bg: string | null; strokes: Stroke[]; labels?: SketchLabel[]; live?: Stroke | null; selected?: string | null }) {
  return (
    <View style={styles.paper}>
      {bg && bg in slides ? <Image source={slides[bg as SlideKey]} style={StyleSheet.absoluteFill} contentFit="contain" /> : null}
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none" viewBox={`0 0 ${SKETCH_W} ${SKETCH_H}`} preserveAspectRatio="xMidYMid meet">
        {strokes.map((s, i) => (
          <Path key={i} d={s.d} stroke={s.color} strokeWidth={s.width} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        ))}
        {live ? <Path d={live.d} stroke={live.color} strokeWidth={live.width} strokeLinecap="round" strokeLinejoin="round" fill="none" /> : null}
        {(labels ?? []).map((l) => (
          // White halo underneath keeps labels readable over pictures and ink.
          [
            <SvgText key={`${l.id}-halo`} x={l.x} y={l.y} fontSize={LABEL_SIZE} fontWeight="bold" textAnchor="middle" alignmentBaseline="middle" stroke="#FFFFFF" strokeWidth={10} strokeLinejoin="round" fill="#FFFFFF">
              {l.text}
            </SvgText>,
            <SvgText key={l.id} x={l.x} y={l.y} fontSize={LABEL_SIZE} fontWeight="bold" textAnchor="middle" alignmentBaseline="middle" fill={l.color} textDecoration={selected === l.id ? "underline" : undefined}>
              {l.text}
            </SvgText>,
          ]
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  paper: { width: "100%", aspectRatio: SKETCH_W / SKETCH_H, backgroundColor: PAPER, overflow: "hidden" },
});
