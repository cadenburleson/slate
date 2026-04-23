import { ScrollView, Text, TouchableOpacity, View, Clipboard, Platform } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { sites } from "@/lib/db";
import type { Site } from "@/lib/db";

export default function SnippetScreen() {
  const { siteId } = useLocalSearchParams<{ siteId: string }>();
  const [site, setSite] = useState<Site | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    sites.getSite(siteId).then(setSite).catch(console.error);
  }, [siteId]);

  const snippet = site
    ? `<script\n  src="https://cdn.slate.app/s.js"\n  data-site-id="${site.snippet_token}"\n  defer\n></script>`
    : "";

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

        <View className="mt-8">
          <Text className="font-semibold text-slate-900 mb-4">How to install</Text>

          {[
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
          ].map((item) => (
            <View key={item.title} className="mb-4">
              <Text className="font-medium text-slate-800 mb-0.5">{item.title}</Text>
              <Text className="text-slate-500 text-sm">{item.desc}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
