import { Stack } from "expo-router";

export default function DashboardLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#fafaf9" },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: "700", color: "#1c1917" },
        headerBackTitle: "Back",
        contentStyle: { backgroundColor: "#fafaf9" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Sites" }} />
      <Stack.Screen name="add-site" options={{ title: "Add Site", presentation: "modal" }} />
      <Stack.Screen name="[siteId]" options={{ headerShown: false }} />
    </Stack>
  );
}
