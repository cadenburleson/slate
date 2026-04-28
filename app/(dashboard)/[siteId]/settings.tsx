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
    <ScrollView className="flex-1 bg-paper">
      <View className="px-8 pt-8 pb-12 max-w-xl w-full mx-auto">
        <Text className="text-xs uppercase tracking-wider text-ink-faint mb-3">
          Site info
        </Text>
        <View className="flex-row justify-between py-3 border-b border-rule">
          <Text className="text-ink-muted text-sm">Domain</Text>
          <Text className="text-ink text-sm font-mono">{site?.domain}</Text>
        </View>
        <View className="flex-row justify-between py-3 border-b border-rule">
          <Text className="text-ink-muted text-sm">Platform</Text>
          <Text className="text-ink text-sm capitalize">
            {site?.detected_platform ?? "Unknown"}
          </Text>
        </View>
        <View className="flex-row justify-between py-3 border-b border-rule">
          <Text className="text-ink-muted text-sm">Site ID</Text>
          <Text className="text-ink text-xs font-mono">{site?.snippet_token}</Text>
        </View>

        {site && <NavOverridePanel site={site} onChange={setSite} />}

        <Text className="text-xs uppercase tracking-wider text-ink-faint mt-12 mb-3">
          Stripe (coming soon)
        </Text>
        <Text className="text-ink-muted text-sm leading-relaxed">
          Connect your Stripe account to create service pages where visitors can purchase
          directly on your site.
        </Text>
        <TouchableOpacity
          disabled
          className="mt-4 border border-rule rounded-full py-3 items-center opacity-50"
        >
          <Text className="text-ink-muted text-sm">Connect Stripe</Text>
        </TouchableOpacity>

        <Text className="text-xs uppercase tracking-wider text-red-500 mt-12 mb-3">
          Danger zone
        </Text>
        <Text className="text-ink-muted text-sm mb-4 leading-relaxed">
          Permanently delete this site and all of its content. This action cannot be undone.
        </Text>
        <TouchableOpacity
          onPress={handleDelete}
          disabled={deleting}
          className="border border-red-500 rounded-full py-3 items-center"
        >
          {deleting ? (
            <ActivityIndicator color="#dc2626" />
          ) : (
            <Text className="text-red-600 text-sm">Delete this site</Text>
          )}
        </TouchableOpacity>
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
    <View className="mt-12">
      <TouchableOpacity
        onPress={() => setOpen((o) => !o)}
        className="flex-row items-start justify-between py-3 border-b border-rule"
      >
        <View className="flex-1 pr-3">
          <Text className="text-xs uppercase tracking-wider text-ink-faint">
            Nav & footer (advanced)
          </Text>
          <Text className="text-ink-muted text-xs mt-1 leading-relaxed">
            By default Slate auto-detects {"<nav>"} and {"<footer>"}. Override
            here only if your site uses custom markup.
          </Text>
        </View>
        <Text className="text-ink-faint text-base">{open ? "−" : "+"}</Text>
      </TouchableOpacity>

      {open && (
        <View className="mt-5">
          <Text className="text-xs text-ink-muted mb-1.5 uppercase tracking-wider">
            Nav CSS selector
          </Text>
          <TextInput
            className="border-b border-rule pb-2 mb-1 text-sm text-ink font-mono"
            placeholder="header .menu, #site-nav"
            placeholderTextColor="#A8A8A8"
            value={navSelector}
            onChangeText={handleNav}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text className="text-xs text-ink-faint mb-5">
            Leave blank to auto-detect.
          </Text>

          <Text className="text-xs text-ink-muted mb-1.5 uppercase tracking-wider">
            Footer CSS selector
          </Text>
          <TextInput
            className="border-b border-rule pb-2 mb-1 text-sm text-ink font-mono"
            placeholder="footer.site-footer"
            placeholderTextColor="#A8A8A8"
            value={footerSelector}
            onChangeText={handleFooter}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {saving && (
            <Text className="text-xs text-ink-faint mt-1">Saving…</Text>
          )}
        </View>
      )}
    </View>
  );
}
