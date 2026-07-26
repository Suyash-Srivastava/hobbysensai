import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/button";
import { useTheme } from "@/hooks/use-theme";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { fetchLearningPlan } from "@/lib/api/learningPlanClient";
import { generateId } from "@/lib/id";
import { useHobbyPlansStore } from "@/store/hobbyPlansStore";
import { learningPlanRequestSchema, type HobbyLevel, type HobbyPlan } from "@/shared/hobbyPlan.schema";
import { LevelSelector } from "./level-selector";
import { FormField } from "./form-field";

export function AddHobbyScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const addPlan = useHobbyPlansStore((state) => state.addPlan);

  const [hobby, setHobby] = useState("");
  const [currentLevel, setCurrentLevel] = useState<HobbyLevel>("beginner");
  const [goal, setGoal] = useState("");
  const [weeklyTimeBudgetHours, setWeeklyTimeBudgetHours] = useState(5);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({ mutationFn: fetchLearningPlan });

  const handleSubmit = async () => {
    const parsed = learningPlanRequestSchema.safeParse({
      hobby,
      currentLevel,
      goal,
      weeklyTimeBudgetHours,
    });

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    const response = await mutation.mutateAsync(parsed.data);

    const plan: HobbyPlan = {
      id: generateId(),
      ...parsed.data,
      hobbyCategory: response.hobbyCategory,
      createdAt: new Date().toISOString(),
      techniques: response.techniques.map((technique) => ({
        ...technique,
        id: generateId(),
        status: "not-started" as const,
      })),
    };

    await addPlan(plan);
    router.replace(`/plan/${plan.id}`);
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 96 : 0}
      >
        {/* Top inset is already handled by the native header (headerShown: true in _layout.tsx). */}
        <View style={[styles.formContent, { paddingBottom: Math.max(insets.bottom, Spacing.four) }]}>
          <FormField
            label="What are you learning?"
            placeholder="e.g. chess, acoustic guitar, watercolor painting"
            value={hobby}
            onChangeText={setHobby}
            error={fieldErrors.hobby}
            required
            editable={!mutation.isPending}
          />

          <View style={styles.field}>
            <ThemedText type="smallBold" style={{ color: theme.eyebrow }}>
              Your Level
            </ThemedText>
            <LevelSelector value={currentLevel} onChange={setCurrentLevel} />
          </View>

          <FormField
            label="Main Goal"
            placeholder="e.g. play my first jazz solo"
            value={goal}
            onChangeText={setGoal}
            error={fieldErrors.goal}
            required
            editable={!mutation.isPending}
            multiline
          />

          <View style={styles.field}>
            <ThemedText type="smallBold" style={{ color: theme.eyebrow }}>
              Weekly Budget
            </ThemedText>
            <View style={styles.sliderRow}>
              <ThemedText type="title" style={styles.sliderValue}>
                {weeklyTimeBudgetHours}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                hours / week
              </ThemedText>
            </View>
            <Slider
              testID="weekly-budget-slider"
              style={styles.slider}
              minimumValue={1}
              maximumValue={20}
              step={1}
              value={weeklyTimeBudgetHours}
              onValueChange={setWeeklyTimeBudgetHours}
              disabled={mutation.isPending}
              minimumTrackTintColor={theme.accent}
              maximumTrackTintColor={theme.border}
              thumbTintColor={theme.accent}
            />
          </View>

          {mutation.isError ? (
            <ThemedText type="small" style={{ color: theme.error }}>
              {(mutation.error as Error).message}
            </ThemedText>
          ) : null}

          <View style={styles.spacer} />

          <Button
            label="Generate My Plan"
            icon="✨"
            onPress={handleSubmit}
            disabled={mutation.isPending}
            loading={mutation.isPending}
            testID="generate-plan-button"
          />
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center" },
  flex: { flex: 1, width: "100%", alignItems: "center" },
  formContent: {
    flex: 1,
    width: "100%",
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },
  field: { gap: Spacing.one },
  sliderRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.one,
  },
  sliderValue: {
    fontSize: 28,
  },
  slider: {
    width: "100%",
  },
  spacer: {
    flex: 1,
    minHeight: Spacing.two,
  },
});
