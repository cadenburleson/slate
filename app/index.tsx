import { Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Link } from "expo-router";
import { useAuth } from "@/lib/auth";

function NavBar() {
  const { user } = useAuth();
  return (
    <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-100">
      <Text className="text-xl font-bold text-slate-900 tracking-tight">slate</Text>
      <View className="flex-row items-center gap-3">
        {user ? (
          <Link href="/(dashboard)" asChild>
            <TouchableOpacity className="bg-slate-900 px-4 py-2 rounded-lg">
              <Text className="text-white text-sm font-medium">Dashboard</Text>
            </TouchableOpacity>
          </Link>
        ) : (
          <>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity className="px-4 py-2">
                <Text className="text-slate-600 text-sm font-medium">Log in</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity className="bg-slate-900 px-4 py-2 rounded-lg">
                <Text className="text-white text-sm font-medium">Get started</Text>
              </TouchableOpacity>
            </Link>
          </>
        )}
      </View>
    </View>
  );
}

function HeroSection() {
  return (
    <View className="items-center py-20 px-6">
      <View className="bg-indigo-50 px-3 py-1 rounded-full mb-6">
        <Text className="text-indigo-600 text-xs font-semibold uppercase tracking-wider">
          Headless CMS for any website
        </Text>
      </View>
      <Text className="text-4xl font-bold text-slate-900 text-center leading-tight max-w-lg">
        Edit your site without touching code
      </Text>
      <Text className="mt-4 text-lg text-slate-500 text-center max-w-md leading-relaxed">
        Add one snippet to your site's header. Then manage pages, blog posts,
        and service pages from a clean app — on any device.
      </Text>
      <View className="flex-row gap-3 mt-8">
        <Link href="/(auth)/signup" asChild>
          <TouchableOpacity className="bg-indigo-600 px-6 py-3 rounded-xl">
            <Text className="text-white font-semibold">Start for free</Text>
          </TouchableOpacity>
        </Link>
      </View>
      <View className="mt-10 bg-slate-900 rounded-xl px-5 py-4 max-w-sm w-full">
        <Text className="text-slate-400 text-xs font-mono mb-1">Add to your site's {"<head>"}</Text>
        <Text className="text-green-400 text-xs font-mono leading-relaxed">
          {"<script"}{"\n"}
          {"  src=\"https://cdn.slate.app/s.js\""}
          {"\n"}
          {"  data-site-id=\"your-id\""}
          {"\n"}
          {"</script>"}
        </Text>
      </View>
    </View>
  );
}

function StepsSection() {
  const steps = [
    {
      num: "01",
      title: "Add the snippet",
      desc: "Paste one script tag into your site's <head>. Works with any framework or website builder.",
    },
    {
      num: "02",
      title: "Edit in Slate",
      desc: "Create pages and posts in our clean block editor. No plugins, no complexity.",
    },
    {
      num: "03",
      title: "Goes live instantly",
      desc: "Your content appears on your site automatically. Share access with your team or clients.",
    },
  ];

  return (
    <View className="py-16 px-6 bg-slate-50">
      <Text className="text-2xl font-bold text-slate-900 text-center mb-10">
        How it works
      </Text>
      <View className="gap-6 max-w-lg mx-auto w-full">
        {steps.map((step) => (
          <View key={step.num} className="flex-row gap-4 items-start">
            <View className="w-10 h-10 rounded-full bg-indigo-100 items-center justify-center shrink-0">
              <Text className="text-indigo-600 text-xs font-bold">{step.num}</Text>
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-slate-900 mb-1">{step.title}</Text>
              <Text className="text-slate-500 text-sm leading-relaxed">{step.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: "📄",
      title: "Pages",
      desc: "Create and edit pages with a flexible block editor. Publish or keep as draft.",
    },
    {
      icon: "✍️",
      title: "Blog posts",
      desc: "Write and manage blog posts with tags, author info, and rich content.",
    },
    {
      icon: "💳",
      title: "Service pages",
      desc: "Connect Stripe and create pages where visitors can buy your services directly.",
    },
    {
      icon: "🌐",
      title: "Any website",
      desc: "Works with WordPress, Webflow, custom code, static sites — anything with a <head>.",
    },
  ];

  return (
    <View className="py-16 px-6">
      <Text className="text-2xl font-bold text-slate-900 text-center mb-10">
        Everything you need
      </Text>
      <View className="flex-row flex-wrap gap-4 justify-center max-w-xl mx-auto">
        {features.map((f) => (
          <View
            key={f.title}
            className="bg-white border border-slate-100 rounded-xl p-5 w-full"
            style={{ maxWidth: 280 }}
          >
            <Text className="text-2xl mb-3">{f.icon}</Text>
            <Text className="font-semibold text-slate-900 mb-1">{f.title}</Text>
            <Text className="text-slate-500 text-sm leading-relaxed">{f.desc}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function CtaBanner() {
  return (
    <View className="bg-indigo-600 py-16 px-6 items-center">
      <Text className="text-3xl font-bold text-white text-center mb-3">
        Ready to simplify your site?
      </Text>
      <Text className="text-indigo-200 text-center mb-8 max-w-sm">
        Get started in minutes. No credit card required.
      </Text>
      <Link href="/(auth)/signup" asChild>
        <TouchableOpacity className="bg-white px-8 py-3 rounded-xl">
          <Text className="text-indigo-600 font-bold">Start for free</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

function Footer() {
  return (
    <View className="py-8 px-6 border-t border-slate-100 items-center">
      <Text className="text-slate-900 font-bold mb-2">slate</Text>
      <Text className="text-slate-400 text-xs">
        © {new Date().getFullYear()} Slate. Built for the web.
      </Text>
    </View>
  );
}

export default function LandingPage() {
  if (Platform.OS !== "web") {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-4xl font-bold text-slate-900 mb-2">slate</Text>
        <Text className="text-slate-500 text-center mb-8">
          Manage your website content from anywhere.
        </Text>
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity className="bg-indigo-600 px-6 py-3 rounded-xl w-full items-center mb-3">
            <Text className="text-white font-semibold">Log in</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/(auth)/signup" asChild>
          <TouchableOpacity className="border border-slate-200 px-6 py-3 rounded-xl w-full items-center">
            <Text className="text-slate-700 font-semibold">Create account</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <NavBar />
      <HeroSection />
      <StepsSection />
      <FeaturesSection />
      <CtaBanner />
      <Footer />
    </ScrollView>
  );
}
