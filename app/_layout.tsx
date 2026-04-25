import "../global.css";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/lib/auth";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ConfirmHost } from "@/lib/confirm";

function RouteGuard() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === "(auth)";
    const inDashboard = segments[0] === "(dashboard)";

    if (!user && inDashboard) {
      router.replace("/(auth)/login");
    } else if (user && inAuth) {
      router.replace("/(dashboard)");
    }
  }, [user, loading, segments]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView className="flex-1">
      <AuthProvider>
        <RouteGuard />
        <ConfirmHost />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
