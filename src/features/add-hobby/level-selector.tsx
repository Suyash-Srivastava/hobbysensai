import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { Spacing } from "@/constants/theme";
import type { HobbyLevel } from "@/shared/hobbyPlan.schema";

const LEVELS: { value: HobbyLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

interface LevelSelectorProps {
  value: HobbyLevel;
  onChange: (level: HobbyLevel) => void;
}

export function LevelSelector({ value, onChange }: LevelSelectorProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      {LEVELS.map((level) => {
        const selected = level.value === value;
        return (
          <Pressable
            key={level.value}
            testID={`level-${level.value}`}
            onPress={() => onChange(level.value)}
            android_ripple={{ color: theme.borderStrong }}
            style={[styles.pill, selected && { backgroundColor: theme.accent }]}
          >
            <ThemedText type={selected ? "smallBold" : "small"} style={{ color: selected ? theme.accentText : theme.textSecondary }}>
              {level.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  pill: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    alignItems: "center",
  },
});
