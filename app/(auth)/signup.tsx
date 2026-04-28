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
      <View className="flex-1 bg-paper justify-center items-center px-8">
        <Text className="text-3xl font-serif text-ink mb-3 text-center">
          Check your email.
        </Text>
        <Text className="text-ink-muted text-center max-w-xs leading-relaxed">
          We sent a confirmation link to {email}. Click it to activate your account.
        </Text>
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity className="mt-10">
            <Text className="text-ink text-sm underline">Back to sign in</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-paper"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 justify-center px-8 max-w-sm w-full mx-auto">
        <Text className="text-4xl font-serif text-ink mb-2">Get started.</Text>
        <Text className="text-ink-muted mb-10">Create your free Slate account.</Text>

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
          placeholder="Min. 8 characters"
          placeholderTextColor="#A8A8A8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
        />

        <TouchableOpacity
          className="bg-ink py-3 rounded-full items-center"
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-paper text-sm">Create account</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center mt-8">
          <Text className="text-ink-muted text-sm">Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text className="text-ink text-sm underline">Sign in</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
