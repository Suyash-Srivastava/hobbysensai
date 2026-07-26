import { Pressable, StyleSheet, Text, View } from "react-native";
import { ExternalLink } from "@/components/external-link";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { Spacing } from "@/constants/theme";
import type { Technique, TechniqueStatus } from "@/shared/hobbyPlan.schema";
import { RESOURCE_TYPE_ACTION_LABEL, RESOURCE_TYPE_ICON, RESOURCE_TYPE_LABEL } from "@/features/plan/resource-type";
import { searchUrlFor } from "./search-url";

const STATUS_OPTIONS: { value: TechniqueStatus; label: string; icon: string }[] = [
  { value: "learning", label: "Learning", icon: "🔥" },
  { value: "mastered", label: "Mastered", icon: "✓" },
  { value: "skipped", label: "Skip", icon: "⊘" },
];

// "Learning" and "skipped" stay neutral status tones; "mastered" adopts the
// hobby's own identity color, since that's the state worth celebrating.
const LEARNING_COLOR = "#f5a524";
const SKIPPED_COLOR = "#71717a";

interface TechniqueDetailContentProps {
  technique: Technique;
  categoryColor: string;
  onClose: () => void;
  onChangeStatus: (status: TechniqueStatus) => void;
}

export function TechniqueDetailContent({ technique, categoryColor, onClose, onChangeStatus }: TechniqueDetailContentProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <ThemedText type="subtitle" style={styles.title}>
          {technique.title}
        </ThemedText>
        <Pressable
          testID="close-technique-detail"
          onPress={onClose}
          hitSlop={12}
          android_ripple={{ color: theme.borderStrong, borderless: true, radius: 20 }}
          style={[styles.closeButton, { backgroundColor: theme.backgroundSelected }]}
        >
          <ThemedText style={styles.closeIcon}>✕</ThemedText>
        </Pressable>
      </View>

      <ThemedText type="eyebrow" style={{ color: categoryColor }}>
        {RESOURCE_TYPE_ICON[technique.resourceType]} {RESOURCE_TYPE_LABEL[technique.resourceType]} resource · ~{technique.estimatedHours}h
      </ThemedText>

      <View style={styles.rationaleBlock}>
        <View style={[styles.rationaleBar, { backgroundColor: categoryColor }]} />
        <View style={styles.rationaleTextBlock}>
          <ThemedText type="eyebrow" themeColor="textSecondary">
            Rationale
          </ThemedText>
          <ThemedText style={styles.rationale}>{technique.rationale}</ThemedText>
        </View>
      </View>

      <ExternalLink href={searchUrlFor(technique.resourceType, technique.searchQuery)} style={styles.searchLinkWrapper}>
        <View style={[styles.searchLink, { backgroundColor: theme.backgroundSelected }]}>
          <ThemedText type="smallBold">{RESOURCE_TYPE_ICON[technique.resourceType]} {RESOURCE_TYPE_ACTION_LABEL[technique.resourceType]}</ThemedText>
          <ThemedText>→</ThemedText>
        </View>
      </ExternalLink>

      <View style={[styles.statusRow, { borderTopColor: theme.border }]}>
        {STATUS_OPTIONS.map((option) => {
          const selected = technique.status === option.value;
          const selectedColor = option.value === "mastered" ? categoryColor : option.value === "learning" ? LEARNING_COLOR : SKIPPED_COLOR;
          return (
            <Pressable
              key={option.value}
              testID={`status-${option.value}`}
              onPress={() => onChangeStatus(option.value)}
              android_ripple={{ color: theme.borderStrong }}
              style={[
                styles.statusPill,
                { backgroundColor: theme.backgroundSelected, borderColor: theme.border },
                selected && { backgroundColor: selectedColor, borderColor: selectedColor },
              ]}
            >
              <View style={styles.statusPillInner}>
                <Text style={styles.statusIcon}>{option.icon}</Text>
                <ThemedText type="eyebrow" style={[styles.statusLabel, selected && { color: theme.accentText }]}>
                  {option.label}
                </ThemedText>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: Spacing.three,
  },
  title: {
    flex: 1,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  closeIcon: {
    fontSize: 14,
    fontWeight: "700",
  },
  rationaleBlock: {
    flexDirection: "row",
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  rationaleBar: {
    width: 3,
    borderRadius: 2,
  },
  rationaleTextBlock: {
    flex: 1,
    gap: Spacing.half,
  },
  rationale: {
    lineHeight: 22,
  },
  searchLinkWrapper: {
    marginTop: Spacing.one,
  },
  searchLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: Spacing.three,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  statusRow: {
    flexDirection: "row",
    gap: Spacing.two,
    marginTop: Spacing.two,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
  },
  statusPill: {
    flex: 1,
    height: 44,
    borderRadius: Spacing.three,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statusPillInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  // Deliberately no custom fontFamily override here - mixing an emoji glyph
  // with a custom font in the same Text node makes Android mis-measure the
  // line height on first paint (see the matching comment in
  // resource-filter-tabs.tsx), which squished this pill's content until the
  // next layout pass. A plain Text with the system default font sidesteps it.
  //
  // includeFontPadding/textAlignVertical fix a second Android-only quirk:
  // the extra ascent/descent padding Android reserves around text by
  // default is sized inconsistently for emoji glyphs on first paint,
  // pinning the icon toward the top of its box until a later re-layout.
  statusIcon: {
    fontSize: 12,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  statusLabel: {
    includeFontPadding: false,
    textAlignVertical: "center",
  },
});
