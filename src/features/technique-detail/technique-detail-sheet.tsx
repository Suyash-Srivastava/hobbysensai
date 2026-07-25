import { Modal, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import type { Technique, TechniqueStatus } from "@/shared/hobbyPlan.schema";
import { TechniqueDetailContent } from "./technique-detail-content";

interface TechniqueDetailSheetProps {
  technique: Technique | null;
  onClose: () => void;
  onChangeStatus: (status: TechniqueStatus) => void;
}

/**
 * Mobile presentation: a bottom sheet. Web gets the modal-dialog variant in
 * technique-detail-sheet.web.tsx - same content, different platform
 * convention, via Expo's file-extension platform split.
 */
export function TechniqueDetailSheet({ technique, onClose, onChangeStatus }: TechniqueDetailSheetProps) {
  return (
    <Modal visible={technique !== null} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <SafeAreaView style={styles.sheetWrapper} pointerEvents="box-none">
        <ThemedView type="backgroundElement" style={styles.sheet}>
          <ThemedView type="backgroundSelected" style={styles.handle} />
          {technique ? (
            <TechniqueDetailContent technique={technique} onClose={onClose} onChangeStatus={onChangeStatus} />
          ) : null}
        </ThemedView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
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
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: Spacing.two,
  },
});
