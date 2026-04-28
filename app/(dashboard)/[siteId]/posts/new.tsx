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
      className="flex-1 bg-paper"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 px-8 pt-10 max-w-lg w-full mx-auto">
        <Text className="text-3xl font-serif text-ink mb-3">New post.</Text>
        <Text className="text-ink-muted mb-10">
          Give your post a title. You can edit content and add tags after.
        </Text>

        {error && (
          <View className="border-l-2 border-red-500 pl-3 mb-6">
            <Text className="text-red-600 text-sm">{error}</Text>
          </View>
        )}

        <Text className="text-xs text-ink-muted mb-1.5 uppercase tracking-wider">
          Title
        </Text>
        <TextInput
          className="border-b border-rule pb-2 mb-6 text-ink text-base"
          placeholder="My first blog post"
          placeholderTextColor="#A8A8A8"
          value={title}
          onChangeText={handleTitleChange}
          autoFocus
        />

        <Text className="text-xs text-ink-muted mb-1.5 uppercase tracking-wider">
          Slug
        </Text>
        <TextInput
          className="border-b border-rule pb-2 mb-10 text-ink text-base font-mono"
          placeholder="/my-first-blog-post"
          placeholderTextColor="#A8A8A8"
          value={slug}
          onChangeText={setSlug}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          className="bg-ink py-3 rounded-full items-center"
          onPress={handleCreate}
          disabled={loading || !title || !slug}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-paper text-sm">Create & edit</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
