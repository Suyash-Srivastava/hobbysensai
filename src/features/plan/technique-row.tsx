import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/hooks/use-theme";
import { Shadow, Spacing } from "@/constants/theme";
import type { Technique, TechniqueStatus } from "@/shared/hobbyPlan.schema";
import { STATUS_COLOR } from "./technique-status";

// "In progress" gets a loading-style glyph rather than a checkmark variant,
// so its badge reads as "still going" at a glance next to "done" (mastered)
// and "passed on" (skipped).
const STATUS_ICON: Record<TechniqueStatus, string> = {
  "not-started": "",
  learning: "⌛",
  mastered: "✓",
  skipped: "»",
};

interface TechniqueRowProps {
  technique: Technique;
  onPress: () => void;
}

export function TechniqueRow({ technique, onPress }: TechniqueRowProps) {
  const theme = useTheme();
  // Only a completed technique reads as "done, no need to look again" - a
  // skipped one was never finished, so it stays plain rather than crossed
  // out (which would visually claim it as done).
  const isCompleted = technique.status === "mastered";
  const isSkipped = technique.status === "skipped";

  const statusColor = technique.status === "not-started" ? undefined : STATUS_COLOR[technique.status];

  const badgeStyle =
    technique.status === "mastered"
      ? { backgroundColor: statusColor, borderColor: statusColor }
      : technique.status === "learning"
        ? { backgroundColor: `${statusColor}26`, borderColor: statusColor }
        : technique.status === "skipped"
          ? { backgroundColor: theme.backgroundSelected, borderColor: theme.border }
          : { backgroundColor: "transparent", borderColor: theme.borderStrong };

  const badgeTextColor = technique.status === "mastered" ? theme.accentText : (statusColor ?? theme.textSecondary);

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
          <ThemedText
            type="smallBold"
            style={[isCompleted && styles.completedText, isSkipped && styles.skippedText]}
            numberOfLines={2}
          >
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
  // Crossed out = done, not "won't do" - only a completed technique gets
  // struck through.
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.7,
  },
  // Skipped is de-emphasized (dimmed) but not struck through, since it was
  // never actually finished.
  skippedText: {
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
