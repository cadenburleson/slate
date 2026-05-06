import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useHeaderHeight } from "@react-navigation/elements";
import { useCallback, useEffect, useRef, useState } from "react";
import { BlurView } from "expo-blur";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { pages } from "@/lib/db";
import type { Block, Page } from "@/lib/db";
import { BlockEditor, WEB_TEXTAREA_RESET, useAutoGrow } from "@/components/BlockEditor";
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
          <Text className="text-xs text-stone-400 mr-1">
            {saving ? "Saving…" : dirty ? "Unsaved" : "Saved"}
          </Text>
          <TouchableOpacity
            onPress={handlePublishToggle}
            disabled={saving}
            className={`px-3 py-1.5 rounded-lg ${
              page.status === "published" ? "bg-stone-100" : "bg-stone-900"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                page.status === "published" ? "text-stone-700" : "text-white"
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
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: headerHeight + 16, paddingBottom: 128, alignItems: "center" }}
        keyboardDismissMode="interactive"
      >
        {/* Constrain to a typical reading column so the editor preview
            matches the proportions readers actually see on host sites. */}
        <View style={{ width: "100%", maxWidth: 720, paddingHorizontal: 20 }}>
          <TitleInput value={title} onChange={handleTitleChange} />
          <Text className="text-xs font-mono text-stone-400 mb-4">{page?.slug}</Text>

          {page && (
            <VisibilityPanel
              page={page}
              onChange={setVisibility}
            />
          )}

          <BlockEditor siteId={siteId} blocks={blocks} onChange={handleBlocksChange} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function TitleInput({ value, onChange }: { value: string; onChange: (t: string) => void }) {
  const { height, onContentSizeChange } = useAutoGrow(48);
  return (
    <TextInput
      className="text-4xl font-bold text-stone-900 mb-1 py-1 leading-tight"
      style={[{ height }, WEB_TEXTAREA_RESET]}
      value={value}
      onChangeText={onChange}
      onContentSizeChange={onContentSizeChange}
      placeholder="Page title"
      placeholderTextColor="#d6d3d1"
      multiline
      textAlignVertical="top"
      blurOnSubmit
    />
  );
}

function GlassHeaderBackground() {
  const shadowStyle =
    Platform.OS === "web"
      ? ({ boxShadow: "0 4px 16px rgba(15, 23, 42, 0.08)" } as any)
      : {
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
        };

  if (isLiquidGlassAvailable()) {
    return (
      <GlassView
        glassEffectStyle="regular"
        style={[StyleSheet.absoluteFill, shadowStyle]}
      />
    );
  }

  return (
    <BlurView
      intensity={60}
      tint="light"
      experimentalBlurMethod="dimezisBlurView"
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: "rgba(255,255,255,0.55)" },
        shadowStyle,
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
    <View className="bg-stone-50 rounded-xl border border-stone-100 px-4 py-3 mb-6">
      <Text className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
        Show this page in
      </Text>
      <View className="flex-row items-center justify-between py-2">
        <View className="flex-1">
          <Text className="text-sm font-medium text-stone-800">Main navigation</Text>
          <Text className="text-xs text-stone-400">Adds a link to your site's nav bar.</Text>
        </View>
        <Switch
          value={page.show_in_nav}
          onValueChange={(v) => onChange({ show_in_nav: v })}
        />
      </View>
      <View className="flex-row items-center justify-between py-2 border-t border-stone-100">
        <View className="flex-1">
          <Text className="text-sm font-medium text-stone-800">Footer</Text>
          <Text className="text-xs text-stone-400">Adds a link to your site's footer.</Text>
        </View>
        <Switch
          value={page.show_in_footer}
          onValueChange={(v) => onChange({ show_in_footer: v })}
        />
      </View>
      {showLabel && (
        <View className="border-t border-stone-100 pt-3 mt-1">
          <Text className="text-xs font-medium text-stone-700 mb-1">Link label (optional)</Text>
          <TextInput
            className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 bg-white"
            placeholder={page.title}
            placeholderTextColor="#a8a29e"
            value={labelDraft}
            onChangeText={handleLabelChange}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text className="text-xs text-stone-400 mt-1">
            Defaults to the page title. Use a shorter label if your nav is tight.
          </Text>
        </View>
      )}
    </View>
  );
}
