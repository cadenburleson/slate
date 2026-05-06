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
import Head from "expo-router/head";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export default function LoginScreen() {
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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

  async function handleGoogle() {
    setGoogleLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      // On web, signInWithOAuth navigates away — code below only runs if
      // we're back from a native OAuth flow with a successful session.
      if (Platform.OS !== "web") router.replace("/(dashboard)");
    } catch (e: any) {
      setError(e.message ?? "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Log in — Headless</title>
        <meta name="description" content="Log in to your Headless account to manage pages, blog posts, and service pages on your sites." />
      </Head>
      <KeyboardAvoidingView
        className="flex-1 bg-stone-50"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
      <View role="main" className="flex-1 justify-center px-6 max-w-sm w-full mx-auto">
        <Text
          role="heading"
          aria-level={1}
          className="text-3xl font-bold text-stone-900 mb-1"
        >
          Welcome back
        </Text>
        <Text className="text-stone-500 mb-8">Log in to your Headless account</Text>

        {error && (
          <View className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
            <Text className="text-red-600 text-sm">{error}</Text>
          </View>
        )}

        <TouchableOpacity
          className="border border-stone-300 bg-white py-3 rounded-xl items-center flex-row justify-center mb-5"
          onPress={handleGoogle}
          disabled={googleLoading || loading}
        >
          {googleLoading ? (
            <ActivityIndicator color="#1c1917" />
          ) : (
            <Text className="text-stone-900 font-medium">Continue with Google</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row items-center mb-5">
          <View className="flex-1 h-px bg-stone-200" />
          <Text className="mx-3 text-stone-400 text-xs uppercase tracking-wider">or</Text>
          <View className="flex-1 h-px bg-stone-200" />
        </View>

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
    </>
  );
}
