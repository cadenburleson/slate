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
      <TouchableOpacity className="py-6 border-b border-rule active:opacity-60">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-ink text-xl font-serif">{post.title}</Text>
            <Text className="text-ink-faint text-xs mt-1 font-mono">{post.slug}</Text>
            {post.tags.length > 0 && (
              <View className="flex-row flex-wrap gap-3 mt-2">
                {post.tags.map((tag) => (
                  <Text key={tag} className="text-ink-muted text-xs">
                    {tag}
                  </Text>
                ))}
              </View>
            )}
          </View>
          <Text
            className={`text-xs ${
              post.status === "published" ? "text-leaf" : "text-ink-faint"
            }`}
          >
            {post.status === "published" ? "Published" : "Draft"}
          </Text>
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
      <View className="flex-1 items-center justify-center bg-paper">
        <ActivityIndicator color="#191919" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-paper">
      <FlatList
        data={postList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostRow post={item} />}
        contentContainerClassName="px-8 pt-6 pb-12 max-w-2xl mx-auto w-full"
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Text className="text-3xl font-serif text-ink mb-3">No posts yet.</Text>
            <Text className="text-ink-muted text-center">Write your first post below.</Text>
          </View>
        }
        ListFooterComponent={
          <Link href={`/(dashboard)/${siteId}/posts/new`} asChild>
            <TouchableOpacity className="bg-ink rounded-full py-3 items-center mt-8">
              <Text className="text-paper text-sm">New post</Text>
            </TouchableOpacity>
          </Link>
        }
      />
    </View>
  );
}
