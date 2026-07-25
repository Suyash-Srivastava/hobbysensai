import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { fetchLearningPlan } from "@/lib/api/learningPlanClient";
import { generateId } from "@/lib/id";
import { useHobbyPlansStore } from "@/store/hobbyPlansStore";
import { learningPlanRequestSchema, type HobbyLevel, type HobbyPlan } from "@/shared/hobbyPlan.schema";
import { LevelSelector } from "./level-selector";
import { FormField } from "./form-field";

export function AddHobbyScreen() {
  const addPlan = useHobbyPlansStore((state) => state.addPlan);

  const [hobby, setHobby] = useState("");
  const [currentLevel, setCurrentLevel] = useState<HobbyLevel>("beginner");
  const [goal, setGoal] = useState("");
  const [weeklyTimeBudgetHours, setWeeklyTimeBudgetHours] = useState("3");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({ mutationFn: fetchLearningPlan });

  const handleSubmit = async () => {
    const parsed = learningPlanRequestSchema.safeParse({
      hobby,
      currentLevel,
      goal,
      weeklyTimeBudgetHours: Number(weeklyTimeBudgetHours),
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
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <FormField
          label="What hobby do you want to learn?"
          placeholder="e.g. chess, acoustic guitar, watercolor painting"
          value={hobby}
          onChangeText={setHobby}
          error={fieldErrors.hobby}
          editable={!mutation.isPending}
        />

        <View style={styles.field}>
          <ThemedText type="smallBold">Current level</ThemedText>
          <LevelSelector value={currentLevel} onChange={setCurrentLevel} />
        </View>

        <FormField
          label="What's your goal?"
          placeholder="e.g. beat my friends casually, play campfire songs"
          value={goal}
          onChangeText={setGoal}
          error={fieldErrors.goal}
          editable={!mutation.isPending}
          multiline
        />

        <FormField
          label="Weekly time budget (hours)"
          placeholder="3"
          value={weeklyTimeBudgetHours}
          onChangeText={setWeeklyTimeBudgetHours}
          error={fieldErrors.weeklyTimeBudgetHours}
          editable={!mutation.isPending}
          keyboardType="numeric"
        />

        {mutation.isError ? (
          <ThemedText type="small" style={styles.mutationError}>
            {(mutation.error as Error).message}
          </ThemedText>
        ) : null}

        <Pressable
          testID="generate-plan-button"
          onPress={handleSubmit}
          disabled={mutation.isPending}
          style={({ pressed }) => [styles.submitButton, (pressed || mutation.isPending) && styles.submitButtonPressed]}
        >
          {mutation.isPending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <ThemedText type="smallBold" style={styles.submitLabel}>
              Build my learning plan
            </ThemedText>
          )}
        </Pressable>

        {mutation.isPending ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
            Designing a focused technique list for you - this usually takes a few seconds.
          </ThemedText>
        ) : null}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center" },
  scroll: {
    width: "100%",
    maxWidth: MaxContentWidth,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  field: { gap: Spacing.one },
  mutationError: { color: "#d03b3b" },
  submitButton: {
    backgroundColor: "#0ca30c",
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: "center",
    marginTop: Spacing.two,
  },
  submitButtonPressed: { opacity: 0.85 },
  submitLabel: { color: "#ffffff" },
  hint: { textAlign: "center" },
});
