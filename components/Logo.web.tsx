// Web build of the logo. Renders a raw <img> so it shows up in the static
// HTML payload — gives Lighthouse an LCP candidate before JS hydration and
// dramatically reduces both the LCP timing and the bytes shipped (the SVG is
// ~8 KB vs the 134 KB source PNG).
//
// Source is inlined as a data URI (see components/logoDataUri.ts) so the
// logo renders identically in Metro dev mode and the production Cloudflare
// Pages build. Expo's public/ folder is only served in production builds,
// which is what makes a /assets/logo.svg URL fail on the dev server.
import { createElement, type CSSProperties } from "react";
import { LOGO_SVG_URI } from "./logoDataUri";

type Props = {
  width: number;
  height: number;
  style?: CSSProperties;
};

export default function Logo({ width, height, style }: Props) {
  return createElement("img", {
    src: LOGO_SVG_URI,
    alt: "Headless",
    width,
    height,
    style,
    // Decoding async avoids blocking the main thread during paint.
    decoding: "async",
  });
}
