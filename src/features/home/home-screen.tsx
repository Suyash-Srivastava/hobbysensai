import { FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  // useSafeAreaInsets (a hook) rather than <SafeAreaView> (a component) -
  // more reliable when nested inside react-native-screens' native stack,
  // which is what expo-router uses under the hood for this screen.
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.safeArea, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
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
              // position: "absolute" ignores the parent's paddingBottom in
              // React Native (unlike web CSS) - the inset has to be baked
              // into "bottom" directly, or this sits underneath the
              // Android 3-button nav bar / iOS home indicator.
              style={[styles.addButton, { bottom: insets.bottom + Spacing.four }]}
              testID="add-hobby-button"
            />
          </>
        )}
      </View>

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
