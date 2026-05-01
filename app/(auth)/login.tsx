import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
      router.replace("/(dashboard)");
    } catch (e: any) {
      setError(e.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-stone-50"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 justify-center px-6 max-w-sm w-full mx-auto">
        <Text className="text-3xl font-bold text-stone-900 mb-1">Welcome back</Text>
        <Text className="text-stone-500 mb-8">Log in to your Headless account</Text>

        {error && (
          <View className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
            <Text className="text-red-600 text-sm">{error}</Text>
          </View>
        )}

        <Text className="text-sm font-medium text-stone-700 mb-1">Email</Text>
        <TextInput
          className="border border-stone-200 rounded-xl px-4 py-3 mb-4 text-stone-900 bg-stone-50"
          placeholder="you@example.com"
          placeholderTextColor="#a8a29e"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />

        <Text className="text-sm font-medium text-stone-700 mb-1">Password</Text>
        <TextInput
          className="border border-stone-200 rounded-xl px-4 py-3 mb-6 text-stone-900 bg-stone-50"
          placeholder="••••••••"
          placeholderTextColor="#a8a29e"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="current-password"
        />

        <TouchableOpacity
          className="bg-stone-900 py-3 rounded-xl items-center"
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold">Log in</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6">
          <Text className="text-stone-500 text-sm">Don't have an account? </Text>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity>
              <Text className="text-stone-900 text-sm font-medium">Sign up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
