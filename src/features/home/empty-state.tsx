import { ScrollView, StyleSheet, useColorScheme, View } from "react-native";
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
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <View style={styles.content}>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // A ScrollView's contentContainerStyle, not a plain View: centering via
  // justifyContent only looks right when the content actually fits the
  // available height. Capping the hero's width (below) fixed the wide-and-
  // short-on-content case, but a short *viewport* (a small/landscape
  // browser window, dev tools open, etc.) has the identical problem in the
  // other axis - content taller than the space centers into overflowing
  // both up and down, pushing the hero up behind the header above it.
  // flexGrow: 1 keeps the centering when there's room to spare; when there
  // isn't, this scrolls instead of overflowing into the header.
  //
  // The ScrollView itself also needs style={flex:1} (not just
  // contentContainerStyle) to bound itself within its flex:1 parent -
  // the exact same lesson as the FlatList-without-flex:1 bug on the Plan
  // screen: without it, a ScrollView doesn't reliably know its own
  // available height, which is the whole point of adding one here.
  scroll: {
    flex: 1,
    width: "100%",
  },
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
  },
  // Caps the whole empty-state column at a phone-ish width regardless of how
  // wide the actual page content area is. Without this, the hero's
  // width:'100%' + aspectRatio:1 scales with the page's own (up to 800px)
  // content width on desktop/web - a ~700px-tall square.
  content: {
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    gap: Spacing.two,
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
