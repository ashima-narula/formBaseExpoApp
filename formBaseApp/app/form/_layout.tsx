import { Stack } from "expo-router";

export default function FormLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />         {/* Form list screen */}
      <Stack.Screen name="add/[id]"  />
      <Stack.Screen name="edit/[id]" />
      <Stack.Screen name="map/[id]" />
      <Stack.Screen name="records/[id]" />
      <Stack.Screen name="fields/[id]" />
      <Stack.Screen name="fields/add/[id]" />
    </Stack>
  );
}
