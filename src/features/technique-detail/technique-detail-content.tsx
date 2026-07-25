import { Pressable, StyleSheet, View } from "react-native";
import { ExternalLink } from "@/components/external-link";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { Spacing } from "@/constants/theme";
import type { HobbyCategory, Technique, TechniqueStatus } from "@/shared/hobbyPlan.schema";
import { hobbyCategoryColorOnPaper } from "@/features/home/hobby-category-icon";
import { searchUrlFor } from "./search-url";

const RESOURCE_TYPE_LABEL: Record<Technique["resourceType"], string> = {
  video: "📺 Video resource",
  article: "📄 Article resource",
  interactive: "🧩 Interactive resource",
  drill: "🏋️ Practice drill",
  diagram: "📊 Diagram / worked examples",
};

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
  category: HobbyCategory;
  onClose: () => void;
  onChangeStatus: (status: TechniqueStatus) => void;
}

export function TechniqueDetailContent({ technique, category, onClose, onChangeStatus }: TechniqueDetailContentProps) {
  const theme = useTheme();
  // The card underneath this content is always a light/cream "paper"
  // surface (even in dark mode - see Colors.dark.paperSurface), so it
  // always needs the light-mode category color, regardless of app theme.
  const categoryColor = hobbyCategoryColorOnPaper(category);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <ThemedText type="subtitle" style={[styles.title, { color: theme.paperText }]}>
          {technique.title}
        </ThemedText>
        <Pressable
          testID="close-technique-detail"
          onPress={onClose}
          hitSlop={12}
          android_ripple={{ color: theme.borderStrong, borderless: true, radius: 20 }}
          style={[styles.closeButton, { backgroundColor: theme.backgroundSelected }]}
        >
          <ThemedText style={[styles.closeIcon, { color: theme.paperText }]}>✕</ThemedText>
        </Pressable>
      </View>

      <ThemedText type="eyebrow" style={{ color: categoryColor }}>
        {RESOURCE_TYPE_LABEL[technique.resourceType]} · ~{technique.estimatedHours}h
      </ThemedText>

      <View style={styles.rationaleBlock}>
        <View style={[styles.rationaleBar, { backgroundColor: categoryColor }]} />
        <View style={styles.rationaleTextBlock}>
          <ThemedText type="eyebrow" style={{ color: theme.paperText, opacity: 0.6 }}>
            Rationale
          </ThemedText>
          <ThemedText style={[styles.rationale, { color: theme.paperText }]}>{technique.rationale}</ThemedText>
        </View>
      </View>

      <ExternalLink href={searchUrlFor(technique.resourceType, technique.searchQuery)} style={styles.searchLinkWrapper}>
        <View style={[styles.searchLink, { backgroundColor: theme.backgroundSelected }]}>
          <ThemedText type="smallBold" style={{ color: theme.paperText }}>
            📖 Find a lesson on this
          </ThemedText>
          <ThemedText style={{ color: theme.paperText }}>→</ThemedText>
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
              <ThemedText type="eyebrow" style={{ color: selected ? "#FFFFFF" : theme.paperText }}>
                {option.icon} {option.label}
              </ThemedText>
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
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    borderWidth: 1,
    alignItems: "center",
  },
});
