import { Platform } from "react-native";
import { supabase } from "@/lib/supabase";

const SIZES = [400, 800, 1600] as const;

type PickedImage = {
  uri: string;
  ext: string;
  contentType: string;
};

export async function pickImage(): Promise<PickedImage | null> {
  if (Platform.OS === "web") {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) {
          resolve(null);
          return;
        }
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        const uri = URL.createObjectURL(file);
        resolve({ uri, ext, contentType: file.type || `image/${ext}` });
      };
      input.click();
    });
  }

  const ImagePicker = await import("expo-image-picker");
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 1,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  const ext = (asset.uri.split(".").pop() || "jpg").toLowerCase().split("?")[0];
  return {
    uri: asset.uri,
    ext,
    contentType: asset.mimeType || `image/${ext}`,
  };
}

async function resizeToWebp(uri: string, width: number): Promise<Blob> {
  if (Platform.OS === "web") {
    return resizeWebCanvas(uri, width);
  }
  const ImageManipulator = await import("expo-image-manipulator");
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.WEBP }
  );
  const res = await fetch(result.uri);
  return await res.blob();
}

async function resizeWebCanvas(uri: string, width: number): Promise<Blob> {
  const img = new Image();
  img.src = uri;
  await img.decode();
  const ratio = img.naturalHeight / img.naturalWidth;
  const targetWidth = Math.min(width, img.naturalWidth);
  const targetHeight = Math.round(targetWidth * ratio);
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas 2d context unavailable");
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      "image/webp",
      0.8
    );
  });
}

export async function uploadImage(
  siteId: string,
  picked: PickedImage
): Promise<string> {
  const variants = await Promise.all(
    SIZES.map(async (size) => ({ size, blob: await resizeToWebp(picked.uri, size) }))
  );

  const { data, error: fnError } = await supabase.functions.invoke("upload-url", {
    body: { siteId, contentType: "image/webp" },
  });
  if (fnError) throw fnError;
  if (!data?.uploadUrls || !data?.key) {
    throw new Error("upload-url returned malformed response");
  }

  await Promise.all(
    variants.map(async ({ size, blob }) => {
      const url = data.uploadUrls[size];
      if (!url) throw new Error(`missing presigned URL for size ${size}`);
      const res = await fetch(url, {
        method: "PUT",
        body: blob,
        headers: { "Content-Type": "image/webp" },
      });
      if (!res.ok) {
        throw new Error(`upload failed for ${size}px (${res.status})`);
      }
    })
  );

  if (Platform.OS === "web") {
    try { URL.revokeObjectURL(picked.uri); } catch {}
  }

  return `r2:${data.key}`;
}
