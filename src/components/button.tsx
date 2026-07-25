import { ActivityIndicator, Pressable, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { Shadow, Spacing } from "@/constants/theme";

type ButtonVariant = "primary" | "secondary" | "inverted" | "outlined";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Four variants matching the design system: primary (the CTA accent, pops
 * against the page), secondary (a filled but quieter option), inverted
 * (always a light surface + dark text, for use over a colored/gradient
 * hero regardless of app theme), outlined (transparent, border only).
 */
export function Button({ label, onPress, variant = "primary", disabled, loading, icon, testID, style }: ButtonProps) {
  const theme = useTheme();

  const variantStyle: StyleProp<ViewStyle> =
    variant === "primary"
      ? { backgroundColor: theme.accent }
      : variant === "secondary"
        ? { backgroundColor: theme.backgroundElement, borderWidth: 1, borderColor: theme.border }
        : variant === "inverted"
          ? { backgroundColor: "#FFFFFF" }
          : { backgroundColor: "transparent", borderWidth: 1.5, borderColor: theme.borderStrong };

  const textColor =
    variant === "primary" ? theme.accentText : variant === "inverted" ? "#0F172A" : theme.text;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled || loading}
      android_ripple={{ color: theme.borderStrong }}
      style={({ pressed }) => [
        styles.base,
        variantStyle,
        variant !== "outlined" && styles.shadow,
        (pressed || disabled || loading) && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <ThemedText type="smallBold" style={{ color: textColor }}>
          {icon ? `${icon} ` : ""}
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  shadow: {
    boxShadow: Shadow.card,
  },
  pressed: {
    opacity: 0.8,
  },
});
