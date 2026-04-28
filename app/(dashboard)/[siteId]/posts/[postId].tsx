import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { posts } from "@/lib/db";
import type { Block, Post } from "@/lib/db";
import { BlockEditor } from "@/components/BlockEditor";

export default function PostEditorScreen() {
  const { siteId, postId } = useLocalSearchParams<{
    siteId: string;
    postId: string;
  }>();
  const navigation = useNavigation();
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    posts
      .getPost(postId)
      .then((p) => {
        if (!p) return;
        setPost(p);
        setTitle(p.title);
        setBlocks(p.content_json ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [postId]);

  const autosave = useCallback(
    (nextTitle: string, nextBlocks: Block[], nextTags?: string[]) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      setDirty(true);
      saveTimer.current = setTimeout(async () => {
        setSaving(true);
        try {
          const updated = await posts.updatePost(postId, {
            title: nextTitle,
            content_json: nextBlocks,
            ...(nextTags !== undefined ? { tags: nextTags } : {}),
          });
          setPost(updated);
          setDirty(false);
        } catch (e) {
          console.error(e);
        } finally {
          setSaving(false);
        }
      }, 1500);
    },
    [postId]
  );

  function handleTitleChange(t: string) {
    setTitle(t);
    autosave(t, blocks);
  }

  function handleBlocksChange(b: Block[]) {
    setBlocks(b);
    autosave(title, b);
  }

  function addTag() {
    const tag = tagInput.trim();
    if (!tag || !post) return;
    const newTags = [...(post.tags ?? []), tag];
    setPost({ ...post, tags: newTags });
    setTagInput("");
    autosave(title, blocks, newTags);
  }

  function removeTag(tag: string) {
    if (!post) return;
    const newTags = post.tags.filter((t) => t !== tag);
    setPost({ ...post, tags: newTags });
    autosave(title, blocks, newTags);
  }

  async function handlePublishToggle() {
    if (!post) return;
    setSaving(true);
    try {
      const updated =
        post.status === "published"
          ? await posts.unpublishPost(postId)
          : await posts.publishPost(postId);
      setPost(updated);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    Alert.alert("Delete post", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await posts.deletePost(postId);
          navigation.goBack();
        },
      },
    ]);
  }

  useEffect(() => {
    if (!post) return;
    navigation.setOptions({
      title: "",
      headerShadowVisible: false,
      headerStyle: { backgroundColor: "#ffffff" },
      headerRight: () => (
        <View className="flex-row items-center gap-4 pr-3">
          <Text className="text-xs text-ink-faint">
            {saving ? "Saving…" : dirty ? "Unsaved" : "Saved"}
          </Text>
          <TouchableOpacity
            onPress={handlePublishToggle}
            disabled={saving}
            className={`px-4 py-1.5 rounded-full ${
              post.status === "published" ? "border border-rule" : "bg-ink"
            }`}
          >
            <Text
              className={`text-sm ${
                post.status === "published" ? "text-ink" : "text-paper"
              }`}
            >
              {post.status === "published" ? "Unpublish" : "Publish"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <Text className="text-ink-faint text-sm">Delete</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, post, saving, dirty]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-paper">
        <ActivityIndicator color="#191919" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-paper"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: 32,
          paddingHorizontal: 24,
          paddingBottom: 160,
        }}
        keyboardDismissMode="interactive"
      >
        <View className="max-w-2xl w-full mx-auto">
          <TextInput
            className="text-5xl font-serif text-ink leading-tight py-1"
            value={title}
            onChangeText={handleTitleChange}
            placeholder="Title"
            placeholderTextColor="#C4C4C4"
            multiline
            blurOnSubmit
          />
          <Text className="text-xs font-mono text-ink-faint mt-3 mb-6">
            {post?.slug}
          </Text>

          <View className="flex-row flex-wrap items-center gap-x-4 gap-y-2 mb-10 pb-6 border-b border-rule">
            {(post?.tags ?? []).map((tag) => (
              <TouchableOpacity
                key={tag}
                onPress={() => removeTag(tag)}
                className="flex-row items-center gap-1"
              >
                <Text className="text-ink-muted text-sm">{tag}</Text>
                <Text className="text-ink-faint text-xs">×</Text>
              </TouchableOpacity>
            ))}
            <TextInput
              className="text-sm text-ink"
              placeholder="Add tag…"
              placeholderTextColor="#A8A8A8"
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={addTag}
              blurOnSubmit={false}
              autoCapitalize="none"
            />
          </View>

          <BlockEditor
            siteId={siteId}
            blocks={blocks}
            onChange={handleBlocksChange}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
