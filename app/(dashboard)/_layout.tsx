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
