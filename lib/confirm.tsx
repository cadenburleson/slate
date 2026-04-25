import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type ConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type PendingRequest = ConfirmOptions & {
  resolve: (ok: boolean) => void;
};

let setPending: ((req: PendingRequest | null) => void) | null = null;

export function confirm(opts: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    if (!setPending) {
      console.warn("confirm() called before <ConfirmHost /> was mounted");
      resolve(false);
      return;
    }
    setPending({ ...opts, resolve });
  });
}

export function ConfirmHost() {
  const [req, setReq] = useState<PendingRequest | null>(null);

  useEffect(() => {
    setPending = setReq;
    return () => {
      setPending = null;
    };
  }, []);

  function close(ok: boolean) {
    req?.resolve(ok);
    setReq(null);
  }

  return (
    <Modal
      visible={!!req}
      transparent
      animationType="fade"
      onRequestClose={() => close(false)}
    >
      <View className="flex-1 items-center justify-center px-6">
        <Pressable
          style={StyleSheet.absoluteFill}
          className="bg-black/40"
          onPress={() => close(false)}
        />
        <View
          className="w-full max-w-sm bg-white rounded-2xl p-5"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.18,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 12 },
            elevation: 16,
          }}
        >
          <Text className="text-lg font-semibold text-slate-900 mb-1">
            {req?.title}
          </Text>
          {req?.message ? (
            <Text className="text-sm text-slate-500 mb-5">{req.message}</Text>
          ) : (
            <View className="mb-3" />
          )}
          <View className="flex-row justify-end gap-2">
            <TouchableOpacity
              onPress={() => close(false)}
              className="px-4 py-2 rounded-lg bg-slate-100"
            >
              <Text className="text-sm font-medium text-slate-700">
                {req?.cancelLabel ?? "Cancel"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => close(true)}
              className={`px-4 py-2 rounded-lg ${
                req?.destructive ? "bg-red-600" : "bg-indigo-600"
              }`}
            >
              <Text className="text-sm font-medium text-white">
                {req?.confirmLabel ?? "OK"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
