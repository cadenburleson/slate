import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth";

// Landing route for Supabase email-confirmation links.
//
// The Supabase JS client has detectSessionInUrl=true, so by the time
// AuthProvider's useEffect runs it has already exchanged the ?code= in
// the URL for a session. Once loading resolves we just route the user to
// the right place — no manual exchange needed here.
export default function CallbackScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? "/(dashboard)" : "/(auth)/login");
  }, [user, loading]);

  return (
    <View className="flex-1 bg-stone-50 items-center justify-center px-6">
      <ActivityIndicator />
      <Text className="mt-4 text-stone-600">Confirming your email…</Text>
    </View>
  );
}
