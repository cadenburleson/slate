import { Stack } from "expo-router";

export default function DashboardLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#ffffff" },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: "700", color: "#0f172a" },
        headerBackTitle: "Back",
        contentStyle: { backgroundColor: "#f8fafc" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Sites" }} />
      <Stack.Screen name="add-site" options={{ title: "Add Site", presentation: "modal" }} />
      <Stack.Screen name="[siteId]" options={{ headerShown: false }} />
    </Stack>
  );
}
