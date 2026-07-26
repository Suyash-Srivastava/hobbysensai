import { StyleSheet, useColorScheme, View } from "react-native";
import { router } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/button";
import { useTheme } from "@/hooks/use-theme";
import { Spacing } from "@/constants/theme";
import type { HobbyCategory } from "@/shared/hobbyPlan.schema";
import { HOBBY_CATEGORY_LABEL, hobbyCategoryColor } from "./hobby-category-icon";
import { EmptyStateHero } from "./empty-state-hero";

const SUGGESTED_CATEGORIES: HobbyCategory[] = [
  "physical-skill",
  "musical",
  "strategy-game",
  "creative-craft",
  "knowledge-based",
];

export function EmptyState() {
  const theme = useTheme();
  const scheme = useColorScheme() === "dark" ? "dark" : "light";

  return (
    <View style={styles.container}>
      <View style={styles.heroWrapper}>
        <EmptyStateHero />
      </View>

      <ThemedText type="title" style={styles.headline}>
        The first step is the hardest.
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.subhead}>
        No hobbies yet. What would you like to master today?
      </ThemedText>

      <Button label="Add your first hobby" icon="+" onPress={() => router.push("/add-hobby")} style={styles.cta} />

      {/* Display-only category hints, not a second "add hobby" tap target -
          the button above is the one and only action on this screen. */}
      <View style={styles.chipsRow} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {SUGGESTED_CATEGORIES.map((category) => {
          const color = hobbyCategoryColor(category, scheme);
          return (
            <View key={category} style={[styles.chip, { borderColor: theme.border }]}>
              <ThemedText type="small" style={{ color }}>
                {HOBBY_CATEGORY_LABEL[category]}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  heroWrapper: {
    width: "100%",
    marginBottom: Spacing.three,
  },
  headline: {
    textAlign: "center",
    fontSize: 28,
    lineHeight: 34,
  },
  subhead: {
    textAlign: "center",
    marginBottom: Spacing.three,
  },
  cta: {
    alignSelf: "stretch",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
  chip: {
    borderRadius: Spacing.five,
    borderWidth: 1,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
  },
});
