import type { ExternalPathString } from "expo-router";
import type { ResourceType } from "@/shared/hobbyPlan.schema";

const VIDEO_RESOURCE_TYPES: ResourceType[] = ["video", "drill"];

export function searchUrlFor(resourceType: ResourceType, searchQuery: string): ExternalPathString {
  const query = encodeURIComponent(searchQuery);
  return VIDEO_RESOURCE_TYPES.includes(resourceType)
    ? `https://www.youtube.com/results?search_query=${query}`
    : `https://www.google.com/search?q=${query}`;
}
