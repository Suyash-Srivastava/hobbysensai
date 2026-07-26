import { Pressable, StyleSheet, useColorScheme, View } from "react-native";
import { router } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ProgressBar } from "@/components/progress-bar";
import { useTheme } from "@/hooks/use-theme";
import { Shadow, Spacing } from "@/constants/theme";
import { hobbyProgress, type HobbyPlan } from "@/shared/hobbyPlan.schema";
import { HOBBY_CATEGORY_LABEL, hobbyCategoryColor } from "./hobby-category-icon";

interface HobbyCardProps {
  plan: HobbyPlan;
  isContinue: boolean;
}

export function HobbyCard({ plan, isContinue }: HobbyCardProps) {
  const theme = useTheme();
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const { mastered, total, percent } = hobbyProgress(plan);
  const categoryColor = hobbyCategoryColor(plan.hobbyCategory, scheme);

  return (
    <Pressable
      testID={`hobby-card-${plan.id}`}
      onPress={() => router.push(`/plan/${plan.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${plan.hobby}, ${plan.currentLevel}, ${mastered} of ${total} techniques completed`}
      accessibilityHint="Opens this hobby's technique checklist"
      android_ripple={{ color: theme.borderStrong }}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <ThemedView
        type="backgroundElement"
        style={[
          styles.card,
          { borderColor: isContinue ? categoryColor : theme.border },
          isContinue && styles.cardContinue,
        ]}
      >
        <View style={styles.headerRow}>
          <View style={styles.nameRow}>
            <ThemedText type="subtitle" style={styles.title} numberOfLines={1}>
              {plan.hobby}
            </ThemedText>
          </View>
          <View style={[styles.levelBadge, { backgroundColor: theme.backgroundSelected }]}>
            <ThemedText type="small" style={styles.levelText} numberOfLines={1}>
              {plan.currentLevel}
            </ThemedText>
          </View>
        </View>

        <ThemedText type="eyebrow" style={{ color: categoryColor }}>
          {HOBBY_CATEGORY_LABEL[plan.hobbyCategory]}
        </ThemedText>

        {plan.streak.count > 0 ? (
          <View style={[styles.streakPill, { backgroundColor: `${categoryColor}22` }]}>
            <ThemedText type="small" style={{ color: categoryColor }}>
              🔥 {plan.streak.count}-day streak
            </ThemedText>
          </View>
        ) : null}

        <View style={styles.progressRow}>
          <ThemedText type="small" themeColor="textSecondary">
            {mastered}/{total} mastered
          </ThemedText>
          <View style={styles.barWrapper}>
            <ProgressBar percent={percent} color={categoryColor} showLabel />
          </View>
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.four,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
    boxShadow: Shadow.card,
  },
  cardContinue: {
    borderStyle: "dashed",
    borderWidth: 1.5,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    flex: 1,
  },
  title: {
    fontSize: 19,
    lineHeight: 24,
    textTransform: "capitalize",
    flexShrink: 1,
  },
  levelBadge: {
    borderRadius: Spacing.five,
    paddingVertical: Spacing.half,
    paddingHorizontal: Spacing.two,
  },
  levelText: {
    textTransform: "capitalize",
  },
  streakPill: {
    alignSelf: "flex-start",
    borderRadius: Spacing.five,
    paddingVertical: Spacing.half,
    paddingHorizontal: Spacing.two,
  },
  progressRow: {
    gap: Spacing.one,
    marginTop: Spacing.one,
  },
  barWrapper: {
    marginTop: 2,
  },
  pressed: {
    opacity: 0.7,
  },
});
