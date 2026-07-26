import { StyleSheet, View, type ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

interface GradientWashProps {
  /** Hex/rgb color the wash fades from at the top. */
  color: string;
  style?: ViewStyle;
}

/**
 * A vertical color-to-transparent fade, built with react-native-svg rather
 * than `experimental_backgroundImage` - that style key is Fabric-only and
 * silently no-ops on react-native-web, leaving a blank rectangle on web
 * builds instead of the intended wash. SVG renders identically everywhere.
 */
export function GradientWash({ color, style }: GradientWashProps) {
  return (
    <View pointerEvents="none" style={[styles.container, style]}>
      <Svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1 1">
        <Defs>
          <LinearGradient id="wash" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity={0.24} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Path d="M0 0 H1 V1 H0 Z" fill="url(#wash)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
});
