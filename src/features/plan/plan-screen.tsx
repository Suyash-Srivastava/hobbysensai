import { useState } from "react";
import { FlatList, Platform, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ProgressRing } from "@/components/progress-ring";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { useHobbyPlansStore } from "@/store/hobbyPlansStore";
import { hobbyProgress, type Technique, type TechniqueStatus } from "@/shared/hobbyPlan.schema";
import { HOBBY_CATEGORY_EMOJI } from "@/features/home/hobby-category-icon";
import { TechniqueDetailSheet } from "@/features/technique-detail/technique-detail-sheet";
import { TechniqueRow } from "./technique-row";
import { MasteryCelebration } from "./mastery-celebration";

export function PlanScreen() {
  const { hobbyId } = useLocalSearchParams<{ hobbyId: string }>();
  const plan = useHobbyPlansStore((state) => state.plans.find((p) => p.id === hobbyId));
  const streak = useHobbyPlansStore((state) => state.streak);
  const setTechniqueStatus = useHobbyPlansStore((state) => state.setTechniqueStatus);

  const [selectedTechniqueId, setSelectedTechniqueId] = useState<string | null>(null);
  const [celebrationKey, setCelebrationKey] = useState(0);

  if (!plan) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText type="subtitle">Hobby not found</ThemedText>
          <Pressable onPress={() => router.back()}>
            <ThemedText type="link">Go back</ThemedText>
          </Pressable>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const { mastered, total, percent } = hobbyProgress(plan);
  const selectedTechnique = plan.techniques.find((t) => t.id === selectedTechniqueId) ?? null;
  const sortedTechniques = [...plan.techniques].sort((a, b) => a.order - b.order);

  const handleChangeStatus = async (status: TechniqueStatus) => {
    if (!selectedTechnique) return;
    await setTechniqueStatus(plan.id, selectedTechnique.id, status);
    if (status === "mastered") {
      setCelebrationKey((key) => key + 1);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    }
    setSelectedTechniqueId(null);
  };

  return (
    <ThemedView style={styles.container}>
      <MasteryCelebration triggerKey={celebrationKey} />
      <SafeAreaView style={styles.safeArea}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backRow}>
          <ThemedText type="link">← Home</ThemedText>
        </Pressable>

        <View style={styles.header}>
          <View style={styles.headerText}>
            <ThemedText type="title" style={styles.title} numberOfLines={2}>
              {HOBBY_CATEGORY_EMOJI[plan.hobbyCategory]} {plan.hobby}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {plan.currentLevel} · {plan.goal}
            </ThemedText>
            {streak.count > 0 ? (
              <ThemedText type="small" themeColor="textSecondary">
                🔥 {streak.count} day streak
              </ThemedText>
            ) : null}
          </View>
          <ProgressRing percent={percent} size={64} strokeWidth={7} />
        </View>

        <ThemedText type="small" themeColor="textSecondary" style={styles.progressLabel}>
          {mastered} of {total} techniques mastered
        </ThemedText>

        <FlatList<Technique>
          data={sortedTechniques}
          keyExtractor={(technique) => technique.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TechniqueRow technique={item} onPress={() => setSelectedTechniqueId(item.id)} />
          )}
        />
      </SafeAreaView>

      <TechniqueDetailSheet
        technique={selectedTechnique}
        onClose={() => setSelectedTechniqueId(null)}
        onChangeStatus={handleChangeStatus}
      />
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
  backRow: {
    paddingTop: Spacing.two,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.two,
    gap: Spacing.three,
  },
  headerText: {
    flex: 1,
    gap: Spacing.half,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
  },
  progressLabel: {
    marginTop: Spacing.two,
    marginBottom: Spacing.one,
  },
  list: {
    gap: Spacing.two,
    paddingBottom: Spacing.six,
  },
});
