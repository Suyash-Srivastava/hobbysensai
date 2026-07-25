import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { useHobbyPlansStore } from "@/store/hobbyPlansStore";
import type { HobbyPlan } from "@/shared/hobbyPlan.schema";
import { HobbyCard } from "./hobby-card";

export function HomeScreen() {
  const plans = useHobbyPlansStore((state) => state.plans);
  const streak = useHobbyPlansStore((state) => state.streak);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <ThemedText type="title" style={styles.title}>
              Your hobbies
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              A focused technique list per hobby - not an endless feed.
            </ThemedText>
            {streak.count > 0 ? (
              <ThemedText type="small" themeColor="textSecondary">
                🔥 {streak.count} day streak
              </ThemedText>
            ) : null}
          </View>
        </View>

        {plans.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList<HobbyPlan>
            data={plans}
            keyExtractor={(plan) => plan.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => <HobbyCard plan={item} />}
          />
        )}

        <Pressable
          testID="add-hobby-button"
          onPress={() => router.push("/add-hobby")}
          style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
        >
          <ThemedText type="smallBold" style={styles.addButtonLabel}>
            + Add a hobby
          </ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <ThemedText style={styles.emptyEmoji}>🌱</ThemedText>
      <ThemedText type="subtitle" style={styles.emptyTitle}>
        No hobbies yet
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.emptyBody}>
        Add one below and get a focused, AI-built list of 5-8 techniques to learn - no endless
        searching required.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  safeArea: {
    flex: 1,
    width: "100%",
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
  },
  header: {
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
  },
  list: {
    gap: Spacing.two,
    paddingBottom: Spacing.six,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  emptyEmoji: {
    fontSize: 40,
  },
  emptyTitle: {
    textAlign: "center",
  },
  emptyBody: {
    textAlign: "center",
  },
  addButton: {
    position: "absolute",
    bottom: Spacing.four,
    alignSelf: "center",
    backgroundColor: "#0ca30c",
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.five,
  },
  addButtonPressed: {
    opacity: 0.85,
  },
  addButtonLabel: {
    color: "#ffffff",
  },
});
