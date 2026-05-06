import { Stack, useRouter, usePathname } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import Logo from "@/components/Logo";

// Show on every sub-route. canGoBack() alone is unreliable because users
// who land on a sub-route via direct URL (hot-reload during dev, deep-link
// from email, opening a bookmark) have no stack history to pop. Fall back
// to navigating to the URL's parent segment in that case.
function HeaderBack() {
  const router = useRouter();
  const pathname = usePathname();

  if (!pathname || pathname === "/") return null;

  const onPress = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    const parts = pathname.split("/").filter(Boolean);
    const parentPath = parts.length <= 1 ? "/" : "/" + parts.slice(0, -1).join("/");
    router.replace(parentPath as any);
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ paddingLeft: 16, paddingRight: 12, paddingVertical: 6 }}
      accessibilityRole="button"
      accessibilityLabel="Go back"
    >
      <Text style={{ fontSize: 28, color: "#1c1917", lineHeight: 28, fontWeight: "300" }}>‹</Text>
    </TouchableOpacity>
  );
}

export default function DashboardLayout() {
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
