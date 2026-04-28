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

function SiteRow({ site }: { site: Site }) {
  return (
    <Link href={`/(dashboard)/${site.id}`} asChild>
      <TouchableOpacity className="py-5 border-b border-rule active:opacity-60">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-ink text-lg">{site.domain}</Text>
            {site.detected_platform && (
              <Text className="text-ink-faint text-xs mt-1 capitalize">
                {site.detected_platform}
              </Text>
            )}
          </View>
          <Text className="text-ink-faint text-base">→</Text>
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
    <View className="flex-1 bg-paper">
      <View className="flex-row items-center justify-between px-8 pt-4 pb-6">
        <Text className="text-xs text-ink-faint">{user?.email}</Text>
        <TouchableOpacity onPress={signOut}>
          <Text className="text-xs text-ink-muted">Sign out</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#191919" />
        </View>
      ) : siteList.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-3xl font-serif text-ink mb-3">No sites yet.</Text>
          <Text className="text-ink-muted text-center leading-relaxed mb-10 max-w-sm">
            Add your first site to get a snippet and start editing content.
          </Text>
          <Link href="/(dashboard)/add-site" asChild>
            <TouchableOpacity className="bg-ink px-7 py-3 rounded-full">
              <Text className="text-paper text-sm">Add a site</Text>
            </TouchableOpacity>
          </Link>
        </View>
      ) : (
        <FlatList
          data={siteList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <SiteRow site={item} />}
          contentContainerClassName="px-8 pb-12 max-w-2xl mx-auto w-full"
          ListHeaderComponent={
            <Text className="text-xs uppercase tracking-wider text-ink-faint mb-2">
              Your sites
            </Text>
          }
          ListFooterComponent={
            <Link href="/(dashboard)/add-site" asChild>
              <TouchableOpacity className="py-5 active:opacity-60">
                <Text className="text-ink-muted">+ Add another site</Text>
              </TouchableOpacity>
            </Link>
          }
        />
      )}
    </View>
  );
}
