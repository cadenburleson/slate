import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { posts } from "@/lib/db";

function slugify(title: string) {
  return (
    "/" +
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
  );
}

export default function NewPostScreen() {
  const { siteId } = useLocalSearchParams<{ siteId: string }>();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleTitleChange(text: string) {
    setTitle(text);
    setSlug(slugify(text));
  }

  async function handleCreate() {
    if (!title.trim() || !slug.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const post = await posts.createPost(siteId, slug, title.trim());
      router.replace(`/(dashboard)/${siteId}/posts/${post.id}`);
    } catch (e: any) {
      setError(e.message ?? "Failed to create post");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-stone-50"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 px-6 pt-8 max-w-lg w-full mx-auto">
        <Text className="text-2xl font-bold text-stone-900 mb-1">New post</Text>
        <Text className="text-stone-500 mb-6">
          Give your post a title. You can edit content and add tags after.
        </Text>

        {error && (
          <View className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
            <Text className="text-red-600 text-sm">{error}</Text>
          </View>
        )}

        <Text className="text-sm font-medium text-stone-700 mb-1">Title</Text>
        <TextInput
          className="border border-stone-200 rounded-xl px-4 py-3 mb-4 text-stone-900 bg-stone-50"
          placeholder="My first blog post"
          placeholderTextColor="#a8a29e"
          value={title}
          onChangeText={handleTitleChange}
          autoFocus
        />

        <Text className="text-sm font-medium text-stone-700 mb-1">Slug</Text>
        <TextInput
          className="border border-stone-200 rounded-xl px-4 py-3 mb-6 text-stone-900 bg-stone-50 font-mono"
          placeholder="/my-first-blog-post"
          placeholderTextColor="#a8a29e"
          value={slug}
          onChangeText={setSlug}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          className="bg-stone-900 py-3 rounded-xl items-center"
          onPress={handleCreate}
          disabled={loading || !title || !slug}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold">Create & edit</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
