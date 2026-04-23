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
import { pages } from "@/lib/db";
import type { Block, Page } from "@/lib/db";
import { BlockEditor } from "@/components/BlockEditor";

export default function PageEditorScreen() {
  const { siteId, pageId } = useLocalSearchParams<{
    siteId: string;
    pageId: string;
  }>();
  const navigation = useNavigation();
  const [page, setPage] = useState<Page | null>(null);
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    pages
      .getPage(pageId)
      .then((p) => {
        if (!p) return;
        setPage(p);
        setTitle(p.title);
        setBlocks(p.content_json ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [pageId]);

  const autosave = useCallback(
    (nextTitle: string, nextBlocks: Block[]) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      setDirty(true);
      saveTimer.current = setTimeout(async () => {
        setSaving(true);
        try {
          await pages.updatePage(pageId, {
            title: nextTitle,
            content_json: nextBlocks,
          });
          setDirty(false);
        } catch (e) {
          console.error(e);
        } finally {
          setSaving(false);
        }
      }, 1500);
    },
    [pageId]
  );

  function handleTitleChange(t: string) {
    setTitle(t);
    autosave(t, blocks);
  }

  function handleBlocksChange(b: Block[]) {
    setBlocks(b);
    autosave(title, b);
  }

  async function handlePublishToggle() {
    if (!page) return;
    setSaving(true);
    try {
      const updated =
        page.status === "published"
          ? await pages.unpublishPage(pageId)
          : await pages.publishPage(pageId);
      setPage(updated);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    Alert.alert("Delete page", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await pages.deletePage(pageId);
          navigation.goBack();
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#6366f1" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      {/* Toolbar */}
      <View className="flex-row items-center px-4 py-2 border-b border-slate-100 gap-2">
        <Text className="text-xs text-slate-400 flex-1">
          {saving ? "Saving..." : dirty ? "Unsaved" : "Saved"}
        </Text>
        <TouchableOpacity
          onPress={handlePublishToggle}
          disabled={saving}
          className={`px-3 py-1.5 rounded-lg ${
            page?.status === "published" ? "bg-slate-100" : "bg-indigo-600"
          }`}
        >
          <Text
            className={`text-sm font-medium ${
              page?.status === "published" ? "text-slate-700" : "text-white"
            }`}
          >
            {page?.status === "published" ? "Unpublish" : "Publish"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} className="px-3 py-1.5">
          <Text className="text-red-400 text-sm">Delete</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pt-4 pb-32"
        keyboardDismissMode="interactive"
      >
        <TextInput
          className="text-3xl font-bold text-slate-900 mb-1 py-1"
          value={title}
          onChangeText={handleTitleChange}
          placeholder="Page title"
          placeholderTextColor="#cbd5e1"
          multiline
          blurOnSubmit
        />
        <Text className="text-xs font-mono text-slate-400 mb-6">{page?.slug}</Text>

        <BlockEditor blocks={blocks} onChange={handleBlocksChange} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
