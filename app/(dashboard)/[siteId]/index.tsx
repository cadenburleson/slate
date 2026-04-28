import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { sites } from "@/lib/db";
import type { Site } from "@/lib/db";

function NavRow({
  href,
  title,
  subtitle,
}: {
  href: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Link href={href as any} asChild>
      <TouchableOpacity className="py-5 border-b border-rule active:opacity-60">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-ink text-lg">{title}</Text>
            <Text className="text-ink-muted text-sm mt-1">{subtitle}</Text>
          </View>
          <Text className="text-ink-faint text-base">→</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <Text className="text-xs uppercase tracking-wider text-ink-faint mt-10 mb-2">
      {label}
    </Text>
  );
}

export default function SiteOverviewScreen() {
  const { siteId } = useLocalSearchParams<{ siteId: string }>();
  const [site, setSite] = useState<Site | null>(null);

  useEffect(() => {
    sites.getSite(siteId).then(setSite).catch(console.error);
  }, [siteId]);

  return (
    <ScrollView className="flex-1 bg-paper">
      <View className="px-8 pt-6 pb-12 max-w-2xl mx-auto w-full">
        <Text className="text-3xl font-serif text-ink">{site?.domain}</Text>

        <SectionLabel label="Content" />
        <NavRow
          href={`/(dashboard)/${siteId}/pages`}
          title="Pages"
          subtitle="Create and edit pages"
        />
        <NavRow
          href={`/(dashboard)/${siteId}/posts`}
          title="Posts"
          subtitle="Write and manage posts"
        />

        <SectionLabel label="Setup" />
        <NavRow
          href={`/(dashboard)/${siteId}/snippet`}
          title="Snippet"
          subtitle="Get your install code"
        />
        <NavRow
          href={`/(dashboard)/${siteId}/team`}
          title="Team"
          subtitle="Invite collaborators"
        />
        <NavRow
          href={`/(dashboard)/${siteId}/settings`}
          title="Settings"
          subtitle="Site config and danger zone"
        />
      </View>
    </ScrollView>
  );
}
