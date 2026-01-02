import { Button } from "@/components/Button";
import Input from "@/components/input";
import { Text } from "@/components/Text";
import i18n from "@/localization/i18n";
import { appwriteConfig, db, ID } from "@/utils/appwrite";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

export default function NewRoom() {
  const [roomName, setRoomName] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreateRoom = async () => {
    try {
      setIsLoading(true);
      const document = await db.createDocument(
        appwriteConfig.db,
        appwriteConfig.col.chatrooms,
        ID.unique(),
        {
          title: roomName,
          description: roomDescription,
        }
      );
      console.log("✅ Room created:", document);
      // Navigate back to chat rooms list
      router.back();
    } catch (e) {
      console.error("❌ Error creating room:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Button
              title={i18n.t("newRoom.create")}
              variant="header"
              disabled={roomName === "" || isLoading}
              onPress={handleCreateRoom}
            />
          ),
        }}
      />
      <View style={{ flex: 1, padding: 20, gap: 16 }}>
        <View
          style={{
            backgroundColor: "rgba(26, 26, 26, 0.6)",
            borderRadius: 20,
            padding: 20,
            gap: 16,
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.1)",
          }}
        >
          <Input
            placeholder={i18n.t("newRoom.roomName")}
            value={roomName}
            onChangeText={setRoomName}
            maxLength={255}
          />
          <Input
            placeholder={i18n.t("newRoom.roomDescription")}
            value={roomDescription}
            onChangeText={setRoomDescription}
            maxLength={1000}
            style={{ height: 150 }}
            textAlignVertical="top"
            multiline
          />
        </View>
      </View>
    </>
  );
}
