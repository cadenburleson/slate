import { Stack } from "expo-router";

export default function DashboardLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#ffffff" },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: "400", color: "#191919", fontSize: 16 },
        headerBackTitle: "Back",
        headerTintColor: "#191919",
        contentStyle: { backgroundColor: "#ffffff" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Sites" }} />
      <Stack.Screen name="add-site" options={{ title: "New site", presentation: "modal" }} />
      <Stack.Screen name="[siteId]" options={{ headerShown: false }} />
    </Stack>
  );
}
