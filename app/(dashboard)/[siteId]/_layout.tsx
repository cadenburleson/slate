import { Stack } from "expo-router";

export default function SiteLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#ffffff" },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: "400", color: "#191919", fontSize: 16 },
        headerBackTitle: "Sites",
        headerTintColor: "#191919",
        contentStyle: { backgroundColor: "#ffffff" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "" }} />
      <Stack.Screen name="snippet" options={{ title: "Snippet" }} />
      <Stack.Screen name="settings" options={{ title: "Settings" }} />
      <Stack.Screen name="team" options={{ title: "Team" }} />
      <Stack.Screen name="pages/index" options={{ title: "Pages" }} />
      <Stack.Screen name="pages/new" options={{ title: "New page", presentation: "modal" }} />
      <Stack.Screen name="pages/[pageId]" options={{ title: "" }} />
      <Stack.Screen name="posts/index" options={{ title: "Posts" }} />
      <Stack.Screen name="posts/new" options={{ title: "New post", presentation: "modal" }} />
      <Stack.Screen name="posts/[postId]" options={{ title: "" }} />
    </Stack>
  );
}
