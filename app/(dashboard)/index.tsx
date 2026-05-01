import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { sites } from "@/lib/db";
import type { Site } from "@/lib/db";

function SiteCard({ site }: { site: Site }) {
  return (
    <Link href={`/(dashboard)/${site.id}`} asChild>
      <TouchableOpacity className="bg-white rounded-xl border border-stone-100 px-5 py-4 mb-3 active:opacity-70">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="font-semibold text-stone-900 text-base">{site.domain}</Text>
            {site.detected_platform && (
              <Text className="text-stone-400 text-xs mt-0.5 capitalize">
                {site.detected_platform}
              </Text>
            )}
          </View>
          <Text className="text-stone-300 text-lg">›</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

export default function SitesScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [siteList, setSiteList] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const data = await sites.listSites(user.id);
      setSiteList(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View className="flex-1 bg-stone-50">
      <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
        <Text className="text-xs text-stone-400">{user?.email}</Text>
        <TouchableOpacity onPress={signOut}>
          <Text className="text-xs text-stone-400">Sign out</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#44403c" />
        </View>
      ) : siteList.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-4xl mb-4">🌐</Text>
          <Text className="text-xl font-bold text-stone-900 mb-2">No sites yet</Text>
          <Text className="text-stone-500 text-center leading-relaxed mb-8">
            Add your first site to get a snippet and start editing content.
          </Text>
          <Link href="/(dashboard)/add-site" asChild>
            <TouchableOpacity className="bg-stone-900 px-6 py-3 rounded-xl">
              <Text className="text-white font-semibold">Add your first site</Text>
            </TouchableOpacity>
          </Link>
        </View>
      ) : (
        <FlatList
          data={siteList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <SiteCard site={item} />}
          contentContainerClassName="px-5 pt-4 pb-8"
          ListFooterComponent={
            <Link href="/(dashboard)/add-site" asChild>
              <TouchableOpacity className="border border-dashed border-stone-300 rounded-xl py-4 items-center mt-2">
                <Text className="text-stone-500 font-medium">+ Add another site</Text>
              </TouchableOpacity>
            </Link>
          }
        />
      )}
    </View>
  );
}
