import {
  learningPlanRequestSchema,
  learningPlanResponseSchema,
  type LearningPlanRequest,
  type LearningPlanResponse,
} from "@/shared/hobbyPlan.schema";

// Empty string = same-origin, which is correct once the Expo web export and
// the /api functions are deployed together as one Vercel project. Overridden
// for native/dev via EXPO_PUBLIC_API_BASE_URL (e.g. a `vercel dev` tunnel or
// the deployed backend URL) since a native app has no "same origin".
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

interface ErrorBody {
  error?: string;
}

export async function fetchLearningPlan(request: LearningPlanRequest): Promise<LearningPlanResponse> {
  const validatedRequest = learningPlanRequestSchema.parse(request);

  const response = await fetch(`${API_BASE_URL}/api/learning-plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validatedRequest),
  });

  if (!response.ok) {
    const body: ErrorBody = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed with status ${response.status}`);
  }

  const body = await response.json();
  const parsed = learningPlanResponseSchema.safeParse(body.plan);
  if (!parsed.success) {
    throw new Error("Received an unexpected response shape from the server.");
  }
  return parsed.data;
}
