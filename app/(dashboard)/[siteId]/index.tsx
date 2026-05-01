import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { sites } from "@/lib/db";
import type { Site } from "@/lib/db";

function NavCard({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Link href={href as any} asChild>
      <TouchableOpacity className="bg-white rounded-xl border border-stone-100 px-5 py-4 mb-3 active:opacity-70">
        <View className="flex-row items-center gap-4">
          <Text className="text-2xl">{icon}</Text>
          <View className="flex-1">
            <Text className="font-semibold text-stone-900">{title}</Text>
            <Text className="text-stone-400 text-sm mt-0.5">{subtitle}</Text>
          </View>
          <Text className="text-stone-300 text-lg">›</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

export default function SiteOverviewScreen() {
  const { siteId } = useLocalSearchParams<{ siteId: string }>();
  const [site, setSite] = useState<Site | null>(null);

  useEffect(() => {
    sites.getSite(siteId).then(setSite).catch(console.error);
  }, [siteId]);

  return (
    <ScrollView className="flex-1 bg-stone-50">
      <View className="px-5 pt-4 pb-2">
        <Text className="text-xs font-mono text-stone-400">{site?.domain}</Text>
      </View>

      <View className="px-5 pb-4">
        <Text className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
          Content
        </Text>
        <NavCard
          href={`/(dashboard)/${siteId}/pages`}
          icon="📄"
          title="Pages"
          subtitle="Create and edit pages"
        />
        <NavCard
          href={`/(dashboard)/${siteId}/posts`}
          icon="✍️"
          title="Blog Posts"
          subtitle="Write and manage posts"
        />

        <Text className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3 mt-4">
          Setup
        </Text>
        <NavCard
          href={`/(dashboard)/${siteId}/snippet`}
          icon="🔌"
          title="Snippet"
          subtitle="Get your install code"
        />
        <NavCard
          href={`/(dashboard)/${siteId}/team`}
          icon="👥"
          title="Team"
          subtitle="Invite collaborators"
        />
        <NavCard
          href={`/(dashboard)/${siteId}/settings`}
          icon="⚙️"
          title="Settings"
          subtitle="Site config and danger zone"
        />
      </View>
    </ScrollView>
  );
}
