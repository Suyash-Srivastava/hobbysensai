import { useEffect } from "react";
import { Stack } from "expo-router";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
// Importing from each weight's own submodule (not the package's top-level
// index) matters: the top-level index re-exports all 18 weight variants as
// eagerly-evaluated `require()`s, so importing even one name from it pulls
// every weight's .ttf into the bundle (measured: 7.9MB vs ~1.9MB scoped).
import { Inter_500Medium } from "@expo-google-fonts/inter/500Medium";
import { Inter_600SemiBold } from "@expo-google-fonts/inter/600SemiBold";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";
import { Inter_800ExtraBold } from "@expo-google-fonts/inter/800ExtraBold";
import { JetBrainsMono_500Medium } from "@expo-google-fonts/jetbrains-mono/500Medium";
import { JetBrainsMono_600SemiBold } from "@expo-google-fonts/jetbrains-mono/600SemiBold";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useHobbyPlansStore } from "@/store/hobbyPlansStore";
import { ErrorBoundary } from "@/components/error-boundary";
import { LearningPlanRequestError } from "@/lib/api/learningPlanClient";
import { Colors, Fonts } from "@/constants/theme";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      // Gemini's free tier is rate-limited; retry transient failures a
      // couple of times with backoff instead of failing the whole
      // plan-generation flow on one hiccup. But "input not recognized" is a
      // deterministic rejection, not a transient one - retrying it can't
      // ever succeed, and would just burn 2 extra AI calls (and make the
      // user wait through 2 pointless retries) before showing the error
      // they need to act on.
      retry: (failureCount, error) =>
        error instanceof LearningPlanRequestError && error.code === "input_not_recognized" ? false : failureCount < 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const hydrate = useHobbyPlansStore((state) => state.hydrate);
  const hydrated = useHobbyPlansStore((state) => state.hydrated);
  const [fontsLoaded] = useFonts({
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
  });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hydrated && fontsLoaded) SplashScreen.hideAsync();
  }, [hydrated, fontsLoaded]);

  if (!hydrated || !fontsLoaded) {
    return null;
  }

  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen
                name="add-hobby"
                options={{
                  presentation: "modal",
                  headerShown: true,
                  title: "New Hobby",
                  headerStyle: { backgroundColor: theme.background },
                  headerTintColor: theme.text,
                  headerTitleStyle: { fontFamily: Fonts.semibold },
                }}
              />
              <Stack.Screen name="plan/[hobbyId]" />
            </Stack>
          </ThemeProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
