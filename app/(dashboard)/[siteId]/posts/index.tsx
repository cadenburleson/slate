import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { posts } from "@/lib/db";
import type { Post } from "@/lib/db";

function PostRow({ post }: { post: Post }) {
  const { siteId } = useLocalSearchParams<{ siteId: string }>();
  return (
    <Link href={`/(dashboard)/${siteId}/posts/${post.id}`} asChild>
      <TouchableOpacity className="bg-white rounded-xl border border-slate-100 px-5 py-4 mb-3 active:opacity-70">
        <View className="flex-row items-start justify-between gap-2">
          <View className="flex-1">
            <Text className="font-semibold text-slate-900">{post.title}</Text>
            <Text className="text-slate-400 text-xs mt-0.5 font-mono">{post.slug}</Text>
            {post.tags.length > 0 && (
              <View className="flex-row flex-wrap gap-1 mt-1">
                {post.tags.map((tag) => (
                  <View key={tag} className="bg-slate-100 px-2 py-0.5 rounded-full">
                    <Text className="text-slate-500 text-xs">{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
          <View
            className={`px-2 py-0.5 rounded-full ${
              post.status === "published" ? "bg-green-50" : "bg-slate-100"
            }`}
          >
            <Text
              className={`text-xs font-medium capitalize ${
                post.status === "published" ? "text-green-700" : "text-slate-500"
              }`}
            >
              {post.status}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

export default function PostsListScreen() {
  const { siteId } = useLocalSearchParams<{ siteId: string }>();
  const [postList, setPostList] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await posts.listPosts(siteId);
      setPostList(data);
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
        data={postList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostRow post={item} />}
        contentContainerClassName="px-5 pt-4 pb-8"
        ListEmptyComponent={
          <View className="items-center justify-center py-16">
            <Text className="text-4xl mb-4">✍️</Text>
            <Text className="text-xl font-bold text-slate-900 mb-2">No posts yet</Text>
            <Text className="text-slate-500 text-center">Write your first blog post below.</Text>
          </View>
        }
        ListFooterComponent={
          <Link href={`/(dashboard)/${siteId}/posts/new`} asChild>
            <TouchableOpacity className="bg-indigo-600 rounded-xl py-3 items-center mt-4">
              <Text className="text-white font-semibold">+ New post</Text>
            </TouchableOpacity>
          </Link>
        }
      />
    </View>
  );
}
