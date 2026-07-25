import { FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/button";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { useHobbyPlansStore } from "@/store/hobbyPlansStore";
import type { HobbyPlan } from "@/shared/hobbyPlan.schema";
import { HobbyCard } from "./hobby-card";
import { EmptyState } from "./empty-state";

export function HomeScreen() {
  const plans = useHobbyPlansStore((state) => state.plans);
  const streak = useHobbyPlansStore((state) => state.streak);
  const lastActiveHobbyId = useHobbyPlansStore((state) => state.lastActiveHobbyId);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="eyebrow">Studio Dashboard</ThemedText>
          <ThemedText type="title" style={styles.title}>
            Your Studio
          </ThemedText>
        </View>

        {plans.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <FlatList<HobbyPlan>
              data={plans}
              keyExtractor={(plan) => plan.id}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => (
                <HobbyCard plan={item} isContinue={item.id === lastActiveHobbyId} streakCount={streak.count} />
              )}
            />
            <Button
              label="Add a hobby"
              icon="+"
              onPress={() => router.push("/add-hobby")}
              style={styles.addButton}
              testID="add-hobby-button"
            />
          </>
        )}
      </SafeAreaView>
    </ThemedView>
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
    paddingBottom: Spacing.four,
    gap: Spacing.one,
  },
  title: {
    fontSize: 30,
  },
  list: {
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  addButton: {
    position: "absolute",
    bottom: Spacing.four,
    left: Spacing.four,
    right: Spacing.four,
  },
});
