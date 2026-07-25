import { useEffect } from "react";
import { Stack } from "expo-router";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useHobbyPlansStore } from "@/store/hobbyPlansStore";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      // Gemini's free tier is rate-limited; retry transient failures a
      // couple of times with backoff instead of failing the whole
      // plan-generation flow on one hiccup.
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const hydrate = useHobbyPlansStore((state) => state.hydrate);
  const hydrated = useHobbyPlansStore((state) => state.hydrated);

  useEffect(() => {
    hydrate().finally(() => {
      SplashScreen.hideAsync();
    });
  }, [hydrate]);

  if (!hydrated) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="add-hobby" options={{ presentation: "modal", headerShown: true, title: "Add a hobby" }} />
          <Stack.Screen name="plan/[hobbyId]" />
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
