// This file intentionally uses the classic `Animated` API rather than Reanimated:
// pulling in Reanimated's worklet runtime for this one cosmetic banner measured ~800KB
// added to the web bundle - not worth it for a fade/slide Animated already does natively
// at near-zero cost. (On newer eslint-plugin-react-hooks/React Compiler setups, this pattern
// trips a react-hooks/refs false positive since it assumes Reanimated shared values - not
// applicable on the eslint-config-expo version this project currently pins.)
import { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";

interface MasteryCelebrationProps {
  /** Bump this to a new value each time a technique is mastered, to re-trigger the animation. */
  triggerKey: number;
  /** The hobby's identity color, so the celebration matches the screen it's happening on. */
  color: string;
  /**
   * Dark-mode category colors are light pastels (readable against a dark
   * page); light-mode ones are saturated/dark (readable against a light
   * page) - either way, the text sitting ON the color needs the opposite
   * treatment from the app's own current-mode text color.
   */
  textColor: string;
  /** Safe-area top inset - position:"absolute" ignores an ancestor's padding in RN, so this has to be added directly. */
  topInset: number;
}

/**
 * A small, self-dismissing banner - the "delight" bonus kept intentionally
 * tiny (no confetti library / particle system) so it reinforces the core
 * checklist loop instead of becoming its own feature.
 */
export function MasteryCelebration({ triggerKey, color, textColor, topInset }: MasteryCelebrationProps) {
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
    <Animated.View
      pointerEvents="none"
      style={[styles.banner, { top: topInset + Spacing.three, backgroundColor: color }, animatedStyle]}
    >
      <ThemedText style={[styles.text, { color: textColor }]}>🎉 Technique mastered!</ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    alignSelf: "center",
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.five,
    zIndex: 10,
  },
  text: {
    fontWeight: "700",
  },
});
