import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { Block } from "@/lib/db";
import { pickImage, uploadImage } from "@/lib/upload";
import { srcFor } from "@/lib/media";

// On web RNTextInput multiline renders as <textarea>, which has a fixed
// height + visible scrollbar by default. Strip that chrome and let the
// height be driven by onContentSizeChange so the input grows with content.
export const WEB_TEXTAREA_RESET =
  Platform.OS === "web"
    ? ({ outline: "none", resize: "none", overflow: "hidden" } as const)
    : undefined;

export function useAutoGrow(min: number) {
  const [height, setHeight] = useState(min);
  const onContentSizeChange = useCallback(
    (e: { nativeEvent: { contentSize: { height: number } } }) => {
      const h = e?.nativeEvent?.contentSize?.height;
      if (typeof h === "number") setHeight(Math.max(min, h));
    },
    [min]
  );
  return { height, onContentSizeChange };
}

type ImageBlockType = Extract<Block, { type: "image" }>;
type ImageWidth = NonNullable<ImageBlockType["width"]>;

// Editor-preview width as a percentage of the editor's content column.
// The DB keys (small/medium/large/full) are kept for back-compat with
// existing image blocks; the percentages and labels here are tuned to
// match how the live snippet renders each preset (see public/s.js
// .slate-figure-{small,medium,large,full} CSS rules).
//
//  small  → 50% of column     — sits alongside text
//  medium → 100% of column    — default; fills content width
//  large  → 125% on host (breaks out of column); 100% in editor
//  full   → 100vw on host (edge to edge); 100% in editor
//
// Editor caps at 100% because we can't reasonably bleed past the
// editor container — the preset label tells the author what the
// rendered output will do.
const WIDTH_PERCENT: Record<ImageWidth, number> = {
  small: 50,
  medium: 100,
  large: 100,
  full: 100,
};
const WIDTH_LABEL: Record<ImageWidth, string> = {
  small: "Inline",
  medium: "Standard",
  large: "Wide",
  full: "Full",
};

function generateId() {
  return Math.random().toString(36).slice(2);
}

// ─── Individual Block Components ────────────────────────────────────────────

function HeadingBlock({
  block,
  onChange,
  onDelete,
  onAddAfter,
}: {
  block: Extract<Block, { type: "heading" }>;
  onChange: (b: Block) => void;
  onDelete: () => void;
  onAddAfter: () => void;
}) {
  const sizes: Record<number, { className: string; min: number }> = {
    1: { className: "text-4xl font-bold leading-tight", min: 44 },
    2: { className: "text-3xl font-bold leading-snug", min: 36 },
    3: { className: "text-2xl font-semibold leading-snug", min: 32 },
  };
  const { height, onContentSizeChange } = useAutoGrow(sizes[block.level].min);
  return (
    <View className="mb-3 group">
      <View className="flex-row items-center gap-1 mb-1 opacity-0 group-hover:opacity-100">
        {[1, 2, 3].map((l) => (
          <TouchableOpacity
            key={l}
            onPress={() => onChange({ ...block, level: l as 1 | 2 | 3 })}
            className={`px-2 py-0.5 rounded ${block.level === l ? "bg-stone-200" : "bg-transparent"}`}
          >
            <Text
              className={`text-xs font-mono ${block.level === l ? "text-stone-800" : "text-stone-400"}`}
            >
              H{l}
            </Text>
          </TouchableOpacity>
        ))}
        <View className="flex-1" />
        <TouchableOpacity onPress={onDelete} className="p-1">
          <Text className="text-stone-400 text-sm">✕</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        className={`text-stone-900 ${sizes[block.level].className} py-1`}
        style={[{ height }, WEB_TEXTAREA_RESET]}
        value={block.text}
        onChangeText={(t) => onChange({ ...block, text: t })}
        onContentSizeChange={onContentSizeChange}
        placeholder={`Heading ${block.level}`}
        placeholderTextColor="#d6d3d1"
        multiline
        textAlignVertical="top"
        onSubmitEditing={onAddAfter}
        blurOnSubmit
      />
    </View>
  );
}

function ParagraphBlock({
  block,
  onChange,
  onDelete,
  onAddAfter,
}: {
  block: Extract<Block, { type: "paragraph" }>;
  onChange: (b: Block) => void;
  onDelete: () => void;
  onAddAfter: () => void;
}) {
  const { height, onContentSizeChange } = useAutoGrow(32);
  return (
    <View className="mb-3 group">
      <View className="flex-row items-start">
        <TextInput
          className="flex-1 text-stone-800 text-lg leading-loose py-1"
          style={[{ height }, WEB_TEXTAREA_RESET]}
          value={block.text}
          onChangeText={(t) => onChange({ ...block, text: t })}
          onContentSizeChange={onContentSizeChange}
          placeholder="Write something..."
          placeholderTextColor="#d6d3d1"
          multiline
          textAlignVertical="top"
        />
        <TouchableOpacity
          onPress={onDelete}
          className="p-1 mt-1 opacity-0 group-hover:opacity-60"
        >
          <Text className="text-stone-400 text-sm">✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function QuoteBlock({
  block,
  onChange,
  onDelete,
}: {
  block: Extract<Block, { type: "quote" }>;
  onChange: (b: Block) => void;
  onDelete: () => void;
}) {
  const { height, onContentSizeChange } = useAutoGrow(36);
  return (
    <View className="mb-3 flex-row items-start gap-3 group">
      <View className="w-1 bg-stone-700 rounded-full self-stretch" />
      <TextInput
        className="flex-1 text-stone-700 italic text-xl leading-relaxed py-1"
        style={[{ height }, WEB_TEXTAREA_RESET]}
        value={block.text}
        onChangeText={(t) => onChange({ ...block, text: t })}
        onContentSizeChange={onContentSizeChange}
        placeholder="A great quote..."
        placeholderTextColor="#d6d3d1"
        multiline
        textAlignVertical="top"
      />
      <TouchableOpacity
        onPress={onDelete}
        className="p-1 opacity-0 group-hover:opacity-60"
      >
        <Text className="text-stone-400 text-sm">✕</Text>
      </TouchableOpacity>
    </View>
  );
}

function ListBlock({
  block,
  onChange,
  onDelete,
}: {
  block: Extract<Block, { type: "list" }>;
  onChange: (b: Block) => void;
  onDelete: () => void;
}) {
  function updateItem(index: number, value: string) {
    const items = [...block.items];
    items[index] = value;
    onChange({ ...block, items });
  }

  function addItem() {
    onChange({ ...block, items: [...block.items, ""] });
  }

  function removeItem(index: number) {
    const items = block.items.filter((_, i) => i !== index);
    onChange({ ...block, items: items.length ? items : [""] });
  }

  return (
    <View className="mb-2">
      <View className="flex-row items-center gap-2 mb-2">
        <TouchableOpacity
          onPress={() => onChange({ ...block, ordered: false })}
          className={`px-2 py-0.5 rounded ${!block.ordered ? "bg-stone-200" : "bg-stone-100"}`}
        >
          <Text className={`text-xs ${!block.ordered ? "text-stone-800" : "text-stone-500"}`}>
            • Bullets
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onChange({ ...block, ordered: true })}
          className={`px-2 py-0.5 rounded ${block.ordered ? "bg-stone-200" : "bg-stone-100"}`}
        >
          <Text className={`text-xs ${block.ordered ? "text-stone-800" : "text-stone-500"}`}>
            1. Numbered
          </Text>
        </TouchableOpacity>
        <View className="flex-1" />
        <TouchableOpacity onPress={onDelete} className="p-1">
          <Text className="text-stone-200 text-sm">✕</Text>
        </TouchableOpacity>
      </View>
      {block.items.map((item, i) => (
        <View key={i} className="flex-row items-center gap-2 mb-1">
          <Text className="text-stone-400 text-sm w-5 text-right">
            {block.ordered ? `${i + 1}.` : "•"}
          </Text>
          <TextInput
            className="flex-1 text-stone-700 text-base py-1"
            value={item}
            onChangeText={(t) => updateItem(i, t)}
            placeholder="List item"
            placeholderTextColor="#d6d3d1"
            onSubmitEditing={addItem}
            blurOnSubmit={false}
          />
          <TouchableOpacity onPress={() => removeItem(i)} className="p-1">
            <Text className="text-stone-300 text-xs">✕</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity onPress={addItem} className="mt-1">
        <Text className="text-stone-400 text-sm">+ Add item</Text>
      </TouchableOpacity>
    </View>
  );
}

function ImageBlock({
  block,
  siteId,
  onChange,
  onDelete,
}: {
  block: ImageBlockType;
  siteId: string;
  onChange: (b: Block) => void;
  onDelete: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const width = block.width ?? "full";

  useEffect(() => {
    if (!block.src) return;
    Image.getSize(
      srcFor(block.src, "full"),
      (w, h) => setAspectRatio(h > 0 ? w / h : 1.5),
      () => setAspectRatio(1.5)
    );
  }, [block.src]);

  async function handlePick() {
    setError(null);
    try {
      const picked = await pickImage();
      if (!picked) return;
      setUploading(true);
      const url = await uploadImage(siteId, picked);
      onChange({ ...block, src: url });
    } catch (e: any) {
      setError(e?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  if (!block.src) {
    return (
      <View className="mb-2 bg-stone-50 border border-dashed border-stone-300 rounded-xl p-6 items-center">
        <TouchableOpacity
          onPress={handlePick}
          disabled={uploading}
          className="bg-stone-900 px-4 py-2 rounded-lg flex-row items-center gap-2"
        >
          {uploading && <ActivityIndicator color="#fff" size="small" />}
          <Text className="text-white text-sm font-medium">
            {uploading ? "Uploading…" : "Upload image"}
          </Text>
        </TouchableOpacity>
        {error && (
          <Text className="text-red-500 text-xs mt-2">{error}</Text>
        )}
        <TouchableOpacity onPress={onDelete} className="mt-3">
          <Text className="text-stone-400 text-xs">Remove block</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="mb-3">
      <View className="flex-row items-center gap-2 mb-2">
        {(Object.keys(WIDTH_PERCENT) as ImageWidth[]).map((w) => (
          <TouchableOpacity
            key={w}
            onPress={() => onChange({ ...block, width: w })}
            className={`px-2 py-0.5 rounded ${
              width === w ? "bg-stone-200" : "bg-stone-100"
            }`}
          >
            <Text
              className={`text-xs font-mono ${
                width === w ? "text-stone-800" : "text-stone-500"
              }`}
            >
              {WIDTH_LABEL[w]}
            </Text>
          </TouchableOpacity>
        ))}
        <View className="flex-1" />
        <TouchableOpacity onPress={handlePick} disabled={uploading} className="p-1">
          <Text className="text-stone-400 text-xs">
            {uploading ? "Uploading…" : "Replace"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} className="p-1">
          <Text className="text-stone-300 text-base">✕</Text>
        </TouchableOpacity>
      </View>

      <View className="items-center">
        <Image
          source={{ uri: srcFor(block.src, width) }}
          style={{
            width: `${WIDTH_PERCENT[width]}%`,
            aspectRatio: aspectRatio ?? 1.5,
            borderRadius: 8,
          }}
          resizeMode="contain"
        />
      </View>

      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}

      <TextInput
        className="text-stone-700 text-sm py-1 mt-2 border-b border-stone-100"
        value={block.alt}
        onChangeText={(t) => onChange({ ...block, alt: t })}
        placeholder="Alt text (for screen readers)"
        placeholderTextColor="#d6d3d1"
      />
      <TextInput
        className="text-stone-500 text-sm italic py-1"
        value={block.caption}
        onChangeText={(t) => onChange({ ...block, caption: t })}
        placeholder="Caption (optional)"
        placeholderTextColor="#d6d3d1"
      />
    </View>
  );
}

function DividerBlock({ onDelete }: { onDelete: () => void }) {
  return (
    <View className="mb-2 flex-row items-center gap-3">
      <View className="flex-1 h-px bg-stone-200" />
      <TouchableOpacity onPress={onDelete}>
        <Text className="text-stone-300 text-xs">✕</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Add Block Picker ────────────────────────────────────────────────────────

const BLOCK_TYPES: { type: BlockType; label: string; icon: string }[] = [
  { type: "paragraph", label: "Paragraph", icon: "¶" },
  { type: "heading", label: "Heading", icon: "H" },
  { type: "image", label: "Image", icon: "▣" },
  { type: "list", label: "List", icon: "≡" },
  { type: "quote", label: "Quote", icon: '"' },
  { type: "divider", label: "Divider", icon: "—" },
];

type BlockType = Block["type"];

function defaultBlock(type: BlockType): Block {
  const id = generateId();
  switch (type) {
    case "heading":
      return { id, type: "heading", level: 2, text: "" };
    case "paragraph":
      return { id, type: "paragraph", text: "" };
    case "list":
      return { id, type: "list", ordered: false, items: [""] };
    case "quote":
      return { id, type: "quote", text: "" };
    case "divider":
      return { id, type: "divider" };
    case "image":
      return { id, type: "image", src: "", alt: "", caption: "", width: "full" };
    case "service":
      return {
        id,
        type: "service",
        title: "",
        description: "",
        price: 0,
        label: "Buy now",
        stripe_link: "",
      };
    default:
      return { id, type: "paragraph", text: "" };
  }
}

function AddBlockPicker({ onAdd }: { onAdd: (b: Block) => void }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className="flex-row items-center gap-2 py-3 px-2"
      >
        <View className="w-6 h-6 rounded-full border border-stone-300 items-center justify-center">
          <Text className="text-stone-400 text-base leading-none">+</Text>
        </View>
        <Text className="text-stone-400 text-sm">Add block</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View className="border border-stone-200 rounded-xl bg-white mb-3 overflow-hidden">
      <View className="flex-row items-center px-4 py-3 border-b border-stone-100">
        <Text className="flex-1 text-sm font-semibold text-stone-700">Add block</Text>
        <TouchableOpacity onPress={() => setOpen(false)}>
          <Text className="text-stone-400">✕</Text>
        </TouchableOpacity>
      </View>
      <View className="flex-row flex-wrap p-3 gap-2">
        {BLOCK_TYPES.map((bt) => (
          <TouchableOpacity
            key={bt.type}
            onPress={() => {
              onAdd(defaultBlock(bt.type));
              setOpen(false);
            }}
            className="flex-row items-center gap-2 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2"
          >
            <Text className="text-stone-500 font-mono text-sm">{bt.icon}</Text>
            <Text className="text-stone-700 text-sm">{bt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Main BlockEditor ────────────────────────────────────────────────────────

interface BlockEditorProps {
  siteId: string;
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}

export function BlockEditor({ siteId, blocks, onChange }: BlockEditorProps) {
  function updateBlock(index: number, block: Block) {
    const next = [...blocks];
    next[index] = block;
    onChange(next);
  }

  function deleteBlock(index: number) {
    onChange(blocks.filter((_, i) => i !== index));
  }

  function addBlock(block: Block) {
    onChange([...blocks, block]);
  }

  function addAfter(index: number) {
    const next = [...blocks];
    next.splice(index + 1, 0, defaultBlock("paragraph"));
    onChange(next);
  }

  function renderBlock(block: Block, index: number) {
    const sharedProps = {
      onDelete: () => deleteBlock(index),
      onAddAfter: () => addAfter(index),
    };

    switch (block.type) {
      case "heading":
        return (
          <HeadingBlock
            key={block.id}
            block={block}
            onChange={(b) => updateBlock(index, b)}
            {...sharedProps}
          />
        );
      case "paragraph":
        return (
          <ParagraphBlock
            key={block.id}
            block={block}
            onChange={(b) => updateBlock(index, b)}
            {...sharedProps}
          />
        );
      case "quote":
        return (
          <QuoteBlock
            key={block.id}
            block={block}
            onChange={(b) => updateBlock(index, b)}
            onDelete={sharedProps.onDelete}
          />
        );
      case "list":
        return (
          <ListBlock
            key={block.id}
            block={block}
            onChange={(b) => updateBlock(index, b)}
            onDelete={sharedProps.onDelete}
          />
        );
      case "divider":
        return (
          <DividerBlock key={block.id} onDelete={sharedProps.onDelete} />
        );
      case "image":
        return (
          <ImageBlock
            key={block.id}
            block={block}
            siteId={siteId}
            onChange={(b) => updateBlock(index, b)}
            onDelete={sharedProps.onDelete}
          />
        );
      default:
        return null;
    }
  }

  return (
    <View className="flex-1">
      {blocks.length === 0 && (
        <Text className="text-stone-300 text-base py-2">Start writing...</Text>
      )}
      {blocks.map((block, i) => renderBlock(block, i))}
      <AddBlockPicker onAdd={addBlock} />
    </View>
  );
}
