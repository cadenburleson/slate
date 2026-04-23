import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { sites } from "@/lib/db";

export default function AddSiteScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function normalizedDomain(raw: string) {
    return raw.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
  }

  async function handleAdd() {
    const d = normalizedDomain(domain.trim());
    if (!d) return;
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const site = await sites.createSite(d, user.id);
      router.replace(`/(dashboard)/${site.id}/snippet`);
    } catch (e: any) {
      setError(e.message ?? "Failed to add site");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 px-6 pt-8 max-w-lg w-full mx-auto">
        <Text className="text-2xl font-bold text-slate-900 mb-1">Add a site</Text>
        <Text className="text-slate-500 mb-8 leading-relaxed">
          Enter your site's domain. We'll generate a snippet you can paste into your{" "}
          <Text className="font-mono text-sm">{"<head>"}</Text>.
        </Text>

        {error && (
          <View className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
            <Text className="text-red-600 text-sm">{error}</Text>
          </View>
        )}

        <Text className="text-sm font-medium text-slate-700 mb-1">Domain</Text>
        <TextInput
          className="border border-slate-200 rounded-xl px-4 py-3 mb-2 text-slate-900 bg-slate-50 font-mono"
          placeholder="example.com"
          placeholderTextColor="#94a3b8"
          value={domain}
          onChangeText={setDomain}
          autoCapitalize="none"
          keyboardType="url"
          autoCorrect={false}
        />
        <Text className="text-xs text-slate-400 mb-6">
          No need to include https:// — just the domain name.
        </Text>

        <TouchableOpacity
          className="bg-indigo-600 py-3 rounded-xl items-center"
          onPress={handleAdd}
          disabled={loading || !domain}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold">Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
