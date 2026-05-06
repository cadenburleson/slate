import { Stack, useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import Logo from "@/components/Logo";

function HeaderBack() {
  const router = useRouter();
  if (!router.canGoBack()) return null;
  return (
    <TouchableOpacity
      onPress={() => router.back()}
      style={{ paddingHorizontal: 12, paddingVertical: 6, marginLeft: -8 }}
      accessibilityRole="button"
      accessibilityLabel="Go back"
    >
      <Text style={{ fontSize: 28, color: "#1c1917", lineHeight: 28, fontWeight: "300" }}>‹</Text>
    </TouchableOpacity>
  );
}

export default function SiteLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#fafaf9" },
        headerShadowVisible: false,
        headerLeft: () => <HeaderBack />,
        headerTitle: ({ children }) => (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Logo width={22} height={22} />
            <Text style={{ fontWeight: "700", color: "#1c1917", fontSize: 17 }}>
              {children}
            </Text>
          </View>
        ),
        headerBackTitle: "Sites",
        contentStyle: { backgroundColor: "#fafaf9" },
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
