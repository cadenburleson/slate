// Native build of the logo. Web uses Logo.web.tsx (raw <img src="...svg">) so
// the static HTML has a real LCP element before JS hydration.
import { Image, type ImageStyle, type StyleProp } from "react-native";

const logo = require("../assets/logo.png");

type Props = {
  width: number;
  height: number;
  style?: StyleProp<ImageStyle>;
};

export default function Logo({ width, height, style }: Props) {
  return (
    <Image
      source={logo}
      style={[{ width, height }, style]}
      resizeMode="contain"
    />
  );
}
