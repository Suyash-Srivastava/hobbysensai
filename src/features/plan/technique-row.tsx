import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import type { Technique } from "@/shared/hobbyPlan.schema";

const STATUS_ICON: Record<Technique["status"], string> = {
  "not-started": "○",
  learning: "🕐",
  mastered: "✅",
  skipped: "⏭️",
};

interface TechniqueRowProps {
  technique: Technique;
  onPress: () => void;
}

export function TechniqueRow({ technique, onPress }: TechniqueRowProps) {
  const isSkipped = technique.status === "skipped";

  return (
    <Pressable testID={`technique-row-${technique.id}`} onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView type="backgroundElement" style={styles.row}>
        <ThemedText style={styles.icon}>{STATUS_ICON[technique.status]}</ThemedText>
        <View style={styles.textColumn}>
          <ThemedText
            type="smallBold"
            style={isSkipped && styles.skippedText}
            numberOfLines={1}
          >
            {technique.title}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            ~{technique.estimatedHours}h
          </ThemedText>
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  icon: {
    fontSize: 20,
  },
  textColumn: {
    flex: 1,
    gap: Spacing.half,
  },
  skippedText: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.7,
  },
});
