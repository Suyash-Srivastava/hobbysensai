import { create } from "zustand";
import { hobbyPlansRepository } from "../lib/storage/hobbyPlansRepository";
import { advanceStreak, type HobbyPlan, type Streak, type TechniqueStatus } from "../shared/hobbyPlan.schema";

interface HobbyPlansStore {
  plans: HobbyPlan[];
  streak: Streak;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addPlan: (plan: HobbyPlan) => Promise<void>;
  removePlan: (planId: string) => Promise<void>;
  setTechniqueStatus: (planId: string, techniqueId: string, status: TechniqueStatus) => Promise<void>;
}

const EMPTY_STREAK: Streak = { count: 0, lastActiveDate: null };

// Plain repository calls rather than zustand's `persist` middleware: this
// keeps validation/fallback behavior (see hobbyPlansRepository) in one
// storage-agnostic place, so swapping AsyncStorage for SQLite later only
// touches that one file, not the store.
export const useHobbyPlansStore = create<HobbyPlansStore>((set, get) => ({
  plans: [],
  streak: EMPTY_STREAK,
  hydrated: false,

  hydrate: async () => {
    const state = await hobbyPlansRepository.load();
    set({ plans: state.plans, streak: state.streak, hydrated: true });
  },

  addPlan: async (plan) => {
    const plans = [...get().plans, plan];
    set({ plans });
    await hobbyPlansRepository.save({ plans, streak: get().streak });
  },

  removePlan: async (planId) => {
    const plans = get().plans.filter((plan) => plan.id !== planId);
    set({ plans });
    await hobbyPlansRepository.save({ plans, streak: get().streak });
  },

  setTechniqueStatus: async (planId, techniqueId, status) => {
    const plans = get().plans.map((plan) =>
      plan.id !== planId
        ? plan
        : {
            ...plan,
            techniques: plan.techniques.map((technique) =>
              technique.id === techniqueId ? { ...technique, status } : technique,
            ),
          },
    );
    // Only "learning" and "mastered" reflect real engagement with the
    // material - reverting to "not-started" or skipping a technique
    // shouldn't extend a streak.
    const streak = status === "learning" || status === "mastered" ? advanceStreak(get().streak) : get().streak;
    set({ plans, streak });
    await hobbyPlansRepository.save({ plans, streak });
  },
}));
