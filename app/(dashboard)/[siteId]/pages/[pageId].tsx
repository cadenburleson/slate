import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useHeaderHeight } from "@react-navigation/elements";
import { useCallback, useEffect, useRef, useState } from "react";
import { pages } from "@/lib/db";
import type { Block, Page } from "@/lib/db";
import { BlockEditor } from "@/components/BlockEditor";
import { confirm } from "@/lib/confirm";

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
    if (page.status === "published") {
      const ok = await confirm({
        title: "Unpublish page?",
        message: "Are you sure? Visitors will no longer see this page.",
        confirmLabel: "Unpublish",
      });
      if (!ok) return;
    }
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

  async function setVisibility(updates: {
    show_in_nav?: boolean;
    show_in_footer?: boolean;
    nav_label?: string | null;
  }) {
    if (!page) return;
    setSaving(true);
    try {
      const updated = await pages.updatePage(pageId, updates);
      setPage(updated);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const ok = await confirm({
      title: "Delete page?",
      message: "Are you sure? This cannot be undone.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    try {
      await pages.deletePage(pageId);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  }

  useEffect(() => {
    if (!page) return;
    navigation.setOptions({
      title: page.title || "Edit Page",
      headerTransparent: true,
      headerShadowVisible: false,
      headerBackground: () => <GlassHeaderBackground />,
      headerRight: () => (
        <View className="flex-row items-center gap-2 pr-2">
          <Text className="text-xs text-slate-400 mr-1">
            {saving ? "Saving…" : dirty ? "Unsaved" : "Saved"}
          </Text>
          <TouchableOpacity
            onPress={handlePublishToggle}
            disabled={saving}
            className={`px-3 py-1.5 rounded-lg ${
              page.status === "published" ? "bg-slate-100" : "bg-indigo-600"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                page.status === "published" ? "text-slate-700" : "text-white"
              }`}
            >
              {page.status === "published" ? "Unpublish" : "Publish"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} className="px-2 py-1.5">
            <Text className="text-red-400 text-sm">Delete</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, page, saving, dirty]);

  const headerHeight = useHeaderHeight();

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
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: headerHeight + 16, paddingHorizontal: 20, paddingBottom: 128 }}
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
        <Text className="text-xs font-mono text-slate-400 mb-4">{page?.slug}</Text>

        {page && (
          <VisibilityPanel
            page={page}
            onChange={setVisibility}
          />
        )}

        <BlockEditor blocks={blocks} onChange={handleBlocksChange} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function GlassHeaderBackground() {
  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: "rgba(255,255,255,0.72)",
          borderBottomWidth: Platform.OS === "web" ? 0 : 1,
          borderBottomColor: "rgba(15,23,42,0.06)",
        },
        Platform.OS === "web"
          ? ({
              backdropFilter: "saturate(180%) blur(20px)",
              WebkitBackdropFilter: "saturate(180%) blur(20px)",
              boxShadow: "0 4px 16px rgba(15, 23, 42, 0.06)",
            } as any)
          : null,
      ]}
    />
  );
}

function VisibilityPanel({
  page,
  onChange,
}: {
  page: Page;
  onChange: (updates: {
    show_in_nav?: boolean;
    show_in_footer?: boolean;
    nav_label?: string | null;
  }) => void;
}) {
  const [labelDraft, setLabelDraft] = useState(page.nav_label ?? "");
  const showLabel = page.show_in_nav || page.show_in_footer;
  const labelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLabelDraft(page.nav_label ?? "");
  }, [page.nav_label]);

  function handleLabelChange(t: string) {
    setLabelDraft(t);
    if (labelTimer.current) clearTimeout(labelTimer.current);
    labelTimer.current = setTimeout(() => {
      onChange({ nav_label: t.trim() === "" ? null : t.trim() });
    }, 800);
  }

  return (
    <View className="bg-slate-50 rounded-xl border border-slate-100 px-4 py-3 mb-6">
      <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        Show this page in
      </Text>
      <View className="flex-row items-center justify-between py-2">
        <View className="flex-1">
          <Text className="text-sm font-medium text-slate-800">Main navigation</Text>
          <Text className="text-xs text-slate-400">Adds a link to your site's nav bar.</Text>
        </View>
        <Switch
          value={page.show_in_nav}
          onValueChange={(v) => onChange({ show_in_nav: v })}
        />
      </View>
      <View className="flex-row items-center justify-between py-2 border-t border-slate-100">
        <View className="flex-1">
          <Text className="text-sm font-medium text-slate-800">Footer</Text>
          <Text className="text-xs text-slate-400">Adds a link to your site's footer.</Text>
        </View>
        <Switch
          value={page.show_in_footer}
          onValueChange={(v) => onChange({ show_in_footer: v })}
        />
      </View>
      {showLabel && (
        <View className="border-t border-slate-100 pt-3 mt-1">
          <Text className="text-xs font-medium text-slate-700 mb-1">Link label (optional)</Text>
          <TextInput
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white"
            placeholder={page.title}
            placeholderTextColor="#94a3b8"
            value={labelDraft}
            onChangeText={handleLabelChange}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text className="text-xs text-slate-400 mt-1">
            Defaults to the page title. Use a shorter label if your nav is tight.
          </Text>
        </View>
      )}
    </View>
  );
}
