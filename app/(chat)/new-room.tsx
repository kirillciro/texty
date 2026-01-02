import { Button } from "@/components/Button";
import Input from "@/components/input";
import { Text } from "@/components/Text";
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
              title="Create"
              variant="header"
              disabled={roomName === "" || isLoading}
              onPress={handleCreateRoom}
            />
          ),
        }}
      />
      <View style={{ flex: 1, padding: 16, gap: 12 }}>
        <Text>New Room</Text>
        <Input
          placeholder="Room Name"
          value={roomName}
          onChangeText={setRoomName}
          maxLength={255}
        />
        <Input
          placeholder="Room Description"
          value={roomDescription}
          onChangeText={setRoomDescription}
          maxLength={1000}
          style={{ height: 150 }}
          textAlignVertical="top"
          multiline
        />
      </View>
    </>
  );
}
