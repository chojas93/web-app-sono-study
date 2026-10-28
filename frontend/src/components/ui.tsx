import Ionicons from "@react-native-vector-icons/ionicons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { ComponentProps, ReactNode, useEffect } from "react";
import { Platform, Pressable, StyleProp, Text, View, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fonts, makeStyles, radius, spacing, useTheme } from "@/src/theme";

export type IconName = ComponentProps<typeof Ionicons>["name"];
export { Ionicons };

export function tap() {
  if (Platform.OS !== "web") Haptics.selectionAsync().catch(() => {});
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PressableScale({
  children,
  style,
  onPress,
  testID,
  disabled,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  testID?: string;
  disabled?: boolean;
}) {
  const scale = useSharedValue(1);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedPressable
      testID={testID}
      disabled={disabled}
      onPressIn={() => (scale.value = withSpring(0.96, { damping: 15 }))}
      onPressOut={() => (scale.value = withSpring(1, { damping: 15 }))}
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={[style, a]}
    >
      {children}
    </AnimatedPressable>
  );
}

export function ProgressBar({ value, color, height = 8, testID }: { value: number; color?: string; height?: number; testID?: string }) {
  const { colors } = useTheme();
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = withTiming(Math.max(0, Math.min(100, value)), { duration: 600 });
  }, [value, w]);
  const a = useAnimatedStyle(() => ({ width: `${w.value}%` }));
  return (
    <View testID={testID} style={{ height, borderRadius: radius.pill, backgroundColor: colors.surfaceTertiary, overflow: "hidden" }}>
      <Animated.View style={[{ height, borderRadius: radius.pill, backgroundColor: color ?? colors.brandPrimary }, a]} />
    </View>
  );
}

export function IconButton({
  name,
  onPress,
  testID,
  color,
  bg,
}: {
  name: IconName;
  onPress: () => void;
  testID: string;
  color?: string;
  bg?: string;
}) {
  const { colors } = useTheme();
  return (
    <PressableScale
      testID={testID}
      onPress={onPress}
      style={{ width: 44, height: 44, borderRadius: radius.pill, alignItems: "center", justifyContent: "center", backgroundColor: bg ?? colors.surfaceSecondary }}
    >
      <Ionicons name={name} size={22} color={color ?? colors.onSurface} />
    </PressableScale>
  );
}

export function StackHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  return (
    <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
      <IconButton testID="header-back-button" name="chevron-back" onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))} />
      <View style={styles.headerText}>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
      {right}
    </View>
  );
}

export function Button({
  label,
  onPress,
  testID,
  icon,
  variant = "primary",
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  testID: string;
  icon?: IconName;
  variant?: "primary" | "secondary" | "success" | "warning" | "ghost";
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const map = {
    primary: [colors.brandPrimary, colors.onBrandPrimary],
    secondary: [colors.surfaceTertiary, colors.onSurface],
    success: [colors.success, colors.onSuccess],
    warning: [colors.warning, colors.onWarning],
    ghost: [colors.surfaceSecondary, colors.onSurface],
  } as const;
  const [bg, fg] = map[variant];
  return (
    <PressableScale
      testID={testID}
      disabled={disabled}
      onPress={onPress}
      style={[
        {
          minHeight: 52,
          borderRadius: radius.pill,
          backgroundColor: bg,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: spacing.sm,
          paddingHorizontal: spacing.xl,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={20} color={fg} /> : null}
      <Text style={{ fontFamily: fonts.display, fontSize: 16, fontWeight: "500", color: fg }}>{label}</Text>
    </PressableScale>
  );
}

const useStyles = makeStyles((c) => ({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: c.surface,
    borderBottomWidth: 1,
    borderBottomColor: c.divider,
  },
  headerText: { flex: 1 },
  subtitle: { fontFamily: fonts.text, fontSize: 12, color: c.muted, textTransform: "uppercase", letterSpacing: 1 },
  title: { fontFamily: fonts.display, fontSize: 20, fontWeight: "500", color: c.onSurface },
}));
