import { Pressable, StyleSheet, View } from "react-native";
import { ExternalLink } from "@/components/external-link";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { Spacing } from "@/constants/theme";
import type { Technique, TechniqueStatus } from "@/shared/hobbyPlan.schema";
import { searchUrlFor } from "./search-url";

const RESOURCE_TYPE_LABEL: Record<Technique["resourceType"], string> = {
  video: "📺 Video",
  article: "📄 Article",
  interactive: "🧩 Interactive",
  drill: "🏋️ Practice drill",
  diagram: "📊 Diagram / worked examples",
};

const STATUS_OPTIONS: { value: TechniqueStatus; label: string }[] = [
  { value: "learning", label: "Learning" },
  { value: "mastered", label: "Mastered" },
  { value: "skipped", label: "Skip" },
];

interface TechniqueDetailContentProps {
  technique: Technique;
  onClose: () => void;
  onChangeStatus: (status: TechniqueStatus) => void;
}

export function TechniqueDetailContent({ technique, onClose, onChangeStatus }: TechniqueDetailContentProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <ThemedText type="smallBold" style={styles.title}>
          {technique.title}
        </ThemedText>
        <Pressable testID="close-technique-detail" onPress={onClose} hitSlop={12} style={[styles.closeButton, { backgroundColor: theme.backgroundSelected }]}>
          <ThemedText style={styles.closeIcon}>✕</ThemedText>
        </Pressable>
      </View>

      <ThemedText type="small" themeColor="textSecondary">
        {RESOURCE_TYPE_LABEL[technique.resourceType]} · ~{technique.estimatedHours}h
      </ThemedText>

      <ThemedText style={styles.rationale}>{technique.rationale}</ThemedText>

      <ExternalLink href={searchUrlFor(technique.resourceType, technique.searchQuery)} style={styles.searchLink}>
        <ThemedText type="linkPrimary">Find a lesson on this →</ThemedText>
      </ExternalLink>

      <View style={[styles.statusRow, { borderTopColor: theme.border }]}>
        {STATUS_OPTIONS.map((option) => {
          const selected = technique.status === option.value;
          return (
            <Pressable
              key={option.value}
              testID={`status-${option.value}`}
              onPress={() => onChangeStatus(option.value)}
              style={[
                styles.statusPill,
                { backgroundColor: theme.backgroundSelected, borderColor: theme.border },
                selected && { backgroundColor: theme.accent, borderColor: theme.accent },
              ]}
            >
              <ThemedText type="smallBold" style={selected && { color: theme.accentText }}>
                {option.label}
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
    fontSize: 20,
    lineHeight: 26,
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
  rationale: {
    lineHeight: 22,
    marginTop: Spacing.one,
  },
  searchLink: {
    alignSelf: "flex-start",
    marginTop: Spacing.one,
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
