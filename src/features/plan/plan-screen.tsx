import { useState } from "react";
import { FlatList, Platform, Pressable, StyleSheet, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ProgressBar } from "@/components/progress-bar";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { useHobbyPlansStore } from "@/store/hobbyPlansStore";
import { hobbyProgress, type Technique, type TechniqueStatus } from "@/shared/hobbyPlan.schema";
import { HOBBY_CATEGORY_EMOJI, hobbyCategoryColor } from "@/features/home/hobby-category-icon";
import { TechniqueDetailSheet } from "@/features/technique-detail/technique-detail-sheet";
import { TechniqueRow } from "./technique-row";
import { MasteryCelebration } from "./mastery-celebration";

export function PlanScreen() {
  const { hobbyId } = useLocalSearchParams<{ hobbyId: string }>();
  const plan = useHobbyPlansStore((state) => state.plans.find((p) => p.id === hobbyId));
  const setTechniqueStatus = useHobbyPlansStore((state) => state.setTechniqueStatus);
  const scheme = useColorScheme() === "dark" ? "dark" : "light";

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

  const categoryColor = hobbyCategoryColor(plan.hobbyCategory, scheme);
  // Dark-mode category colors are light pastels (need dark text on top);
  // light-mode ones are saturated/dark (need light text) - inverted from
  // the app's own current-mode text color.
  const categoryTextColor = scheme === "dark" ? "#0F172A" : "#FFFFFF";
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
      <View
        pointerEvents="none"
        style={[
          styles.headerWash,
          { experimental_backgroundImage: `linear-gradient(180deg, ${categoryColor}3d 0%, transparent 100%)` },
        ]}
      />
      <MasteryCelebration triggerKey={celebrationKey} color={categoryColor} textColor={categoryTextColor} />
      <SafeAreaView style={styles.safeArea}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backRow}>
          <ThemedText type="link">← Home</ThemedText>
        </Pressable>

        <View style={styles.header}>
          <ThemedText type="eyebrow" style={{ color: categoryColor }}>
            {HOBBY_CATEGORY_EMOJI[plan.hobbyCategory]} {plan.hobby} · {plan.currentLevel}
          </ThemedText>
          <ThemedText type="title" style={styles.title} numberOfLines={2}>
            {plan.goal}
          </ThemedText>
        </View>

        <View style={styles.progressBlock}>
          <View style={styles.progressLabelRow}>
            <ThemedText type="eyebrow">Overall Progress</ThemedText>
            <ThemedText type="smallBold">{percent}%</ThemedText>
          </View>
          <ProgressBar percent={percent} color={categoryColor} height={8} />
          <ThemedText type="small" themeColor="textSecondary" style={styles.progressCaption}>
            {mastered} of {total} techniques mastered
          </ThemedText>
        </View>

        <ThemedText type="eyebrow" style={styles.curriculumLabel}>
          Mastery Curriculum
        </ThemedText>

        <FlatList<Technique>
          data={sortedTechniques}
          keyExtractor={(technique) => technique.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TechniqueRow technique={item} categoryColor={categoryColor} onPress={() => setSelectedTechniqueId(item.id)} />
          )}
        />
      </SafeAreaView>

      <TechniqueDetailSheet
        technique={selectedTechnique}
        categoryColor={categoryColor}
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
  headerWash: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 280,
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
    paddingTop: Spacing.three,
    gap: Spacing.one,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
  },
  progressBlock: {
    marginTop: Spacing.four,
    gap: Spacing.one,
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressCaption: {
    marginTop: Spacing.half,
  },
  curriculumLabel: {
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
  },
  list: {
    gap: Spacing.two,
    paddingBottom: Spacing.six,
  },
});
