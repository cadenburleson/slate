import { ScrollView, Text, TouchableOpacity, View, Clipboard, Platform } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { sites } from "@/lib/db";
import type { Site } from "@/lib/db";

const STALE_AFTER_MS = 5 * 60 * 1000;

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return "just now";
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function SnippetScreen() {
  const { siteId } = useLocalSearchParams<{ siteId: string }>();
  const [site, setSite] = useState<Site | null>(null);
  const [copied, setCopied] = useState(false);
  const justConnectedRef = useRef(false);
  const [justConnected, setJustConnected] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      try {
        const fresh = await sites.getSite(siteId);
        if (cancelled) return;
        if (fresh?.last_seen_at && !justConnectedRef.current) {
          justConnectedRef.current = true;
          setJustConnected(true);
        }
        setSite(fresh);
      } catch (e) {
        console.error(e);
      }
    }
    refresh();
    const id = setInterval(refresh, 4000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [siteId]);

  const scriptHost =
    Platform.OS === "web" && typeof window !== "undefined"
      ? window.location.origin
      : "https://cdn.slate.app";
  const snippet = site
    ? `<script\n  src="${scriptHost}/s.js"\n  data-site-id="${site.snippet_token}"\n  defer\n></script>`
    : "";

  const isConnected =
    !!site?.last_seen_at &&
    Date.now() - new Date(site.last_seen_at).getTime() < STALE_AFTER_MS;

  async function copySnippet() {
    if (Platform.OS === "web") {
      await navigator.clipboard.writeText(snippet);
    } else {
      Clipboard.setString(snippet);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="px-5 py-6 max-w-lg w-full mx-auto">
        <Text className="text-2xl font-bold text-slate-900 mb-2">Install snippet</Text>
        <Text className="text-slate-500 leading-relaxed mb-6">
          Paste this snippet into the{" "}
          <Text className="font-mono text-sm text-slate-700">{"<head>"}</Text>{" "}
          of every page on your site. That's it — Slate handles the rest.
        </Text>

        <ConnectionStatus
          isConnected={isConnected}
          lastSeenAt={site?.last_seen_at ?? null}
          lastSeenReferer={site?.last_seen_referer ?? null}
          domain={site?.domain ?? null}
          justConnected={justConnected}
        />

        <View className="bg-slate-900 rounded-xl p-5 mb-4">
          <Text className="text-green-400 font-mono text-sm leading-relaxed">
            {snippet}
          </Text>
        </View>

        <TouchableOpacity
          className={`py-3 rounded-xl items-center ${copied ? "bg-green-600" : "bg-indigo-600"}`}
          onPress={copySnippet}
        >
          <Text className="text-white font-semibold">
            {copied ? "Copied!" : "Copy snippet"}
          </Text>
        </TouchableOpacity>

        {isConnected ? (
          <NextSteps siteId={siteId} />
        ) : (
          <InstallInstructions />
        )}
      </View>
    </ScrollView>
  );
}

function ConnectionStatus({
  isConnected,
  lastSeenAt,
  lastSeenReferer,
  domain,
  justConnected,
}: {
  isConnected: boolean;
  lastSeenAt: string | null;
  lastSeenReferer: string | null;
  domain: string | null;
  justConnected: boolean;
}) {
  if (isConnected) {
    const refererHost = (() => {
      if (!lastSeenReferer) return null;
      try {
        return new URL(lastSeenReferer).host;
      } catch {
        return lastSeenReferer;
      }
    })();
    const mismatch = refererHost && domain && !refererHost.endsWith(domain);
    return (
      <View className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
        <View className="flex-row items-center gap-2">
          <View className="w-2 h-2 rounded-full bg-green-500" />
          <Text className="text-green-700 font-semibold text-sm">
            {justConnected ? "Connected!" : "Connected"}
          </Text>
          {lastSeenAt && (
            <Text className="text-green-600 text-xs">· last ping {timeAgo(lastSeenAt)}</Text>
          )}
        </View>
        {refererHost && (
          <Text className="text-green-700 text-xs mt-1">From {refererHost}</Text>
        )}
        {mismatch && (
          <Text className="text-amber-700 text-xs mt-1">
            Heads up — the ping came from {refererHost} but this site is registered as {domain}.
          </Text>
        )}
      </View>
    );
  }

  return (
    <View className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
      <View className="flex-row items-center gap-2">
        <View className="w-2 h-2 rounded-full bg-amber-400" />
        <Text className="text-amber-800 font-semibold text-sm">Waiting for first ping…</Text>
      </View>
      <Text className="text-amber-700 text-xs mt-1 leading-relaxed">
        Paste the snippet into your site's {"<head>"} and load any page. We'll detect it within seconds.
      </Text>
    </View>
  );
}

function NextSteps({ siteId }: { siteId: string }) {
  return (
    <View className="mt-8">
      <Text className="font-semibold text-slate-900 mb-1">You're live. What's next?</Text>
      <Text className="text-slate-500 text-sm mb-4 leading-relaxed">
        Now that Slate is installed, you can publish content from this dashboard
        and it'll appear on your site automatically.
      </Text>

      <NextStep
        href={`/(dashboard)/${siteId}/pages/new`}
        icon="📄"
        title="Create your first page"
        desc="Pages map to URLs on your site (e.g. /about). Drafts stay private."
      />
      <NextStep
        href={`/(dashboard)/${siteId}/posts/new`}
        icon="✍️"
        title="Write your first blog post"
        desc="Posts live under your blog index, with tags, author, and meta tags."
      />
      <NextStep
        href={`/(dashboard)/${siteId}/team`}
        icon="👥"
        title="Invite your team"
        desc="Add editors so they can publish without touching code."
      />

      <View className="bg-slate-100 rounded-xl px-4 py-3 mt-4">
        <Text className="text-slate-700 text-xs font-semibold mb-1">How it works</Text>
        <Text className="text-slate-500 text-xs leading-relaxed">
          The snippet checks for matching content on each page load. If the URL
          matches a published page or post, Slate renders it in place — no rebuild,
          no deploy. Drafts never appear on your live site.
        </Text>
      </View>
    </View>
  );
}

function NextStep({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <Link href={href as any} asChild>
      <TouchableOpacity className="bg-white rounded-xl border border-slate-100 px-4 py-3 mb-2 active:opacity-70">
        <View className="flex-row items-center gap-3">
          <Text className="text-xl">{icon}</Text>
          <View className="flex-1">
            <Text className="font-medium text-slate-900 text-sm">{title}</Text>
            <Text className="text-slate-400 text-xs mt-0.5">{desc}</Text>
          </View>
          <Text className="text-slate-300 text-lg">›</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

function InstallInstructions() {
  const items = [
    {
      title: "WordPress",
      desc: 'Appearance → Theme Editor → header.php → paste before </head>',
    },
    {
      title: "Webflow",
      desc: "Project Settings → Custom Code → Head Code → paste snippet",
    },
    {
      title: "Squarespace",
      desc: "Settings → Advanced → Code Injection → Header → paste snippet",
    },
    {
      title: "Any HTML site",
      desc: 'Paste before </head> in your HTML template file',
    },
  ];
  return (
    <View className="mt-8">
      <Text className="font-semibold text-slate-900 mb-4">How to install</Text>
      {items.map((item) => (
        <View key={item.title} className="mb-4">
          <Text className="font-medium text-slate-800 mb-0.5">{item.title}</Text>
          <Text className="text-slate-500 text-sm">{item.desc}</Text>
        </View>
      ))}
    </View>
  );
}
