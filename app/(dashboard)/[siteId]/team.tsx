import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { members } from "@/lib/db";
import type { SiteMember } from "@/lib/db";

export default function TeamScreen() {
  const { siteId } = useLocalSearchParams<{ siteId: string }>();
  const [memberList, setMemberList] = useState<SiteMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await members.listMembers(siteId);
      setMemberList(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleInvite() {
    const email = inviteEmail.trim();
    if (!email) return;
    setInviting(true);
    try {
      await members.inviteMember(siteId, email);
      setInviteEmail("");
      await load();
      Alert.alert("Invited", `An invite was sent to ${email}.`);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setInviting(false);
    }
  }

  function displayName(member: SiteMember) {
    return member.invited_email ?? member.user_id ?? "Unknown";
  }

  function memberStatus(member: SiteMember) {
    if (!member.accepted_at) return "Pending";
    return member.role === "owner" ? "Owner" : "Editor";
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-stone-50"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="px-5 pt-6 pb-4 bg-white border-b border-stone-100">
        <Text className="font-semibold text-stone-900 mb-3">Invite by email</Text>
        <View className="flex-row gap-2">
          <TextInput
            className="flex-1 border border-stone-200 rounded-xl px-4 py-2.5 text-stone-900 bg-stone-50"
            placeholder="colleague@example.com"
            placeholderTextColor="#a8a29e"
            value={inviteEmail}
            onChangeText={setInviteEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            onSubmitEditing={handleInvite}
          />
          <TouchableOpacity
            onPress={handleInvite}
            disabled={inviting || !inviteEmail}
            className="bg-stone-900 px-4 py-2.5 rounded-xl items-center justify-center"
          >
            {inviting ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-white font-medium text-sm">Invite</Text>
            )}
          </TouchableOpacity>
        </View>
        <Text className="text-xs text-stone-400 mt-2">
          They'll get an email to join as an Editor.
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#44403c" />
        </View>
      ) : (
        <FlatList
          data={memberList}
          keyExtractor={(item) => item.user_id ?? item.invited_email ?? ""}
          contentContainerClassName="px-5 pt-4 pb-8"
          ListHeaderComponent={
            <Text className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
              Members ({memberList.length})
            </Text>
          }
          renderItem={({ item }) => (
            <View className="bg-white rounded-xl border border-stone-100 px-5 py-4 mb-2 flex-row items-center">
              <View className="w-9 h-9 rounded-full bg-stone-200 items-center justify-center mr-3">
                <Text className="text-stone-900 font-bold text-base uppercase">
                  {(item.invited_email ?? "?")[0]}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="font-medium text-stone-900 text-sm">
                  {displayName(item)}
                </Text>
              </View>
              <View
                className={`px-2 py-0.5 rounded-full ${
                  item.accepted_at ? "bg-green-50" : "bg-amber-50"
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    item.accepted_at ? "text-green-700" : "text-amber-600"
                  }`}
                >
                  {memberStatus(item)}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </KeyboardAvoidingView>
  );
}
