import { Pressable, StyleSheet, View } from "react-native";
import { ExternalLink } from "@/components/external-link";
import { ThemedText } from "@/components/themed-text";
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
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <ThemedText type="subtitle" style={styles.title}>
          {technique.title}
        </ThemedText>
        <Pressable testID="close-technique-detail" onPress={onClose} hitSlop={12}>
          <ThemedText type="subtitle">✕</ThemedText>
        </Pressable>
      </View>

      <ThemedText type="smallBold" themeColor="textSecondary">
        {RESOURCE_TYPE_LABEL[technique.resourceType]} · ~{technique.estimatedHours}h
      </ThemedText>

      <ThemedText style={styles.rationale}>{technique.rationale}</ThemedText>

      <ExternalLink href={searchUrlFor(technique.resourceType, technique.searchQuery)} style={styles.searchLink}>
        <ThemedText type="linkPrimary">Find a lesson on this →</ThemedText>
      </ExternalLink>

      <View style={styles.statusRow}>
        {STATUS_OPTIONS.map((option) => {
          const selected = technique.status === option.value;
          return (
            <Pressable
              key={option.value}
              testID={`status-${option.value}`}
              onPress={() => onChangeStatus(option.value)}
              style={[styles.statusPill, selected && styles.statusPillSelected]}
            >
              <ThemedText type="small" style={selected && styles.statusLabelSelected}>
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
    gap: Spacing.three,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  title: {
    flex: 1,
  },
  rationale: {
    lineHeight: 22,
  },
  searchLink: {
    alignSelf: "flex-start",
  },
  statusRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  statusPill: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    alignItems: "center",
    backgroundColor: "#00000010",
  },
  statusPillSelected: {
    backgroundColor: "#0ca30c",
  },
  statusLabelSelected: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
