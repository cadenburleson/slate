import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { Block } from "@/lib/db";
import { pickImage, uploadImage } from "@/lib/upload";
import { srcFor } from "@/lib/media";

type ImageBlockType = Extract<Block, { type: "image" }>;
type ImageWidth = NonNullable<ImageBlockType["width"]>;

const WIDTH_PERCENT: Record<ImageWidth, number> = {
  small: 40,
  medium: 65,
  large: 85,
  full: 100,
};
const WIDTH_LABEL: Record<ImageWidth, string> = {
  small: "Small",
  medium: "Medium",
  large: "Large",
  full: "Full",
};

function generateId() {
  return Math.random().toString(36).slice(2);
}

// ─── Subtle row of inline controls shown above formattable blocks ───────────

function BlockToolbar({
  children,
  onDelete,
}: {
  children?: React.ReactNode;
  onDelete: () => void;
}) {
  return (
    <View className="flex-row items-center mb-2 opacity-60">
      {children}
      <View className="flex-1" />
      <TouchableOpacity onPress={onDelete} className="py-0.5 px-1">
        <Text className="text-ink-faint text-xs">Remove</Text>
      </TouchableOpacity>
    </View>
  );
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
  const sizes: Record<number, string> = {
    1: "text-4xl font-serif",
    2: "text-3xl font-serif",
    3: "text-2xl font-serif",
  };
  return (
    <View className="mb-6">
      <BlockToolbar onDelete={onDelete}>
        <View className="flex-row items-center gap-4">
          {[1, 2, 3].map((l) => (
            <TouchableOpacity
              key={l}
              onPress={() => onChange({ ...block, level: l as 1 | 2 | 3 })}
            >
              <Text
                className={`text-xs ${
                  block.level === l ? "text-ink" : "text-ink-faint"
                }`}
              >
                H{l}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </BlockToolbar>
      <TextInput
        className={`text-ink leading-tight ${sizes[block.level]}`}
        value={block.text}
        onChangeText={(t) => onChange({ ...block, text: t })}
        placeholder={`Heading ${block.level}`}
        placeholderTextColor="#C4C4C4"
        multiline
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
}: {
  block: Extract<Block, { type: "paragraph" }>;
  onChange: (b: Block) => void;
  onDelete: () => void;
  onAddAfter: () => void;
}) {
  return (
    <View className="mb-6 flex-row items-start gap-2">
      <TextInput
        className="flex-1 text-ink text-lg leading-8 font-serif"
        value={block.text}
        onChangeText={(t) => onChange({ ...block, text: t })}
        placeholder="Tell your story…"
        placeholderTextColor="#C4C4C4"
        multiline
      />
      <TouchableOpacity onPress={onDelete} className="pt-2 px-1 opacity-30">
        <Text className="text-ink-faint text-xs">×</Text>
      </TouchableOpacity>
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
  return (
    <View className="mb-6">
      <BlockToolbar onDelete={onDelete} />
      <View className="flex-row items-start gap-5 pl-1">
        <View className="w-[3px] bg-ink rounded-full self-stretch" />
        <TextInput
          className="flex-1 text-ink-muted italic text-2xl font-serif leading-relaxed"
          value={block.text}
          onChangeText={(t) => onChange({ ...block, text: t })}
          placeholder="A great quote…"
          placeholderTextColor="#C4C4C4"
          multiline
        />
      </View>
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
    <View className="mb-6">
      <BlockToolbar onDelete={onDelete}>
        <View className="flex-row items-center gap-4">
          <TouchableOpacity onPress={() => onChange({ ...block, ordered: false })}>
            <Text
              className={`text-xs ${
                !block.ordered ? "text-ink" : "text-ink-faint"
              }`}
            >
              • Bulleted
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onChange({ ...block, ordered: true })}>
            <Text
              className={`text-xs ${
                block.ordered ? "text-ink" : "text-ink-faint"
              }`}
            >
              1. Numbered
            </Text>
          </TouchableOpacity>
        </View>
      </BlockToolbar>
      {block.items.map((item, i) => (
        <View key={i} className="flex-row items-start gap-3 mb-1">
          <Text className="text-ink-muted text-lg font-serif leading-8 w-6 text-right">
            {block.ordered ? `${i + 1}.` : "•"}
          </Text>
          <TextInput
            className="flex-1 text-ink text-lg font-serif leading-8"
            value={item}
            onChangeText={(t) => updateItem(i, t)}
            placeholder="List item"
            placeholderTextColor="#C4C4C4"
            onSubmitEditing={addItem}
            blurOnSubmit={false}
          />
          {block.items.length > 1 && (
            <TouchableOpacity onPress={() => removeItem(i)} className="p-1 opacity-40">
              <Text className="text-ink-faint text-xs">×</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      <TouchableOpacity onPress={addItem} className="mt-1 ml-9">
        <Text className="text-ink-faint text-sm">+ Add item</Text>
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
      <View className="mb-6 border-t border-b border-rule py-12 items-center">
        <TouchableOpacity
          onPress={handlePick}
          disabled={uploading}
          className="flex-row items-center gap-2 px-4 py-2"
        >
          {uploading && <ActivityIndicator color="#191919" size="small" />}
          <Text className="text-ink text-sm underline">
            {uploading ? "Uploading…" : "Upload image"}
          </Text>
        </TouchableOpacity>
        {error && <Text className="text-red-500 text-xs mt-2">{error}</Text>}
        <TouchableOpacity onPress={onDelete} className="mt-3">
          <Text className="text-ink-faint text-xs">Remove block</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="mb-8">
      <BlockToolbar onDelete={onDelete}>
        <View className="flex-row items-center gap-4">
          {(Object.keys(WIDTH_PERCENT) as ImageWidth[]).map((w) => (
            <TouchableOpacity
              key={w}
              onPress={() => onChange({ ...block, width: w })}
            >
              <Text
                className={`text-xs ${
                  width === w ? "text-ink" : "text-ink-faint"
                }`}
              >
                {WIDTH_LABEL[w]}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={handlePick} disabled={uploading}>
            <Text className="text-ink-faint text-xs">
              {uploading ? "Uploading…" : "Replace"}
            </Text>
          </TouchableOpacity>
        </View>
      </BlockToolbar>

      <View className="items-center">
        <Image
          source={{ uri: srcFor(block.src, width) }}
          style={{
            width: `${WIDTH_PERCENT[width]}%`,
            aspectRatio: aspectRatio ?? 1.5,
          }}
          resizeMode="contain"
        />
      </View>

      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}

      <TextInput
        className="text-ink-muted italic text-sm font-serif text-center py-2 mt-3"
        value={block.caption}
        onChangeText={(t) => onChange({ ...block, caption: t })}
        placeholder="Add a caption (optional)"
        placeholderTextColor="#C4C4C4"
      />
      <TextInput
        className="text-ink-faint text-xs text-center py-1"
        value={block.alt}
        onChangeText={(t) => onChange({ ...block, alt: t })}
        placeholder="Alt text for screen readers"
        placeholderTextColor="#C4C4C4"
      />
    </View>
  );
}

function DividerBlock({ onDelete }: { onDelete: () => void }) {
  return (
    <View className="my-12 items-center">
      <Text className="text-ink-faint tracking-[0.5em] text-sm">* * *</Text>
      <TouchableOpacity onPress={onDelete} className="mt-2 opacity-40">
        <Text className="text-ink-faint text-xs">Remove</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Add Block Picker ────────────────────────────────────────────────────────

const BLOCK_TYPES: { type: BlockType; label: string }[] = [
  { type: "paragraph", label: "Text" },
  { type: "heading", label: "Heading" },
  { type: "image", label: "Image" },
  { type: "list", label: "List" },
  { type: "quote", label: "Quote" },
  { type: "divider", label: "Divider" },
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
        className="flex-row items-center gap-3 py-4 active:opacity-60"
      >
        <View className="w-7 h-7 rounded-full border border-ink-faint items-center justify-center">
          <Text className="text-ink-muted text-base leading-none">+</Text>
        </View>
        <Text className="text-ink-faint text-sm">Add block</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View className="border-t border-b border-rule py-4 my-2">
      <View className="flex-row flex-wrap gap-x-6 gap-y-3 items-center">
        {BLOCK_TYPES.map((bt) => (
          <TouchableOpacity
            key={bt.type}
            onPress={() => {
              onAdd(defaultBlock(bt.type));
              setOpen(false);
            }}
          >
            <Text className="text-ink text-sm">{bt.label}</Text>
          </TouchableOpacity>
        ))}
        <View className="flex-1" />
        <TouchableOpacity onPress={() => setOpen(false)}>
          <Text className="text-ink-faint text-sm">Cancel</Text>
        </TouchableOpacity>
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
        <Text className="text-ink-faint text-lg font-serif leading-8 py-2">
          Tell your story…
        </Text>
      )}
      {blocks.map((block, i) => renderBlock(block, i))}
      <AddBlockPicker onAdd={addBlock} />
    </View>
  );
}
