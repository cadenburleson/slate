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
      className="flex-1 bg-paper"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 px-8 pt-10 max-w-lg w-full mx-auto">
        <Text className="text-3xl font-serif text-ink mb-3">Add a site.</Text>
        <Text className="text-ink-muted mb-10 leading-relaxed">
          Enter your site's domain. We'll generate a snippet you can paste into your{" "}
          <Text className="font-mono text-sm">{"<head>"}</Text>.
        </Text>

        {error && (
          <View className="border-l-2 border-red-500 pl-3 mb-6">
            <Text className="text-red-600 text-sm">{error}</Text>
          </View>
        )}

        <Text className="text-xs text-ink-muted mb-1.5 uppercase tracking-wider">
          Domain
        </Text>
        <TextInput
          className="border-b border-rule pb-2 mb-2 text-ink text-base font-mono"
          placeholder="example.com"
          placeholderTextColor="#A8A8A8"
          value={domain}
          onChangeText={setDomain}
          autoCapitalize="none"
          keyboardType="url"
          autoCorrect={false}
        />
        <Text className="text-xs text-ink-faint mb-10">
          No need to include https:// — just the domain name.
        </Text>

        <TouchableOpacity
          className="bg-ink py-3 rounded-full items-center"
          onPress={handleAdd}
          disabled={loading || !domain}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-paper text-sm">Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
