import { Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Link } from "expo-router";
import { useAuth } from "@/lib/auth";

function NavBar() {
  const { user } = useAuth();
  return (
    <View className="flex-row items-center justify-between px-8 py-5 border-b border-rule">
      <Text className="text-2xl font-serif text-ink tracking-tight">Slate</Text>
      <View className="flex-row items-center gap-6">
        {user ? (
          <Link href="/(dashboard)" asChild>
            <TouchableOpacity className="bg-ink px-5 py-2 rounded-full">
              <Text className="text-paper text-sm">Dashboard</Text>
            </TouchableOpacity>
          </Link>
        ) : (
          <>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-ink text-sm">Sign in</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity className="bg-ink px-5 py-2 rounded-full">
                <Text className="text-paper text-sm">Get started</Text>
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
    <View className="items-center pt-24 pb-20 px-8">
      <Text className="text-5xl font-serif text-ink text-center leading-[1.1] max-w-2xl">
        Edit your site without touching code.
      </Text>
      <Text className="mt-6 text-lg text-ink-muted text-center max-w-lg leading-relaxed">
        One snippet in your header. Then write pages and posts from a clean
        editor on any device.
      </Text>
      <Link href="/(auth)/signup" asChild>
        <TouchableOpacity className="bg-ink px-7 py-3 rounded-full mt-10">
          <Text className="text-paper text-sm">Start writing</Text>
        </TouchableOpacity>
      </Link>
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
      title: "Write in Slate",
      desc: "Compose pages and posts in a quiet block editor. No plugins, no clutter.",
    },
    {
      num: "03",
      title: "Goes live instantly",
      desc: "Your content appears on your site automatically. Share access with your team.",
    },
  ];

  return (
    <View className="py-20 px-8 border-t border-rule">
      <Text className="text-3xl font-serif text-ink text-center mb-12">
        How it works
      </Text>
      <View className="gap-10 max-w-xl mx-auto w-full">
        {steps.map((step) => (
          <View key={step.num} className="flex-row gap-6 items-start">
            <Text className="text-ink-faint text-sm font-mono pt-1 w-8">
              {step.num}
            </Text>
            <View className="flex-1">
              <Text className="text-ink text-lg mb-1">{step.title}</Text>
              <Text className="text-ink-muted leading-relaxed">{step.desc}</Text>
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
      title: "Pages",
      desc: "Create and edit pages with a flexible block editor. Publish or keep as draft.",
    },
    {
      title: "Posts",
      desc: "Write blog posts with tags, author info, and rich content.",
    },
    {
      title: "Services",
      desc: "Connect Stripe and create pages where visitors can buy your services directly.",
    },
    {
      title: "Any website",
      desc: "Works with WordPress, Webflow, custom code, static sites — anything with a <head>.",
    },
  ];

  return (
    <View className="py-20 px-8 border-t border-rule">
      <Text className="text-3xl font-serif text-ink text-center mb-12">
        Everything you need
      </Text>
      <View className="max-w-2xl mx-auto w-full gap-8">
        {features.map((f) => (
          <View
            key={f.title}
            className="border-b border-rule pb-6"
          >
            <Text className="text-ink text-lg mb-1">{f.title}</Text>
            <Text className="text-ink-muted leading-relaxed">{f.desc}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function CtaBanner() {
  return (
    <View className="py-24 px-8 items-center border-t border-rule">
      <Text className="text-3xl font-serif text-ink text-center mb-4 max-w-md">
        Ready to simplify your site?
      </Text>
      <Text className="text-ink-muted text-center mb-8 max-w-sm">
        Get started in minutes. No credit card required.
      </Text>
      <Link href="/(auth)/signup" asChild>
        <TouchableOpacity className="bg-ink px-7 py-3 rounded-full">
          <Text className="text-paper text-sm">Start for free</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

function Footer() {
  return (
    <View className="py-10 px-8 border-t border-rule items-center">
      <Text className="text-ink font-serif text-base mb-2">Slate</Text>
      <Text className="text-ink-faint text-xs">
        © {new Date().getFullYear()} Slate
      </Text>
    </View>
  );
}

export default function LandingPage() {
  if (Platform.OS !== "web") {
    return (
      <View className="flex-1 items-center justify-center bg-paper px-8">
        <Text className="text-5xl font-serif text-ink mb-3">Slate</Text>
        <Text className="text-ink-muted text-center mb-12">
          Manage your website content from anywhere.
        </Text>
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity className="bg-ink py-3 rounded-full w-full items-center mb-3">
            <Text className="text-paper text-sm">Sign in</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/(auth)/signup" asChild>
          <TouchableOpacity className="border border-rule py-3 rounded-full w-full items-center">
            <Text className="text-ink text-sm">Create account</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-paper">
      <NavBar />
      <HeroSection />
      <StepsSection />
      <FeaturesSection />
      <CtaBanner />
      <Footer />
    </ScrollView>
  );
}
