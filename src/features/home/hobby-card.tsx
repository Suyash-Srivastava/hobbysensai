import { Pressable, StyleSheet, useColorScheme, View } from "react-native";
import { router } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ProgressRing } from "@/components/progress-ring";
import { useTheme } from "@/hooks/use-theme";
import { Shadow, Spacing } from "@/constants/theme";
import { hobbyProgress, type HobbyPlan } from "@/shared/hobbyPlan.schema";
import { HOBBY_CATEGORY_EMOJI, hobbyCategoryColor } from "./hobby-category-icon";

interface HobbyCardProps {
  plan: HobbyPlan;
}

export function HobbyCard({ plan }: HobbyCardProps) {
  const theme = useTheme();
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const { mastered, total, percent } = hobbyProgress(plan);
  const categoryColor = hobbyCategoryColor(plan.hobbyCategory, scheme);

  return (
    <Pressable
      testID={`hobby-card-${plan.id}`}
      onPress={() => router.push(`/plan/${plan.id}`)}
      android_ripple={{ color: theme.borderStrong }}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <ThemedView
        type="backgroundElement"
        style={[styles.card, { borderColor: theme.border, borderLeftColor: categoryColor }]}
      >
        <View style={[styles.iconTile, { backgroundColor: `${categoryColor}26` }]}>
          <ThemedText style={styles.iconEmoji}>{HOBBY_CATEGORY_EMOJI[plan.hobbyCategory]}</ThemedText>
        </View>
        <View style={styles.textColumn}>
          <ThemedText type="smallBold" style={styles.title} numberOfLines={1}>
            {plan.hobby}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {mastered}/{total} mastered · {plan.currentLevel}
          </ThemedText>
        </View>
        <ProgressRing percent={percent} size={44} strokeWidth={5} color={categoryColor} />
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Spacing.four,
    borderWidth: 1,
    borderLeftWidth: 4,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
    boxShadow: Shadow.card,
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: Spacing.three,
    alignItems: "center",
    justifyContent: "center",
  },
  iconEmoji: {
    fontSize: 22,
  },
  textColumn: {
    flex: 1,
    gap: Spacing.half,
  },
  title: {
    fontSize: 17,
    textTransform: "capitalize",
  },
  pressed: {
    opacity: 0.7,
  },
});
