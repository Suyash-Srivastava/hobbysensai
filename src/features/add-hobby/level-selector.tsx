import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
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
  return (
    <View style={styles.row}>
      {LEVELS.map((level) => {
        const selected = level.value === value;
        return (
          <Pressable
            key={level.value}
            testID={`level-${level.value}`}
            onPress={() => onChange(level.value)}
            style={[styles.pill, selected && styles.pillSelected]}
          >
            <ThemedText type="small" style={selected && styles.labelSelected}>
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
    backgroundColor: "#00000010",
  },
  pillSelected: {
    backgroundColor: "#0ca30c",
  },
  labelSelected: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
