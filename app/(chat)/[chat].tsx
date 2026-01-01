import { Button } from "@/components/Button";
import { IconSymbol } from "@/components/icon-symbol";
import { Text } from "@/components/Text";
import { appwriteConfig, client, db, ID } from "@/utils/appwrite";
import { Gray, Primary, Secondary } from "@/utils/colors";
import { ChatRoom, Message } from "@/utils/types";
import { useUser } from "@clerk/clerk-expo";
import { LegendList } from "@legendapp/list";
import { useHeaderHeight } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { Query } from "react-native-appwrite";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Chat() {
  const { chat: chatId } = useLocalSearchParams();
  const { user } = useUser();
  const router = useRouter();
  const [messageContent, setMessageContent] = React.useState("");
  const [chatRoom, setChatRoom] = React.useState<any>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const headerHeightValue = useHeaderHeight();
  const headerHeight = Platform.OS === "ios" ? headerHeightValue : 0;

  React.useEffect(() => {
    handleFirstLoad();
  }, []);

  React.useEffect(() => {
    if (!chatId) return;

    // Subscribe to messages collection for this chat room
    const unsubscribe = client.subscribe(
      `databases.${appwriteConfig.db}.collections.${appwriteConfig.col.messages}.documents`,
      (response: any) => {
        // Check if the message belongs to this chat room
        const messageData = response.payload || response;
        if (messageData.chatRoomId === chatId) {
          getMessages();
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [chatId]);

  const handleFirstLoad = async () => {
    try {
      await getMessages();
      await getChatRoom();
    } catch (e) {
      console.error("❌ Error during initial load:", e);
    }
  };

  const getChatRoom = async () => {
    try {
      const data = await db.getDocument(
        appwriteConfig.db,
        appwriteConfig.col.chatrooms,
        chatId as string
      );
      setChatRoom(data as unknown as ChatRoom);
    } catch (e) {
      console.error("❌ Error fetching chat room:", e);
    }
  };

  const getMessages = async () => {
    try {
      const { documents, total } = await db.listDocuments(
        appwriteConfig.db,
        appwriteConfig.col.messages,
        [
          Query.equal("chatRoomId", chatId as string),
          Query.orderAsc("$createdAt"),
          Query.limit(100),
        ]
      );

      setMessages(documents as unknown as Message[]);
    } catch (e) {
      console.error("❌ Error fetching messages:", e);
    }
  };

  const sendMessage = async () => {
    if (messageContent.trim() === "") {
      return;
    }
    try {
      const message = {
        content: messageContent,
        senderId: user?.id,
        senderName: user?.fullName,
        senderPhoto: user?.imageUrl,
        chatRoomId: chatId,
      };

      await db.createDocument(
        appwriteConfig.db,
        appwriteConfig.col.messages,
        ID.unique(),
        message
      );

      setMessageContent("");

      await db.updateDocument(
        appwriteConfig.db,
        appwriteConfig.col.chatrooms,
        chatId as string,
        {
          $updatedAt: new Date().toISOString(),
        }
      );
    } catch (e) {
      console.error("❌ Error sending message:", e);
    }
  };

  if (!chatId) {
    return <Text>We not found this room</Text>;
  }

  if (isLoading) {
    return (
      <>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: chatRoom?.title || "Chat Room",
          headerLeft: () => (
            <Button
              title="Chat Rooms"
              variant="header"
              icon={
                <IconSymbol name="chevron.left" color={Primary} size={20} />
              }
              iconPosition="left"
              onPress={() => router.back()}
            />
          ),
        }}
      />
      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={"padding"}
          keyboardVerticalOffset={headerHeight}
        >
          <LegendList
            data={messages}
            renderItem={({ item }) => {
              const isSender = item.senderId === user?.id;
              return (
                <View
                  style={{
                    padding: 10,
                    borderRadius: 10,
                    flexDirection: "row",
                    gap: 8,
                    maxWidth: "80%",
                    alignSelf: isSender ? "flex-end" : "flex-start",
                  }}
                >
                  {!isSender && (
                    <Image
                      source={{ uri: item.senderPhoto }}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        marginRight: 8,
                      }}
                    />
                  )}
                  <View
                    style={{
                      backgroundColor: isSender ? Primary : Secondary,
                      flex: 1,
                      padding: 10,
                      borderRadius: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        marginBottom: 4,
                      }}
                    >
                      {item.senderName}
                    </Text>
                    <Text>{item.content}</Text>
                    <Text
                      style={{
                        fontSize: 10,
                        color: "white",
                        marginTop: 5,
                        textAlign: "right",
                      }}
                    >
                      {new Date(item.$createdAt!).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </Text>
                  </View>
                </View>
              );
            }}
            keyExtractor={(item) => item?.$id ?? "unknown"}
            contentContainerStyle={{ padding: 10 }}
            recycleItems={true} //
            initialScrollIndex={messages.length - 1}
            alignItemsAtEnd
            maintainScrollAtEnd
            maintainScrollAtEndThreshold={0.5}
            maintainVisibleContentPosition
            estimatedItemSize={100}
          />

          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 24,
              backgroundColor: "rgba(26, 26, 26, 0.28)",
              borderWidth: 1,
              borderColor: "rgba(107, 107, 107, 0.26)",
              marginBottom: 10,
              marginHorizontal: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <TextInput
              placeholder="Type a message..."
              value={messageContent}
              onChangeText={setMessageContent}
              style={{
                fontSize: 16,
                minHeight: 40,
                maxHeight: 120,
                color: "white",
                flex: 1,
                paddingHorizontal: 12,
                paddingTop: 10,
                paddingBottom: 10,
              }}
              multiline
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
            />
            <Pressable
              disabled={messageContent.trim() === ""}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                const currentMessage = messageContent;
                setMessageContent(""); // Clear input immediately
                sendMessage();
              }}
              style={({ pressed }) => ({
                width: 36,
                height: 36,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 18,
                backgroundColor:
                  messageContent.trim() === ""
                    ? "transparent"
                    : pressed
                    ? `${Primary}CC` // 80% opacity when pressed
                    : Primary,
                marginBottom: 2,
                marginLeft: 8,
                transform: pressed ? [{ scale: 0.9 }] : [{ scale: 1 }],
              })}
            >
              <IconSymbol
                name="paperplane.fill"
                size={18}
                color={messageContent.trim() === "" ? Gray : "white"}
              />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
