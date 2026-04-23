import { Stack } from "expo-router";

export default function SiteLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#ffffff" },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: "700", color: "#0f172a" },
        headerBackTitle: "Sites",
        contentStyle: { backgroundColor: "#f8fafc" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Overview" }} />
      <Stack.Screen name="snippet" options={{ title: "Snippet" }} />
      <Stack.Screen name="settings" options={{ title: "Settings" }} />
      <Stack.Screen name="team" options={{ title: "Team" }} />
      <Stack.Screen name="pages/index" options={{ title: "Pages" }} />
      <Stack.Screen name="pages/new" options={{ title: "New Page", presentation: "modal" }} />
      <Stack.Screen name="pages/[pageId]" options={{ title: "Edit Page" }} />
      <Stack.Screen name="posts/index" options={{ title: "Blog Posts" }} />
      <Stack.Screen name="posts/new" options={{ title: "New Post", presentation: "modal" }} />
      <Stack.Screen name="posts/[postId]" options={{ title: "Edit Post" }} />
    </Stack>
  );
}
