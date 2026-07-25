import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useTheme } from "@/hooks/use-theme";
import { ThemedText } from "@/components/themed-text";

interface ProgressRingProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  testID?: string;
  /** Overrides the default status-green fill - used to give each hobby its own ring color. */
  color?: string;
}

export function ProgressRing({ percent, size = 56, strokeWidth = 6, showLabel = true, testID, color }: ProgressRingProps) {
  const theme = useTheme();
  const fill = color ?? theme.progressFill;
  const clamped = Math.max(0, Math.min(100, percent));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - clamped / 100);

  return (
    <View
      testID={testID}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={theme.progressTrack} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={fill}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {showLabel ? (
        <View style={styles.labelContainer}>
          <ThemedText style={[styles.label, { fontSize: size * 0.26 }]}>{clamped}%</ThemedText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  labelContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontWeight: "600",
  },
});
