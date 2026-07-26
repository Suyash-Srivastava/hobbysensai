import { Pressable, ScrollView, StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { Spacing } from "@/constants/theme";
import type { ResourceType, Technique } from "@/shared/hobbyPlan.schema";
import { RESOURCE_TYPE_ICON, RESOURCE_TYPE_LABEL, RESOURCE_TYPE_ORDER } from "./resource-type";

export type ResourceFilter = "all" | ResourceType;

interface ResourceFilterTabsProps {
  techniques: Technique[];
  activeFilter: ResourceFilter;
  onChangeFilter: (filter: ResourceFilter) => void;
  categoryColor: string;
}

/**
 * Only shows a tab for a resource type if this specific plan actually has a
 * technique of that type - a hobby with no "diagram" techniques doesn't get
 * an empty Diagram tab. Lets someone batch similar work (e.g. "just the
 * videos for tonight") without changing what format each technique itself
 * was assigned.
 */
export function ResourceFilterTabs({ techniques, activeFilter, onChangeFilter, categoryColor }: ResourceFilterTabsProps) {
  const theme = useTheme();
  const presentTypes = RESOURCE_TYPE_ORDER.filter((type) => techniques.some((t) => t.resourceType === type));

  // Nothing to filter if every technique is the same single resource type.
  if (presentTypes.length < 2) return null;

  const tabs: { value: ResourceFilter; label: string }[] = [
    { value: "all", label: "All" },
    ...presentTypes.map((type) => ({ value: type, label: `${RESOURCE_TYPE_ICON[type]} ${RESOURCE_TYPE_LABEL[type]}` })),
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      {tabs.map((tab) => {
        const selected = activeFilter === tab.value;
        return (
          <Pressable
            key={tab.value}
            testID={`resource-filter-${tab.value}`}
            onPress={() => onChangeFilter(tab.value)}
            android_ripple={{ color: theme.borderStrong }}
            style={[
              styles.tab,
              { backgroundColor: theme.backgroundSelected, borderColor: theme.border },
              selected && { backgroundColor: categoryColor, borderColor: categoryColor },
            ]}
          >
            <ThemedText type="small" style={selected && { color: theme.accentText }}>
              {tab.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
    marginBottom: Spacing.two,
  },
  row: {
    gap: Spacing.two,
    alignItems: "center",
  },
  tab: {
    // Fixed height (not just vertical padding) so a tab's pill shape can't
    // be inflated by content - Android substitutes a system emoji font for
    // glyphs like the TV/weight-lifter icons that Inter doesn't cover, and
    // that fallback font can render taller than the text's own lineHeight,
    // which would otherwise make only the emoji tabs look taller than "All".
    height: 34,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});
