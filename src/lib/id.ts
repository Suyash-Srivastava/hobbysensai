// A short, locally-unique id. Good enough for on-device records that never
// leave AsyncStorage - not a cryptographic identifier, so no need for the
// extra expo-crypto dependency just to generate one.
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
