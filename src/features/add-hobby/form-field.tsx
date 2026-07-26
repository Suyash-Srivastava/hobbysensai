import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { Spacing } from "@/constants/theme";

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  required?: boolean;
}

export function FormField({ label, error, required, style, ...inputProps }: FormFieldProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <TextInput
        placeholderTextColor={theme.textSecondary}
        textAlignVertical={inputProps.multiline ? "top" : undefined}
        style={[
          styles.input,
          { color: theme.text, borderBottomColor: error ? theme.error : theme.border },
          inputProps.multiline && styles.multilineInput,
          style,
        ]}
        {...inputProps}
      />
      {error ? (
        <View style={styles.hintRow}>
          <View style={[styles.dot, { backgroundColor: theme.error }]} />
          <ThemedText type="small" style={{ color: theme.error }}>
            {error}
          </ThemedText>
        </View>
      ) : required ? (
        <View style={styles.hintRow}>
          <View style={[styles.dot, { backgroundColor: theme.borderStrong }]} />
          <ThemedText type="small" themeColor="textSecondary">
            Required
          </ThemedText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
  input: {
    borderBottomWidth: 1.5,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 64,
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    marginTop: 2,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
});
