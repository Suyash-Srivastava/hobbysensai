/* eslint-disable react-hooks/refs --
 * This file intentionally uses the classic `Animated` API rather than Reanimated.
 * `react-hooks/refs` assumes animated values are Reanimated shared values accessed inside
 * useAnimatedStyle; Animated.Value's ref-like `.current`/`.interpolate()` pattern is its own
 * supported, non-worklet API and trips the same rule as a false positive. Pulling in
 * Reanimated's worklet runtime for this one cosmetic banner measured ~800KB added to the web
 * bundle - not worth it for a fade/slide Animated already does natively at near-zero cost.
 */
import { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";

interface MasteryCelebrationProps {
  /** Bump this to a new value each time a technique is mastered, to re-trigger the animation. */
  triggerKey: number;
}

/**
 * A small, self-dismissing banner - the "delight" bonus kept intentionally
 * tiny (no confetti library / particle system) so it reinforces the core
 * checklist loop instead of becoming its own feature.
 */
export function MasteryCelebration({ triggerKey }: MasteryCelebrationProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (triggerKey === 0) return;
    progress.setValue(0);
    Animated.sequence([
      Animated.timing(progress, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.delay(1200),
      Animated.timing(progress, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [triggerKey, progress]);

  if (triggerKey === 0) return null;

  const animatedStyle = {
    opacity: progress,
    transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }) }],
  };

  return (
    <Animated.View pointerEvents="none" style={[styles.banner, animatedStyle]}>
      <ThemedText style={styles.text}>🎉 Technique mastered!</ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: Spacing.three,
    alignSelf: "center",
    backgroundColor: "#0ca30c",
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.five,
    zIndex: 10,
  },
  text: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
