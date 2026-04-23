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
      <TouchableOpacity className="bg-white rounded-xl border border-slate-100 px-5 py-4 mb-3 active:opacity-70">
        <View className="flex-row items-start justify-between gap-2">
          <View className="flex-1">
            <Text className="font-semibold text-slate-900">{page.title}</Text>
            <Text className="text-slate-400 text-xs mt-0.5 font-mono">{page.slug}</Text>
          </View>
          <View
            className={`px-2 py-0.5 rounded-full ${
              page.status === "published" ? "bg-green-50" : "bg-slate-100"
            }`}
          >
            <Text
              className={`text-xs font-medium capitalize ${
                page.status === "published" ? "text-green-700" : "text-slate-500"
              }`}
            >
              {page.status}
            </Text>
          </View>
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
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#6366f1" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <FlatList
        data={pageList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PageRow page={item} />}
        contentContainerClassName="px-5 pt-4 pb-8"
        ListEmptyComponent={
          <View className="items-center justify-center py-16">
            <Text className="text-4xl mb-4">📄</Text>
            <Text className="text-xl font-bold text-slate-900 mb-2">No pages yet</Text>
            <Text className="text-slate-500 text-center">Create your first page below.</Text>
          </View>
        }
        ListFooterComponent={
          <Link href={`/(dashboard)/${siteId}/pages/new`} asChild>
            <TouchableOpacity className="bg-indigo-600 rounded-xl py-3 items-center mt-4">
              <Text className="text-white font-semibold">+ New page</Text>
            </TouchableOpacity>
          </Link>
        }
      />
    </View>
  );
}
