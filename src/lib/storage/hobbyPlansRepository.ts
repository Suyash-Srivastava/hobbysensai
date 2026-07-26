import AsyncStorage from "@react-native-async-storage/async-storage";
import { hobbyPlansStateSchema, type HobbyPlansState } from "../../shared/hobbyPlan.schema";

const STORAGE_KEY = "hobbysensai:hobby-plans";
// v2: streak moved from top-level (one app-wide streak) to per-plan (each
// hobby tracks its own). A v1 blob fails validation against the v2 schema
// and falls back to EMPTY_STATE below, same as any other corrupted/outdated
// shape - by design, not a bug (see parseStoredState).
const CURRENT_VERSION = 2 as const;

const EMPTY_STATE: HobbyPlansState = {
  version: CURRENT_VERSION,
  plans: [],
};

export interface HobbyPlansRepository {
  load(): Promise<HobbyPlansState>;
  save(state: Pick<HobbyPlansState, "plans">): Promise<void>;
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
