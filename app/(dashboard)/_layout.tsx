import { Stack } from "expo-router";
import { Text, View } from "react-native";
import Logo from "@/components/Logo";

export default function DashboardLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#fafaf9" },
        headerShadowVisible: false,
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
