import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { sites } from "@/lib/db";
import type { Site } from "@/lib/db";

export default function SettingsScreen() {
  const { siteId } = useLocalSearchParams<{ siteId: string }>();
  const router = useRouter();
  const [site, setSite] = useState<Site | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    sites.getSite(siteId).then(setSite).catch(console.error);
  }, [siteId]);

  async function handleDelete() {
    Alert.alert(
      "Delete site",
      `This will permanently delete ${site?.domain} and all its pages and posts. This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete site",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await sites.deleteSite(siteId);
              router.replace("/(dashboard)");
            } catch (e: any) {
              Alert.alert("Error", e.message);
              setDeleting(false);
            }
          },
        },
      ]
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="px-5 pt-6 pb-8 max-w-lg w-full mx-auto">
        <View className="bg-white rounded-xl border border-slate-100 px-5 py-4 mb-4">
          <Text className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Site info
          </Text>
          <View className="flex-row justify-between py-2 border-b border-slate-50">
            <Text className="text-slate-600 text-sm">Domain</Text>
            <Text className="text-slate-900 text-sm font-mono">{site?.domain}</Text>
          </View>
          <View className="flex-row justify-between py-2 border-b border-slate-50">
            <Text className="text-slate-600 text-sm">Platform</Text>
            <Text className="text-slate-900 text-sm capitalize">
              {site?.detected_platform ?? "Unknown"}
            </Text>
          </View>
          <View className="flex-row justify-between py-2">
            <Text className="text-slate-600 text-sm">Site ID</Text>
            <Text className="text-slate-900 text-xs font-mono">{site?.snippet_token}</Text>
          </View>
        </View>

        {site && <NavOverridePanel site={site} onChange={setSite} />}

        <View className="bg-white rounded-xl border border-slate-100 px-5 py-4 mb-4">
          <Text className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Stripe (coming soon)
          </Text>
          <Text className="text-slate-500 text-sm leading-relaxed">
            Connect your Stripe account to create service pages where visitors can purchase
            directly on your site.
          </Text>
          <TouchableOpacity
            disabled
            className="mt-4 border border-slate-200 rounded-xl py-3 items-center opacity-50"
          >
            <Text className="text-slate-500 font-medium text-sm">Connect Stripe</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-xl border border-red-100 px-5 py-4">
          <Text className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">
            Danger zone
          </Text>
          <Text className="text-slate-500 text-sm mb-4 leading-relaxed">
            Permanently delete this site and all of its content. This action cannot be undone.
          </Text>
          <TouchableOpacity
            onPress={handleDelete}
            disabled={deleting}
            className="bg-red-600 rounded-xl py-3 items-center"
          >
            {deleting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold">Delete this site</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function NavOverridePanel({
  site,
  onChange,
}: {
  site: Site;
  onChange: (s: Site) => void;
}) {
  const [open, setOpen] = useState(
    !!site.nav_selector || !!site.footer_selector
  );
  const [navSelector, setNavSelector] = useState(site.nav_selector ?? "");
  const [footerSelector, setFooterSelector] = useState(
    site.footer_selector ?? ""
  );
  const [saving, setSaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function queueSave(updates: { nav_selector?: string | null; footer_selector?: string | null }) {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSaving(true);
      try {
        const updated = await sites.updateSite(site.id, updates);
        onChange(updated);
      } catch (e: any) {
        Alert.alert("Error", e.message);
      } finally {
        setSaving(false);
      }
    }, 800);
  }

  function handleNav(t: string) {
    setNavSelector(t);
    queueSave({ nav_selector: t.trim() === "" ? null : t.trim() });
  }

  function handleFooter(t: string) {
    setFooterSelector(t);
    queueSave({ footer_selector: t.trim() === "" ? null : t.trim() });
  }

  return (
    <View className="bg-white rounded-xl border border-slate-100 px-5 py-4 mb-4">
      <TouchableOpacity
        onPress={() => setOpen((o) => !o)}
        className="flex-row items-center justify-between"
      >
        <View className="flex-1">
          <Text className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Nav & footer (advanced)
          </Text>
          <Text className="text-slate-500 text-xs mt-1 leading-relaxed">
            By default Slate auto-detects {"<nav>"} and {"<footer>"}. Override
            here only if your site uses custom markup.
          </Text>
        </View>
        <Text className="text-slate-400 text-lg ml-2">{open ? "−" : "+"}</Text>
      </TouchableOpacity>

      {open && (
        <View className="mt-4">
          <Text className="text-xs font-medium text-slate-700 mb-1">
            Nav CSS selector
          </Text>
          <TextInput
            className="border border-slate-200 rounded-lg px-3 py-2 mb-1 text-sm text-slate-900 bg-slate-50 font-mono"
            placeholder="header .menu, #site-nav"
            placeholderTextColor="#94a3b8"
            value={navSelector}
            onChangeText={handleNav}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text className="text-xs text-slate-400 mb-3">
            Leave blank to auto-detect.
          </Text>

          <Text className="text-xs font-medium text-slate-700 mb-1">
            Footer CSS selector
          </Text>
          <TextInput
            className="border border-slate-200 rounded-lg px-3 py-2 mb-1 text-sm text-slate-900 bg-slate-50 font-mono"
            placeholder="footer.site-footer"
            placeholderTextColor="#94a3b8"
            value={footerSelector}
            onChangeText={handleFooter}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {saving && (
            <Text className="text-xs text-slate-400 mt-1">Saving…</Text>
          )}
        </View>
      )}
    </View>
  );
}
