import { create } from "zustand";
import { hobbyPlansRepository } from "../lib/storage/hobbyPlansRepository";
import { advanceStreak, type HobbyPlan, type TechniqueStatus } from "../shared/hobbyPlan.schema";

interface HobbyPlansStore {
  plans: HobbyPlan[];
  hydrated: boolean;
  /** Not persisted - which hobby to highlight as "continue" on Home, reset each app launch. */
  lastActiveHobbyId: string | null;
  hydrate: () => Promise<void>;
  addPlan: (plan: HobbyPlan) => Promise<void>;
  removePlan: (planId: string) => Promise<void>;
  setTechniqueStatus: (planId: string, techniqueId: string, status: TechniqueStatus) => Promise<void>;
}

// Plain repository calls rather than zustand's `persist` middleware: this
// keeps validation/fallback behavior (see hobbyPlansRepository) in one
// storage-agnostic place, so swapping AsyncStorage for SQLite later only
// touches that one file, not the store.
export const useHobbyPlansStore = create<HobbyPlansStore>((set, get) => ({
  plans: [],
  hydrated: false,
  lastActiveHobbyId: null,

  hydrate: async () => {
    const state = await hobbyPlansRepository.load();
    set({ plans: state.plans, hydrated: true });
  },

  addPlan: async (plan) => {
    const plans = [...get().plans, plan];
    set({ plans, lastActiveHobbyId: plan.id });
    await hobbyPlansRepository.save({ plans });
  },

  removePlan: async (planId) => {
    const plans = get().plans.filter((plan) => plan.id !== planId);
    const lastActiveHobbyId = get().lastActiveHobbyId === planId ? null : get().lastActiveHobbyId;
    set({ plans, lastActiveHobbyId });
    await hobbyPlansRepository.save({ plans });
  },

  setTechniqueStatus: async (planId, techniqueId, status) => {
    const plans = get().plans.map((plan) => {
      if (plan.id !== planId) return plan;
      const techniques = plan.techniques.map((technique) =>
        technique.id === techniqueId ? { ...technique, status } : technique,
      );
      // Only "learning" and "mastered" reflect real engagement with the
      // material - reverting to "not-started" or skipping a technique
      // shouldn't extend this hobby's streak.
      const streak = status === "learning" || status === "mastered" ? advanceStreak(plan.streak) : plan.streak;
      return { ...plan, techniques, streak };
    });
    set({ plans, lastActiveHobbyId: planId });
    await hobbyPlansRepository.save({ plans });
  },
}));
