import { useState } from "react";
import { FlatList, Platform, Pressable, StyleSheet, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ProgressBar } from "@/components/progress-bar";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { useHobbyPlansStore } from "@/store/hobbyPlansStore";
import { hobbyProgress, type Technique, type TechniqueStatus } from "@/shared/hobbyPlan.schema";
import { hobbyCategoryColor } from "@/features/home/hobby-category-icon";
import { TechniqueDetailSheet } from "@/features/technique-detail/technique-detail-sheet";
import { TechniqueRow } from "./technique-row";
import { MasteryCelebration } from "./mastery-celebration";
import { ResourceFilterTabs, type ResourceFilter } from "./resource-filter-tabs";

export function PlanScreen() {
  const { hobbyId } = useLocalSearchParams<{ hobbyId: string }>();
  const plan = useHobbyPlansStore((state) => state.plans.find((p) => p.id === hobbyId));
  const setTechniqueStatus = useHobbyPlansStore((state) => state.setTechniqueStatus);
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  // useSafeAreaInsets (a hook) rather than <SafeAreaView> (a component) -
  // more reliable when nested inside react-native-screens' native stack,
  // which is what expo-router uses under the hood for this screen.
  const insets = useSafeAreaInsets();

  const [selectedTechniqueId, setSelectedTechniqueId] = useState<string | null>(null);
  const [celebrationKey, setCelebrationKey] = useState(0);
  const [resourceFilter, setResourceFilter] = useState<ResourceFilter>("all");

  if (!plan) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.safeArea, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <ThemedText type="subtitle">Hobby not found</ThemedText>
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back">
            <ThemedText type="link">Go back</ThemedText>
          </Pressable>
        </View>
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
  const visibleTechniques =
    resourceFilter === "all" ? sortedTechniques : sortedTechniques.filter((t) => t.resourceType === resourceFilter);

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
      <MasteryCelebration
        triggerKey={celebrationKey}
        color={categoryColor}
        textColor={categoryTextColor}
        topInset={insets.top}
      />
      <View style={[styles.safeArea, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back to home"
          style={styles.backRow}
        >
          <ThemedText type="link">← Home</ThemedText>
        </Pressable>

        <View style={styles.header}>
          <ThemedText type="eyebrow" style={{ color: categoryColor }}>
            {plan.hobby} · {plan.currentLevel}
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

        <ResourceFilterTabs
          techniques={plan.techniques}
          activeFilter={resourceFilter}
          onChangeFilter={setResourceFilter}
          categoryColor={categoryColor}
        />

        <FlatList<Technique>
          data={visibleTechniques}
          keyExtractor={(technique) => technique.id}
          style={styles.flatList}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TechniqueRow technique={item} onPress={() => setSelectedTechniqueId(item.id)} />
          )}
        />
      </View>

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
  // Without this, the FlatList doesn't bound itself to the remaining
  // vertical space in the column - when the technique list is long enough
  // to overflow, the whole column's layout goes unbounded and Android
  // mis-renders the ResourceFilterTabs ScrollView sitting above it.
  flatList: {
    flex: 1,
  },
  list: {
    gap: Spacing.two,
    paddingBottom: Spacing.six,
  },
});
