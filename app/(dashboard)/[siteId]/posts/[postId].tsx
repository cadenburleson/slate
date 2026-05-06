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
import { BlockEditor, WEB_TEXTAREA_RESET, useAutoGrow } from "@/components/BlockEditor";

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

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#44403c" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-stone-50"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      {/* Toolbar */}
      <View className="flex-row items-center px-4 py-2 border-b border-stone-100 gap-2">
        <Text className="text-xs text-stone-400 flex-1">
          {saving ? "Saving..." : dirty ? "Unsaved" : "Saved"}
        </Text>
        <TouchableOpacity
          onPress={handlePublishToggle}
          disabled={saving}
          className={`px-3 py-1.5 rounded-lg ${
            post?.status === "published" ? "bg-stone-100" : "bg-stone-900"
          }`}
        >
          <Text
            className={`text-sm font-medium ${
              post?.status === "published" ? "text-stone-700" : "text-white"
            }`}
          >
            {post?.status === "published" ? "Unpublish" : "Publish"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} className="px-3 py-1.5">
          <Text className="text-red-400 text-sm">Delete</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 128, alignItems: "center" }}
        keyboardDismissMode="interactive"
      >
        {/* Match the reading-column width readers see on host sites. */}
        <View style={{ width: "100%", maxWidth: 720, paddingHorizontal: 20 }}>
          <PostTitleInput value={title} onChange={handleTitleChange} />
          <Text className="text-xs font-mono text-stone-400 mb-4">{post?.slug}</Text>

          {/* Tags */}
          <View className="flex-row flex-wrap gap-1.5 mb-4">
            {(post?.tags ?? []).map((tag) => (
              <TouchableOpacity
                key={tag}
                onPress={() => removeTag(tag)}
                className="flex-row items-center gap-1 bg-stone-200 border border-stone-200 px-2.5 py-1 rounded-full"
              >
                <Text className="text-stone-900 text-xs">{tag}</Text>
                <Text className="text-stone-700 text-xs">✕</Text>
              </TouchableOpacity>
            ))}
            <TextInput
              className="text-xs text-stone-600 px-2.5 py-1 border border-dashed border-stone-300 rounded-full min-w-16"
              placeholder="+ tag"
              placeholderTextColor="#a8a29e"
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={addTag}
              blurOnSubmit={false}
              autoCapitalize="none"
            />
          </View>

          <View className="h-px bg-stone-100 mb-4" />
          <BlockEditor siteId={siteId} blocks={blocks} onChange={handleBlocksChange} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function PostTitleInput({ value, onChange }: { value: string; onChange: (t: string) => void }) {
  const { height, onContentSizeChange } = useAutoGrow(48);
  return (
    <TextInput
      className="text-4xl font-bold text-stone-900 mb-1 py-1 leading-tight"
      style={[{ height }, WEB_TEXTAREA_RESET]}
      value={value}
      onChangeText={onChange}
      onContentSizeChange={onContentSizeChange}
      placeholder="Post title"
      placeholderTextColor="#d6d3d1"
      multiline
      textAlignVertical="top"
      blurOnSubmit
    />
  );
}
