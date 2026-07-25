import AsyncStorage from "@react-native-async-storage/async-storage";
import { hobbyPlansStateSchema, type HobbyPlansState } from "../../shared/hobbyPlan.schema";

const STORAGE_KEY = "hobbysensai:hobby-plans";
const CURRENT_VERSION = 1 as const;

const EMPTY_STATE: HobbyPlansState = {
  version: CURRENT_VERSION,
  plans: [],
  streak: { count: 0, lastActiveDate: null },
};

export interface HobbyPlansRepository {
  load(): Promise<HobbyPlansState>;
  save(state: Pick<HobbyPlansState, "plans" | "streak">): Promise<void>;
  clear(): Promise<void>;
}

// Exported for testing: a corrupted blob, a pre-v1 shape, or a stray
// non-object value must all degrade to empty state rather than throw and
// crash app startup.
export function parseStoredState(raw: string | null): HobbyPlansState {
  if (!raw) return EMPTY_STATE;

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch {
    return EMPTY_STATE;
  }

  const result = hobbyPlansStateSchema.safeParse(parsedJson);
  return result.success ? result.data : EMPTY_STATE;
}

export const hobbyPlansRepository: HobbyPlansRepository = {
  async load() {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return parseStoredState(raw);
  },

  async save(state) {
    const fullState: HobbyPlansState = { version: CURRENT_VERSION, ...state };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(fullState));
  },

  async clear() {
    await AsyncStorage.removeItem(STORAGE_KEY);
  },
};
