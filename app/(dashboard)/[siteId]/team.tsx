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
      className="flex-1 bg-paper"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="px-8 pt-8 pb-6 max-w-xl w-full mx-auto">
        <Text className="text-xs uppercase tracking-wider text-ink-faint mb-3">
          Invite by email
        </Text>
        <View className="flex-row items-end gap-3">
          <TextInput
            className="flex-1 border-b border-rule pb-2 text-ink text-base"
            placeholder="colleague@example.com"
            placeholderTextColor="#A8A8A8"
            value={inviteEmail}
            onChangeText={setInviteEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            onSubmitEditing={handleInvite}
          />
          <TouchableOpacity
            onPress={handleInvite}
            disabled={inviting || !inviteEmail}
            className="bg-ink px-5 py-2 rounded-full items-center justify-center"
          >
            {inviting ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-paper text-sm">Invite</Text>
            )}
          </TouchableOpacity>
        </View>
        <Text className="text-xs text-ink-faint mt-2">
          They'll get an email to join as an Editor.
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#191919" />
        </View>
      ) : (
        <FlatList
          data={memberList}
          keyExtractor={(item) => item.user_id ?? item.invited_email ?? ""}
          contentContainerClassName="px-8 pt-6 pb-12 max-w-xl mx-auto w-full"
          ListHeaderComponent={
            <Text className="text-xs uppercase tracking-wider text-ink-faint mb-2">
              Members ({memberList.length})
            </Text>
          }
          renderItem={({ item }) => (
            <View className="py-4 border-b border-rule flex-row items-center">
              <View className="flex-1">
                <Text className="text-ink">
                  {displayName(item)}
                </Text>
              </View>
              <Text
                className={`text-xs ${
                  item.accepted_at ? "text-leaf" : "text-amber-600"
                }`}
              >
                {memberStatus(item)}
              </Text>
            </View>
          )}
        />
      )}
    </KeyboardAvoidingView>
  );
}
