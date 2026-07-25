import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/hooks/use-theme";
import { Shadow, Spacing } from "@/constants/theme";
import type { Technique, TechniqueStatus } from "@/shared/hobbyPlan.schema";

const STATUS_ICON: Record<TechniqueStatus, string> = {
  "not-started": "",
  learning: "◐",
  mastered: "✓",
  skipped: "»",
};

interface TechniqueRowProps {
  technique: Technique;
  /** The hobby's identity color - used for the mastered/learning badge instead of the generic app accent. */
  categoryColor: string;
  onPress: () => void;
}

export function TechniqueRow({ technique, categoryColor, onPress }: TechniqueRowProps) {
  const theme = useTheme();
  const isSkipped = technique.status === "skipped";

  const badgeStyle =
    technique.status === "mastered"
      ? { backgroundColor: categoryColor, borderColor: categoryColor }
      : technique.status === "learning"
        ? { backgroundColor: `${categoryColor}26`, borderColor: categoryColor }
        : technique.status === "skipped"
          ? { backgroundColor: theme.backgroundSelected, borderColor: theme.border }
          : { backgroundColor: "transparent", borderColor: theme.borderStrong };

  const badgeTextColor =
    technique.status === "mastered" ? theme.accentText : technique.status === "learning" ? categoryColor : theme.textSecondary;

  return (
    <Pressable
      testID={`technique-row-${technique.id}`}
      onPress={onPress}
      android_ripple={{ color: theme.borderStrong }}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <ThemedView type="backgroundElement" style={[styles.row, { borderColor: theme.border }]}>
        <View style={[styles.badge, badgeStyle]}>
          <ThemedText style={[styles.badgeIcon, { color: badgeTextColor }]}>{STATUS_ICON[technique.status]}</ThemedText>
        </View>
        <View style={styles.textColumn}>
          <ThemedText type="smallBold" style={isSkipped ? styles.skippedText : undefined} numberOfLines={2}>
            {technique.title}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            ~{technique.estimatedHours}h
          </ThemedText>
        </View>
        <ThemedText themeColor="textSecondary" style={styles.chevron}>
          ›
        </ThemedText>
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
    borderWidth: 1,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    boxShadow: Shadow.card,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeIcon: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 18,
  },
  textColumn: {
    flex: 1,
    gap: Spacing.half,
  },
  skippedText: {
    textDecorationLine: "line-through",
    opacity: 0.55,
  },
  chevron: {
    fontSize: 20,
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.7,
  },
});
