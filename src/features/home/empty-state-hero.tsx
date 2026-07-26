import { Image, StyleSheet, View, useColorScheme } from "react-native";
import { useTheme } from "@/hooks/use-theme";
import { Spacing } from "@/constants/theme";

/**
 * Cropped/compressed from a single warm "hobby flat-lay" source photo (see
 * assets/images/heroimage/hobbysensaihome.png, kept out of git - only the
 * @1x/@2x/@3x crops actually shipped are tracked). The crop deliberately
 * avoids the source image's own baked-in tagline text, since that can't
 * adapt to the app's light/dark theme or typography the way the screen's
 * real headline below it does.
 */
export function EmptyStateHero() {
  const theme = useTheme();
  const scheme = useColorScheme() === "dark" ? "dark" : "light";

  return (
    <View style={[styles.container, { borderColor: theme.border }]}>
      {/* A literal require() is what lets RN's static asset resolution pick the right @2x/@3x density. */}
      <Image source={require("../../../assets/images/heroimage/hero.jpg")} style={styles.image} resizeMode="cover" />
      {/* A light photo reads too bright against the dark theme's page background - a soft tint blends it in rather than looking like a pasted-in rectangle. */}
      {scheme === "dark" ? <View style={[styles.scrim, { backgroundColor: theme.background }]} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    // Matches the shipped crop's own aspect ratio (see the crop script this
    // asset was generated from) - deriving height this way instead of a
    // fixed pixel value keeps the box from stretching the photo to fit an
    // unrelated size if the crop ratio ever changes.
    aspectRatio: 1.9,
    borderRadius: Spacing.four,
    borderWidth: 1,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  scrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.28,
  },
});
