import { Platform } from "react-native";
import { supabase } from "@/lib/supabase";

const BUCKET = "page-media";

type PickedImage = {
  blob: Blob;
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
        resolve({ blob: file, ext, contentType: file.type || `image/${ext}` });
      };
      input.click();
    });
  }

  const ImagePicker = await import("expo-image-picker");
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.85,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  const res = await fetch(asset.uri);
  const blob = await res.blob();
  const ext = (asset.uri.split(".").pop() || "jpg").toLowerCase().split("?")[0];
  const contentType = asset.mimeType || blob.type || `image/${ext}`;
  return { blob, ext, contentType };
}

export async function uploadImage(
  siteId: string,
  picked: PickedImage
): Promise<string> {
  const id =
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const path = `${siteId}/${id}.${picked.ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, picked.blob, {
      contentType: picked.contentType,
      upsert: false,
    });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
