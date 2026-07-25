import { useSyncExternalStore } from 'react';
import { Appearance } from 'react-native';

/**
 * To support static rendering, this value needs to be re-calculated on the
 * client side for web. useSyncExternalStore lets us return a stable 'light'
 * value for the server-rendered snapshot and the real scheme once mounted,
 * without the extra render a state+effect "hasHydrated" flag would cause.
 */
function subscribe(callback: () => void) {
  const subscription = Appearance.addChangeListener(callback);
  return () => subscription.remove();
}

export function useColorScheme() {
  return useSyncExternalStore(
    subscribe,
    () => Appearance.getColorScheme(),
    () => 'light',
  );
}
