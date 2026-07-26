import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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

  // Android sizes a filled/rounded Pressable's ripple background off the
  // row's layout at the moment it mounts, and this row can still be mid-
  // layout inside its horizontal ScrollView at that instant - so whichever
  // tab starts out selected (the default "All" tab) gets squashed until any
  // later re-render forces a fresh layout pass. Remounting once, one frame
  // after mount, gets that correction in before anyone taps anything.
  const [renderKey, setRenderKey] = useState(0);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setRenderKey((key) => key + 1));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Nothing to filter if every technique is the same single resource type.
  if (presentTypes.length < 2) return null;

  const tabs: { value: ResourceFilter; icon?: string; label: string }[] = [
    { value: "all", icon: "🗂️", label: "All" },
    ...presentTypes.map((type) => ({ value: type, icon: RESOURCE_TYPE_ICON[type], label: RESOURCE_TYPE_LABEL[type] })),
  ];

  return (
    <ScrollView
      key={renderKey}
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
            <View style={styles.tabInner}>
              {tab.icon ? <Text style={styles.icon}>{tab.icon}</Text> : null}
              <ThemedText type="small" style={[styles.label, selected && { color: theme.accentText }]}>
                {tab.label}
              </ThemedText>
            </View>
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
    height: 34,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  // Deliberately no custom fontFamily override here (unlike ThemedText) -
  // mixing an emoji glyph with a custom font in the same Text node makes
  // Android mis-measure the line height on first paint (it only corrects
  // itself on the next layout pass, e.g. when a tab gets selected), which
  // visually squished the pill's content. Rendering the icon in its own
  // plain Text with the system default font sidesteps that entirely.
  //
  // includeFontPadding/textAlignVertical fix a second, separate Android-only
  // quirk: Android's TextView reserves extra ascent/descent padding around
  // text by default (for accents/diacritics), and that reserved space is
  // sized inconsistently for emoji glyphs on first paint, pinning the icon
  // toward the top of its box until a later re-layout centers it correctly.
  icon: {
    fontSize: 14,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  label: {
    includeFontPadding: false,
    textAlignVertical: "center",
  },
});
