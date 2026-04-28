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
              page.status === "published" ? "border border-rule" : "bg-ink"
            }`}
          >
            <Text
              className={`text-sm ${
                page.status === "published" ? "text-ink" : "text-paper"
              }`}
            >
              {page.status === "published" ? "Unpublish" : "Publish"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <Text className="text-ink-faint text-sm">Delete</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, page, saving, dirty]);

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
          <Text className="text-xs font-mono text-ink-faint mt-3 mb-10">
            {page?.slug}
          </Text>

          {page && <VisibilityPanel page={page} onChange={setVisibility} />}

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
  const [open, setOpen] = useState(page.show_in_nav || page.show_in_footer);
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
    <View className="mb-12 border-b border-rule pb-2">
      <TouchableOpacity
        onPress={() => setOpen((o) => !o)}
        className="flex-row items-center justify-between py-2"
      >
        <Text className="text-xs uppercase tracking-wider text-ink-faint">
          Visibility
        </Text>
        <Text className="text-ink-faint text-base">{open ? "−" : "+"}</Text>
      </TouchableOpacity>

      {open && (
        <View>
          <View className="flex-row items-center justify-between py-3">
            <View className="flex-1 pr-4">
              <Text className="text-ink text-sm">Show in main navigation</Text>
              <Text className="text-ink-muted text-xs mt-0.5">
                Adds a link to your site's nav bar.
              </Text>
            </View>
            <Switch
              value={page.show_in_nav}
              onValueChange={(v) => onChange({ show_in_nav: v })}
            />
          </View>
          <View className="flex-row items-center justify-between py-3 border-t border-rule">
            <View className="flex-1 pr-4">
              <Text className="text-ink text-sm">Show in footer</Text>
              <Text className="text-ink-muted text-xs mt-0.5">
                Adds a link to your site's footer.
              </Text>
            </View>
            <Switch
              value={page.show_in_footer}
              onValueChange={(v) => onChange({ show_in_footer: v })}
            />
          </View>
          {showLabel && (
            <View className="border-t border-rule pt-3">
              <Text className="text-xs text-ink-muted mb-1.5 uppercase tracking-wider">
                Link label (optional)
              </Text>
              <TextInput
                className="border-b border-rule pb-2 text-sm text-ink"
                placeholder={page.title}
                placeholderTextColor="#A8A8A8"
                value={labelDraft}
                onChangeText={handleLabelChange}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text className="text-xs text-ink-faint mt-1 mb-2">
                Defaults to the page title.
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
