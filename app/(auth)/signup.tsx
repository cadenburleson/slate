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

export default function SignupScreen() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSignup() {
    if (!email || !password) return;
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signUp(email.trim(), password);
      setSuccess(true);
    } catch (e: any) {
      setError(e.message ?? "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <View className="flex-1 bg-stone-50 justify-center items-center px-6">
        <Text className="text-4xl mb-4">📬</Text>
        <Text className="text-2xl font-bold text-stone-900 mb-2 text-center">
          Check your email
        </Text>
        <Text className="text-stone-500 text-center max-w-xs leading-relaxed">
          We sent a confirmation link to {email}. Click it to activate your account.
        </Text>
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity className="mt-8">
            <Text className="text-stone-900 font-medium">Back to login</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-stone-50"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 justify-center px-6 max-w-sm w-full mx-auto">
        <Text className="text-3xl font-bold text-stone-900 mb-1">Get started</Text>
        <Text className="text-stone-500 mb-8">Create your free Headless account</Text>

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
          placeholder="Min. 8 characters"
          placeholderTextColor="#a8a29e"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
        />

        <TouchableOpacity
          className="bg-stone-900 py-3 rounded-xl items-center"
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold">Create account</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6">
          <Text className="text-stone-500 text-sm">Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text className="text-stone-900 text-sm font-medium">Log in</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
