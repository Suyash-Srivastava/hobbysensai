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
import { fetchLearningPlan, LearningPlanRequestError } from "@/lib/api/learningPlanClient";
import { generateId } from "@/lib/id";
import { useHobbyPlansStore } from "@/store/hobbyPlansStore";
import { EMPTY_STREAK, learningPlanRequestSchema, type HobbyLevel, type HobbyPlan } from "@/shared/hobbyPlan.schema";
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

    try {
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
        streak: EMPTY_STREAK,
      };

      await addPlan(plan);
      router.replace(`/plan/${plan.id}`);
    } catch (error) {
      // The AI itself decided "hobby" isn't a real, recognizable hobby (see
      // promptBuilder's recognized:false path) - point at the specific
      // field instead of just a generic bottom-of-form error, since this is
      // something the user needs to fix, not a transient failure to retry.
      if (error instanceof LearningPlanRequestError && error.code === "hobby_not_recognized") {
        setFieldErrors({ hobby: error.message });
      }
    }
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
            <ThemedText type="smallBold">Your Level</ThemedText>
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
            <ThemedText type="smallBold">Weekly Budget</ThemedText>
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

          {/* "Not a recognized hobby" points at the hobby field itself
              (fieldErrors.hobby, set in the catch above) instead of
              duplicating the same message down here too. */}
          {mutation.isError && !(mutation.error instanceof LearningPlanRequestError && mutation.error.code === "hobby_not_recognized") ? (
            <View
              accessibilityLiveRegion="assertive"
              style={[styles.statusBox, { backgroundColor: `${theme.error}1A`, borderColor: theme.error }]}
            >
              <ThemedText type="smallBold" style={{ color: theme.error }}>
                Couldn&apos;t generate your plan
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {(mutation.error as Error).message}
              </ThemedText>
            </View>
          ) : null}

          <View style={styles.spacer} />

          {/* Plan generation is a multi-second AI call - say what's happening
              rather than leaving only a spinner inside the button. */}
          {mutation.isPending ? (
            <ThemedText
              type="small"
              themeColor="textSecondary"
              accessibilityLiveRegion="polite"
              style={styles.pendingHint}
            >
              Designing your curriculum… this takes a few seconds.
            </ThemedText>
          ) : null}

          <Button
            label={mutation.isPending ? "Generating…" : "Generate My Plan"}
            icon={mutation.isPending ? undefined : "✨"}
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
  statusBox: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.half,
  },
  pendingHint: {
    textAlign: "center",
    marginBottom: Spacing.two,
  },
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
