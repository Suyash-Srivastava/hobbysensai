import { Modal, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/hooks/use-theme";
import { Shadow, Spacing } from "@/constants/theme";
import type { Technique, TechniqueStatus } from "@/shared/hobbyPlan.schema";
import { TechniqueDetailContent } from "./technique-detail-content";

interface TechniqueDetailSheetProps {
  technique: Technique | null;
  categoryColor: string;
  onClose: () => void;
  onChangeStatus: (status: TechniqueStatus) => void;
}

/**
 * Mobile presentation: a bottom sheet. Web gets the modal-dialog variant in
 * technique-detail-sheet.web.tsx - same content, different platform
 * convention, via Expo's file-extension platform split. Uses the app's own
 * theme surface (not a special "paper" treatment) so it reads as the same
 * app, not a different one popping up on top.
 */
export function TechniqueDetailSheet({ technique, categoryColor, onClose, onChangeStatus }: TechniqueDetailSheetProps) {
  const theme = useTheme();

  return (
    <Modal visible={technique !== null} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <SafeAreaView style={styles.sheetWrapper} pointerEvents="box-none">
        <ThemedView type="backgroundElement" style={styles.sheet}>
          <ThemedView style={[styles.handle, { backgroundColor: theme.borderStrong }]} />
          {technique ? (
            <TechniqueDetailContent
              technique={technique}
              categoryColor={categoryColor}
              onClose={onClose}
              onChangeStatus={onChangeStatus}
            />
          ) : null}
        </ThemedView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheetWrapper: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
    boxShadow: Shadow.floating,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 5,
    borderRadius: 3,
    marginBottom: Spacing.two,
  },
});
