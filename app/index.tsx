import { Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Link } from "expo-router";
import Head from "expo-router/head";
import Logo from "@/components/Logo";
import { useAuth } from "@/lib/auth";

function NavBar() {
  const { user } = useAuth();
  return (
    <View className="flex-row items-center justify-between px-6 py-4 border-b border-stone-200">
      <View className="flex-row items-center gap-2">
        <Logo width={40} height={40} />
        <Text className="text-2xl font-bold text-stone-900 tracking-tight">Headless</Text>
      </View>
      <View className="flex-row items-center gap-3">
        {user ? (
          <Link href="/(dashboard)" asChild>
            <TouchableOpacity className="bg-stone-900 px-4 py-2 rounded-lg">
              <Text className="text-white text-sm font-medium">Dashboard</Text>
            </TouchableOpacity>
          </Link>
        ) : (
          <>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity className="px-4 py-2">
                <Text className="text-stone-600 text-sm font-medium">Log in</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity className="bg-stone-900 px-4 py-2 rounded-lg">
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
      <View className="mb-6">
        <Logo width={120} height={120} />
      </View>
      <View className="bg-stone-200 px-3 py-1 rounded-full mb-6">
        <Text className="text-stone-900 text-xs font-semibold uppercase tracking-wider">
          Headless CMS for any website
        </Text>
      </View>
      <Text
        role="heading"
        aria-level={1}
        className="text-4xl font-bold text-stone-900 text-center leading-tight max-w-lg"
      >
        Edit your site without touching code
      </Text>
      <Text className="mt-4 text-lg text-stone-500 text-center max-w-md leading-relaxed">
        Add one snippet to your site's header. Then manage pages, blog posts,
        and service pages from a clean app — on any device.
      </Text>
      <View className="flex-row gap-3 mt-8">
        <Link href="/(auth)/signup" asChild>
          <TouchableOpacity className="bg-stone-900 px-6 py-3 rounded-xl">
            <Text className="text-white font-semibold">Start for free</Text>
          </TouchableOpacity>
        </Link>
      </View>
      <View className="mt-10 bg-stone-900 rounded-xl px-5 py-4 max-w-sm w-full">
        <Text className="text-stone-400 text-xs font-mono mb-1">Add to your site's {"<head>"}</Text>
        <Text className="text-green-400 text-xs font-mono leading-relaxed">
          {"<script"}{"\n"}
          {"  src=\"https://cdn.headless.app/s.js\""}{"\n"}
          {"  data-site-id=\"your-id\" defer"}{"\n"}
          {"></script>"}{"\n"}
          {"<script>/* fast-cache shim */</script>"}
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
      title: "Edit in Headless",
      desc: "Create pages and posts in our clean block editor. No plugins, no complexity.",
    },
    {
      num: "03",
      title: "Goes live instantly",
      desc: "Your content appears on your site automatically. Share access with your team or clients.",
    },
  ];

  return (
    <View className="py-16 px-6 bg-stone-200">
      <Text
        role="heading"
        aria-level={2}
        className="text-2xl font-bold text-stone-900 text-center mb-10"
      >
        How it works
      </Text>
      <View className="gap-6 max-w-lg mx-auto w-full">
        {steps.map((step) => (
          <View key={step.num} className="flex-row gap-4 items-start">
            <View className="w-10 h-10 rounded-full bg-stone-900 items-center justify-center shrink-0">
              <Text className="text-stone-50 text-xs font-bold">{step.num}</Text>
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-stone-900 mb-1">{step.title}</Text>
              <Text className="text-stone-500 text-sm leading-relaxed">{step.desc}</Text>
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
      <Text
        role="heading"
        aria-level={2}
        className="text-2xl font-bold text-stone-900 text-center mb-10"
      >
        Everything you need
      </Text>
      <View className="flex-row flex-wrap gap-4 justify-center max-w-xl mx-auto">
        {features.map((f) => (
          <View
            key={f.title}
            className="bg-white border border-stone-100 rounded-xl p-5 w-full"
            style={{ maxWidth: 280 }}
          >
            <Text className="text-2xl mb-3">{f.icon}</Text>
            <Text className="font-semibold text-stone-900 mb-1">{f.title}</Text>
            <Text className="text-stone-500 text-sm leading-relaxed">{f.desc}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function CtaBanner() {
  return (
    <View className="bg-stone-900 py-16 px-6 items-center">
      <Text
        role="heading"
        aria-level={2}
        className="text-3xl font-bold text-white text-center mb-3"
      >
        Ready to simplify your site?
      </Text>
      <Text className="text-stone-300 text-center mb-8 max-w-sm">
        Get started in minutes. No credit card required.
      </Text>
      <Link href="/(auth)/signup" asChild>
        <TouchableOpacity className="bg-white px-8 py-3 rounded-xl">
          <Text className="text-stone-900 font-bold">Start for free</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

function Footer() {
  return (
    <View className="bg-stone-200 py-12 px-6 items-center">
      <View className="flex-row items-center gap-3 mb-3">
        <Logo width={64} height={64} />
        <Text className="text-3xl text-stone-900 font-bold">Headless</Text>
      </View>
      <Text className="text-stone-500 text-sm">
        © {new Date().getFullYear()} Headless. Built for the web.
      </Text>
    </View>
  );
}

export default function LandingPage() {
  if (Platform.OS !== "web") {
    return (
      <NativeFallback />
    );
  }

  return (
    <>
      <Head>
        <title>Headless — A CMS that drops into any site via one script tag</title>
        <meta
          name="description"
          content="Edit pages, blog posts, and service pages on any website without touching code. Add one snippet to your site's head and manage everything from a clean app — on any device."
        />
        <meta property="og:title" content="Headless — A CMS that drops into any site" />
        <meta property="og:description" content="Edit any site without touching code. One snippet, any platform." />
      </Head>
      <ScrollView className="flex-1 bg-stone-50">
        <NavBar />
        <HeroSection />
        <StepsSection />
        <FeaturesSection />
        <CtaBanner />
        <Footer />
      </ScrollView>
    </>
  );
}

function NativeFallback() {
  return (
    <View className="flex-1 items-center justify-center bg-stone-50 px-6">
      <View className="mb-3">
        <Logo width={96} height={96} />
      </View>
      <Text className="text-4xl font-bold text-stone-900 mb-2">Headless</Text>
      <Text className="text-stone-500 text-center mb-8">
        Manage your website content from anywhere.
      </Text>
      <Link href="/(auth)/login" asChild>
        <TouchableOpacity className="bg-stone-900 px-6 py-3 rounded-xl w-full items-center mb-3">
          <Text className="text-white font-semibold">Log in</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/(auth)/signup" asChild>
        <TouchableOpacity className="border border-stone-200 px-6 py-3 rounded-xl w-full items-center">
          <Text className="text-stone-700 font-semibold">Create account</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
