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
      className="flex-1 bg-paper"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 justify-center px-8 max-w-sm w-full mx-auto">
        <Text className="text-4xl font-serif text-ink mb-2">Welcome back.</Text>
        <Text className="text-ink-muted mb-10">Sign in to your Slate account.</Text>

        {error && (
          <View className="border-l-2 border-red-500 pl-3 mb-6">
            <Text className="text-red-600 text-sm">{error}</Text>
          </View>
        )}

        <Text className="text-xs text-ink-muted mb-1.5 uppercase tracking-wider">
          Email
        </Text>
        <TextInput
          className="border-b border-rule pb-2 mb-6 text-ink text-base"
          placeholder="you@example.com"
          placeholderTextColor="#A8A8A8"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />

        <Text className="text-xs text-ink-muted mb-1.5 uppercase tracking-wider">
          Password
        </Text>
        <TextInput
          className="border-b border-rule pb-2 mb-10 text-ink text-base"
          placeholder="••••••••"
          placeholderTextColor="#A8A8A8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="current-password"
        />

        <TouchableOpacity
          className="bg-ink py-3 rounded-full items-center"
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-paper text-sm">Sign in</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center mt-8">
          <Text className="text-ink-muted text-sm">No account? </Text>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity>
              <Text className="text-ink text-sm underline">Sign up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
