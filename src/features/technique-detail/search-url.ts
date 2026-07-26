import type { ExternalPathString } from "expo-router";
import type { ResourceType } from "@/shared/hobbyPlan.schema";

// Each resourceType routes to the search vertical that actually matches it -
// a "diagram" technique landing on plain web search results is no more
// useful than an "article" one, so it goes to Google Images instead.
//
// The searchQuery itself is now tailored per resourceType at the source (see
// promptBuilder's system instruction) - the AI phrases a "video" query like a
// YouTube search and an "article" query like a web search, since it has the
// full technique context to do that precisely. This layer only adds what the
// query text can't: routing to the right platform, and a stable Google
// search operator (-site:youtube.com) that keeps Google's blended "universal
// search" from surfacing video results in what's supposed to be a text/image
// search. That's deliberately NOT done via YouTube's own "sp" filter
// parameter - it's an opaque encoded blob with no stable public spec, and
// has broken before when YouTube changed its internal format.
export function searchUrlFor(resourceType: ResourceType, searchQuery: string): ExternalPathString {
  switch (resourceType) {
    case "video":
    case "drill":
      return `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
    case "diagram":
      return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(searchQuery)}`;
    case "interactive":
    case "article":
      return `https://www.google.com/search?q=${encodeURIComponent(`${searchQuery} -site:youtube.com`)}`;
  }
}
