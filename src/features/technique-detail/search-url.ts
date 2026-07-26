import type { ExternalPathString } from "expo-router";
import type { ResourceType } from "@/shared/hobbyPlan.schema";

// Each resourceType routes to the search vertical that actually matches it -
// a "diagram" technique landing on plain web search results is no more
// useful than an "article" one, so it goes to Google Images instead. Query
// hints on the remaining Google-web types keep "article" and "interactive"
// from returning the same generic results as each other.
export function searchUrlFor(resourceType: ResourceType, searchQuery: string): ExternalPathString {
  switch (resourceType) {
    case "video":
    case "drill":
      return `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
    case "diagram":
      return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(searchQuery)}`;
    case "interactive":
      return `https://www.google.com/search?q=${encodeURIComponent(`${searchQuery} interactive tool`)}`;
    case "article":
      return `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
  }
}
