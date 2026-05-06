// Expo Router HTML shell override (web only — ignored by native builds).
// Adds favicon, theme color, manifest, OpenGraph defaults, and preloads the
// hero logo so Lighthouse has an LCP candidate before JS hydration.
import { ScrollViewStyleReset } from "expo-router/html";

// Bump the ?v= when icon files change so existing browsers/edge caches
// fetch fresh — the underlying URLs are immutable from a CDN-config POV
// only after this version tag is bumped.
const ICON_VERSION = "3";
const FAVICON_PNG = `/assets/favicon.png?v=${ICON_VERSION}`;
const FAVICON_SVG = `/assets/favicon.svg?v=${ICON_VERSION}`;
const APPLE_TOUCH_ICON = `/assets/apple-touch-icon.png?v=${ICON_VERSION}`;
const SITE_URL = "https://byheadless.com";
const DEFAULT_DESC =
  "Headless is a CMS that drops into any site via one script tag. Edit pages, blog posts, and service pages without touching code.";
const DEFAULT_OG_IMAGE = "https://byheadless.com/assets/logo.svg";

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#fafaf9" />
        <meta name="description" content={DEFAULT_DESC} />

        {/* OpenGraph + Twitter card defaults; per-page <Head> overrides these */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:title" content="Headless — A CMS that drops into any site" />
        <meta property="og:description" content={DEFAULT_DESC} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <meta name="twitter:card" content="summary" />

        <link rel="canonical" href={SITE_URL} />
        {/* Browsers that support SVG favicons pick the first <link>. Both
            files have a cream background baked in so the icon stays visible
            on dark-mode browser tabs (Chromium ignores prefers-color-scheme
            inside SVG favicons). PNG is fallback for older clients. */}
        <link rel="icon" type="image/svg+xml" href={FAVICON_SVG} />
        <link rel="icon" type="image/png" sizes="32x32" href={FAVICON_PNG} />
        <link rel="apple-touch-icon" sizes="180x180" href={APPLE_TOUCH_ICON} />
        <link rel="manifest" href="/manifest.json" />

        {/* Expo's static rendering already auto-emits a preload for the SVG
            because it's referenced as <img src> in SSR — no manual preload
            needed here. */}

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
