import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { sites } from "@/lib/db";
import type { Site } from "@/lib/db";

export default function SettingsScreen() {
  const { siteId } = useLocalSearchParams<{ siteId: string }>();
  const router = useRouter();
  const [site, setSite] = useState<Site | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    sites.getSite(siteId).then(setSite).catch(console.error);
  }, [siteId]);

  async function handleDelete() {
    Alert.alert(
      "Delete site",
      `This will permanently delete ${site?.domain} and all its pages and posts. This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete site",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await sites.deleteSite(siteId);
              router.replace("/(dashboard)");
            } catch (e: any) {
              Alert.alert("Error", e.message);
              setDeleting(false);
            }
          },
        },
      ]
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="px-5 pt-6 pb-8 max-w-lg w-full mx-auto">
        <View className="bg-white rounded-xl border border-slate-100 px-5 py-4 mb-4">
          <Text className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Site info
          </Text>
          <View className="flex-row justify-between py-2 border-b border-slate-50">
            <Text className="text-slate-600 text-sm">Domain</Text>
            <Text className="text-slate-900 text-sm font-mono">{site?.domain}</Text>
          </View>
          <View className="flex-row justify-between py-2 border-b border-slate-50">
            <Text className="text-slate-600 text-sm">Platform</Text>
            <Text className="text-slate-900 text-sm capitalize">
              {site?.detected_platform ?? "Unknown"}
            </Text>
          </View>
          <View className="flex-row justify-between py-2">
            <Text className="text-slate-600 text-sm">Site ID</Text>
            <Text className="text-slate-900 text-xs font-mono">{site?.snippet_token}</Text>
          </View>
        </View>

        <View className="bg-white rounded-xl border border-slate-100 px-5 py-4 mb-4">
          <Text className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Stripe (coming soon)
          </Text>
          <Text className="text-slate-500 text-sm leading-relaxed">
            Connect your Stripe account to create service pages where visitors can purchase
            directly on your site.
          </Text>
          <TouchableOpacity
            disabled
            className="mt-4 border border-slate-200 rounded-xl py-3 items-center opacity-50"
          >
            <Text className="text-slate-500 font-medium text-sm">Connect Stripe</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-xl border border-red-100 px-5 py-4">
          <Text className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">
            Danger zone
          </Text>
          <Text className="text-slate-500 text-sm mb-4 leading-relaxed">
            Permanently delete this site and all of its content. This action cannot be undone.
          </Text>
          <TouchableOpacity
            onPress={handleDelete}
            disabled={deleting}
            className="bg-red-600 rounded-xl py-3 items-center"
          >
            {deleting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold">Delete this site</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
