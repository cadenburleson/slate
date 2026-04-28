import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { pages } from "@/lib/db";
import type { Page } from "@/lib/db";

function PageRow({ page }: { page: Page }) {
  const { siteId } = useLocalSearchParams<{ siteId: string }>();
  return (
    <Link href={`/(dashboard)/${siteId}/pages/${page.id}`} asChild>
      <TouchableOpacity className="py-5 border-b border-rule active:opacity-60">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-ink text-lg font-serif">{page.title}</Text>
            <Text className="text-ink-faint text-xs mt-1 font-mono">{page.slug}</Text>
          </View>
          <Text
            className={`text-xs ${
              page.status === "published" ? "text-leaf" : "text-ink-faint"
            }`}
          >
            {page.status === "published" ? "Published" : "Draft"}
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

export default function PagesListScreen() {
  const { siteId } = useLocalSearchParams<{ siteId: string }>();
  const [pageList, setPageList] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await pages.listPages(siteId);
      setPageList(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-paper">
        <ActivityIndicator color="#191919" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-paper">
      <FlatList
        data={pageList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PageRow page={item} />}
        contentContainerClassName="px-8 pt-6 pb-12 max-w-2xl mx-auto w-full"
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Text className="text-3xl font-serif text-ink mb-3">No pages yet.</Text>
            <Text className="text-ink-muted text-center">Create your first page below.</Text>
          </View>
        }
        ListFooterComponent={
          <Link href={`/(dashboard)/${siteId}/pages/new`} asChild>
            <TouchableOpacity className="bg-ink rounded-full py-3 items-center mt-8">
              <Text className="text-paper text-sm">New page</Text>
            </TouchableOpacity>
          </Link>
        }
      />
    </View>
  );
}
