import { Modal, Pressable, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/themed-view";
import { MaxContentWidth, Shadow, Spacing } from "@/constants/theme";
import type { Technique, TechniqueStatus } from "@/shared/hobbyPlan.schema";
import { TechniqueDetailContent } from "./technique-detail-content";

interface TechniqueDetailSheetProps {
  technique: Technique | null;
  categoryColor: string;
  onClose: () => void;
  onChangeStatus: (status: TechniqueStatus) => void;
}

/**
 * Desktop/web presentation: a centered modal dialog. Mobile gets the bottom
 * sheet in technique-detail-sheet.tsx - same content, platform-appropriate
 * container, resolved automatically by Metro's .web.tsx convention. Uses the
 * app's own theme surface (not a special "paper" treatment) so it reads as
 * the same app, not a different one popping up on top.
 */
export function TechniqueDetailSheet({ technique, categoryColor, onClose, onChangeStatus }: TechniqueDetailSheetProps) {
  return (
    <Modal visible={technique !== null} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.centerWrapper} pointerEvents="box-none">
        <ThemedView type="backgroundElement" style={styles.dialog}>
          {technique ? (
            <TechniqueDetailContent
              technique={technique}
              categoryColor={categoryColor}
              onClose={onClose}
              onChangeStatus={onChangeStatus}
            />
          ) : null}
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  centerWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.four,
  },
  dialog: {
    width: "100%",
    maxWidth: Math.min(MaxContentWidth, 480),
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
    boxShadow: Shadow.floating,
  },
});
