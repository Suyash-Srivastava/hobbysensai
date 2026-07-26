import { Component, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/button";
import { MaxContentWidth, Spacing } from "@/constants/theme";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Last-resort catch for render-time crashes. Without this, an unhandled
 * render error unmounts the whole tree and leaves a blank white screen with
 * no way back - the persisted plans are still intact on disk, so offering a
 * reset that re-mounts the tree recovers the session rather than losing it.
 *
 * Deliberately a class component: React has no hook equivalent of
 * componentDidCatch.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("Unhandled render error:", error);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <ThemedView style={styles.container}>
        <View style={styles.content}>
          <ThemedText type="eyebrow">Something broke</ThemedText>
          <ThemedText type="title" style={styles.title}>
            That wasn&apos;t supposed to happen.
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Your saved hobbies are still on this device - nothing was lost.
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.detail}>
            {error.message}
          </ThemedText>
          <Button label="Try again" onPress={this.handleReset} testID="error-boundary-reset" style={styles.button} />
        </View>
      </ThemedView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    width: "100%",
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  detail: {
    opacity: 0.7,
  },
  button: {
    marginTop: Spacing.three,
  },
});
