import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { Block } from "@/lib/db";

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
  const sizes: Record<number, string> = {
    1: "text-3xl font-bold",
    2: "text-2xl font-bold",
    3: "text-xl font-semibold",
  };
  return (
    <View className="mb-2">
      <View className="flex-row items-center gap-2 mb-1">
        {[1, 2, 3].map((l) => (
          <TouchableOpacity
            key={l}
            onPress={() => onChange({ ...block, level: l as 1 | 2 | 3 })}
            className={`px-2 py-0.5 rounded ${block.level === l ? "bg-indigo-100" : "bg-slate-100"}`}
          >
            <Text
              className={`text-xs font-mono ${block.level === l ? "text-indigo-700" : "text-slate-500"}`}
            >
              H{l}
            </Text>
          </TouchableOpacity>
        ))}
        <View className="flex-1" />
        <TouchableOpacity onPress={onDelete} className="p-1">
          <Text className="text-slate-300 text-base">✕</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        className={`text-slate-900 ${sizes[block.level]} py-1`}
        value={block.text}
        onChangeText={(t) => onChange({ ...block, text: t })}
        placeholder={`Heading ${block.level}`}
        placeholderTextColor="#cbd5e1"
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
  onAddAfter,
}: {
  block: Extract<Block, { type: "paragraph" }>;
  onChange: (b: Block) => void;
  onDelete: () => void;
  onAddAfter: () => void;
}) {
  return (
    <View className="mb-2 group">
      <View className="flex-row items-start">
        <TextInput
          className="flex-1 text-slate-700 text-base leading-relaxed py-1"
          value={block.text}
          onChangeText={(t) => onChange({ ...block, text: t })}
          placeholder="Write something..."
          placeholderTextColor="#cbd5e1"
          multiline
        />
        <TouchableOpacity onPress={onDelete} className="p-1 mt-1">
          <Text className="text-slate-200 text-sm">✕</Text>
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
  return (
    <View className="mb-2 flex-row items-start gap-3">
      <View className="w-1 bg-indigo-400 rounded-full self-stretch" />
      <TextInput
        className="flex-1 text-slate-600 italic text-base py-1"
        value={block.text}
        onChangeText={(t) => onChange({ ...block, text: t })}
        placeholder="A great quote..."
        placeholderTextColor="#cbd5e1"
        multiline
      />
      <TouchableOpacity onPress={onDelete} className="p-1">
        <Text className="text-slate-200 text-sm">✕</Text>
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
          className={`px-2 py-0.5 rounded ${!block.ordered ? "bg-indigo-100" : "bg-slate-100"}`}
        >
          <Text className={`text-xs ${!block.ordered ? "text-indigo-700" : "text-slate-500"}`}>
            • Bullets
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onChange({ ...block, ordered: true })}
          className={`px-2 py-0.5 rounded ${block.ordered ? "bg-indigo-100" : "bg-slate-100"}`}
        >
          <Text className={`text-xs ${block.ordered ? "text-indigo-700" : "text-slate-500"}`}>
            1. Numbered
          </Text>
        </TouchableOpacity>
        <View className="flex-1" />
        <TouchableOpacity onPress={onDelete} className="p-1">
          <Text className="text-slate-200 text-sm">✕</Text>
        </TouchableOpacity>
      </View>
      {block.items.map((item, i) => (
        <View key={i} className="flex-row items-center gap-2 mb-1">
          <Text className="text-slate-400 text-sm w-5 text-right">
            {block.ordered ? `${i + 1}.` : "•"}
          </Text>
          <TextInput
            className="flex-1 text-slate-700 text-base py-1"
            value={item}
            onChangeText={(t) => updateItem(i, t)}
            placeholder="List item"
            placeholderTextColor="#cbd5e1"
            onSubmitEditing={addItem}
            blurOnSubmit={false}
          />
          <TouchableOpacity onPress={() => removeItem(i)} className="p-1">
            <Text className="text-slate-300 text-xs">✕</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity onPress={addItem} className="mt-1">
        <Text className="text-slate-400 text-sm">+ Add item</Text>
      </TouchableOpacity>
    </View>
  );
}

function DividerBlock({ onDelete }: { onDelete: () => void }) {
  return (
    <View className="mb-2 flex-row items-center gap-3">
      <View className="flex-1 h-px bg-slate-200" />
      <TouchableOpacity onPress={onDelete}>
        <Text className="text-slate-300 text-xs">✕</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Add Block Picker ────────────────────────────────────────────────────────

const BLOCK_TYPES: { type: BlockType; label: string; icon: string }[] = [
  { type: "paragraph", label: "Paragraph", icon: "¶" },
  { type: "heading", label: "Heading", icon: "H" },
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
      return { id, type: "image", src: "", alt: "", caption: "" };
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
        <View className="w-6 h-6 rounded-full border border-slate-300 items-center justify-center">
          <Text className="text-slate-400 text-base leading-none">+</Text>
        </View>
        <Text className="text-slate-400 text-sm">Add block</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View className="border border-slate-200 rounded-xl bg-white mb-3 overflow-hidden">
      <View className="flex-row items-center px-4 py-3 border-b border-slate-100">
        <Text className="flex-1 text-sm font-semibold text-slate-700">Add block</Text>
        <TouchableOpacity onPress={() => setOpen(false)}>
          <Text className="text-slate-400">✕</Text>
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
            className="flex-row items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
          >
            <Text className="text-slate-500 font-mono text-sm">{bt.icon}</Text>
            <Text className="text-slate-700 text-sm">{bt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Main BlockEditor ────────────────────────────────────────────────────────

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}

export function BlockEditor({ blocks, onChange }: BlockEditorProps) {
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
          <View key={block.id} className="mb-2 bg-slate-50 border border-slate-200 rounded-lg p-4 items-center">
            <Text className="text-slate-400 text-sm">Image block — upload coming soon</Text>
            <TouchableOpacity onPress={sharedProps.onDelete} className="mt-2">
              <Text className="text-red-400 text-xs">Remove</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  }

  return (
    <View className="flex-1">
      {blocks.length === 0 && (
        <Text className="text-slate-300 text-base py-2">Start writing...</Text>
      )}
      {blocks.map((block, i) => renderBlock(block, i))}
      <AddBlockPicker onAdd={addBlock} />
    </View>
  );
}
