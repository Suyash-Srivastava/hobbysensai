import { StyleSheet, View } from "react-native";
import { useTheme } from "@/hooks/use-theme";
import { ThemedText } from "@/components/themed-text";

interface ProgressBarProps {
  percent: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
  testID?: string;
}

export function ProgressBar({ percent, color, height = 6, showLabel = false, testID }: ProgressBarProps) {
  const theme = useTheme();
  const clamped = Math.max(0, Math.min(100, percent));
  const fill = color ?? theme.progressFill;

  return (
    <View style={styles.container}>
      <View
        testID={testID}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        style={[styles.track, { height, borderRadius: height / 2, backgroundColor: theme.progressTrack }]}
      >
        <View style={[styles.fill, { width: `${clamped}%`, height, borderRadius: height / 2, backgroundColor: fill }]} />
      </View>
      {showLabel ? (
        <ThemedText type="smallBold" style={styles.label}>
          {clamped}%
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  track: {
    flex: 1,
    overflow: "hidden",
  },
  fill: {},
  label: {
    minWidth: 36,
    textAlign: "right",
  },
});
