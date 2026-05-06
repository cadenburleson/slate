// Web build of the logo. Renders a raw <img> so it shows up in the static
// HTML payload — gives Lighthouse an LCP candidate before JS hydration and
// dramatically reduces both the LCP timing and the bytes shipped (the SVG is
// ~8 KB vs the 134 KB source PNG).
import { createElement, type CSSProperties } from "react";

type Props = {
  width: number;
  height: number;
  style?: CSSProperties;
};

export default function Logo({ width, height, style }: Props) {
  return createElement("img", {
    src: "/assets/logo.svg",
    alt: "Headless",
    width,
    height,
    style,
    // Decoding async avoids blocking the main thread during paint.
    decoding: "async",
  });
}
