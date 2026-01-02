import { Button } from "@/components/Button";
import { IconSymbol } from "@/components/icon-symbol";
import { Text } from "@/components/Text";
import { useUserRole } from "@/hooks/useUserRole";
import { appwriteConfig, client, db, ID } from "@/utils/appwrite";
import { Gold, Gray, Primary, Purple, Secondary } from "@/utils/colors";
import { getUserRoleByEmail } from "@/utils/roles";
import { ChatRoom, Message } from "@/utils/types";
import { useUser } from "@clerk/clerk-expo";
import { LegendList } from "@legendapp/list";
import { useHeaderHeight } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  ImageBackground,
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
  const userRole = useUserRole();
  const canModerate = userRole === "admin" || userRole === "editor";
  const [messageContent, setMessageContent] = React.useState("");
  const [chatRoom, setChatRoom] = React.useState<any>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [showDeleteForMessage, setShowDeleteForMessage] = React.useState<
    string | null
  >(null);
  const headerHeightValue = useHeaderHeight();
  const headerHeight = Platform.OS === "ios" ? headerHeightValue : 0;
  const listRef = React.useRef<any>(null);

  const getChatRoom = React.useCallback(async () => {
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
  }, [chatId]);

  const getMessages = React.useCallback(async () => {
    try {
      const { documents } = await db.listDocuments(
        appwriteConfig.db,
        appwriteConfig.col.messages,
        [
          Query.equal("chatRoomId", chatId as string),
          Query.orderAsc("$createdAt"),
          Query.limit(100),
        ]
      );

      setMessages(documents as unknown as Message[]);

      // Scroll to bottom after messages load with delay for smooth rendering
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 500);
    } catch (e) {
      console.error("❌ Error fetching messages:", e);
    }
  }, [chatId]);

  const handleFirstLoad = React.useCallback(async () => {
    try {
      await getMessages();
      await getChatRoom();
    } catch (e) {
      console.error("❌ Error during initial load:", e);
    }
  }, [getMessages, getChatRoom]);

  React.useEffect(() => {
    handleFirstLoad();
  }, [handleFirstLoad]);

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
  }, [chatId, getMessages]);

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
        senderEmail: user?.emailAddresses[0]?.emailAddress,
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

  const deleteMessage = async (messageId: string) => {
    try {
      await db.deleteDocument(
        appwriteConfig.db,
        appwriteConfig.col.messages,
        messageId
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.error("❌ Error deleting message:", e);
      Alert.alert("Error", "Failed to delete message");
    }
  };

  const handleDeleteMessage = (messageId: string, messageContent: string) => {
    Alert.alert(
      "Delete Message",
      `Are you sure you want to delete this message?\n\n"${messageContent.slice(
        0,
        50
      )}${messageContent.length > 50 ? "..." : ""}"`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMessage(messageId),
        },
      ]
    );
  };

  const deleteChatRoom = async () => {
    try {
      // Delete all messages in the chat room first
      const { documents } = await db.listDocuments(
        appwriteConfig.db,
        appwriteConfig.col.messages,
        [Query.equal("chatRoomId", chatId as string)]
      );

      for (const message of documents) {
        await db.deleteDocument(
          appwriteConfig.db,
          appwriteConfig.col.messages,
          message.$id
        );
      }

      // Delete the chat room
      await db.deleteDocument(
        appwriteConfig.db,
        appwriteConfig.col.chatrooms,
        chatId as string
      );

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (e) {
      console.error("❌ Error deleting chat room:", e);
      Alert.alert("Error", "Failed to delete chat room");
    }
  };

  const handleDeleteChatRoom = () => {
    Alert.alert(
      "Delete Chat Room",
      `Are you sure you want to delete "${chatRoom?.title}"? This will delete all messages in this room and cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteChatRoom(),
        },
      ]
    );
  };

  if (!chatId) {
    return <Text>We not found this room</Text>;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: chatRoom?.title || "Chat Room",
          headerRight: canModerate
            ? () => (
                <Pressable
                  onPress={handleDeleteChatRoom}
                  style={({ pressed }) => ({
                    padding: 8,
                    opacity: pressed ? 0.5 : 1,
                  })}
                >
                  <IconSymbol name="trash.fill" size={22} color="#FF3B30" />
                </Pressable>
              )
            : undefined,
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
        <ImageBackground
          source={require("@/assets/images/texty-bg.png")}
          style={{ flex: 1 }}
          imageStyle={{ opacity: 0.05 }}
          resizeMode="repeat"
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={"padding"}
            keyboardVerticalOffset={headerHeight}
          >
            <LegendList
              ref={listRef}
              data={messages}
              extraData={showDeleteForMessage}
              renderItem={({ item }) => {
                const isSender = item.senderId === user?.id;
                const senderRole = getUserRoleByEmail(item.senderEmail);
                const showRoleBadge =
                  senderRole === "admin" || senderRole === "editor";
                const roleBadgeColor = senderRole === "admin" ? Gold : Purple;
                const roleBadgeIcon =
                  senderRole === "admin" ? "crown.fill" : "pencil";
                const roleBadgeText =
                  senderRole === "admin" ? "Admin" : "Editor";
                const roleBadgeBorderColor =
                  senderRole === "admin"
                    ? "rgba(255, 215, 0, 0.6)"
                    : "rgba(157, 78, 221, 0.6)";

                return (
                  <View
                    style={{
                      marginVertical: 4,
                      marginHorizontal: 12,
                      maxWidth: "75%",
                      alignSelf: isSender ? "flex-end" : "flex-start",
                    }}
                  >
                    {/* Name and avatar row */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 6,
                        gap: 8,
                        alignSelf: isSender ? "flex-end" : "flex-start",
                      }}
                    >
                      <Image
                        source={{ uri: item.senderPhoto }}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                        }}
                      />
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "600",
                          color: "rgba(255, 255, 255, 0.7)",
                          letterSpacing: 0.3,
                        }}
                      >
                        {item.senderName}
                      </Text>
                      {showRoleBadge && (
                        <View
                          style={{
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            borderRadius: 10,
                            backgroundColor: `${roleBadgeColor}18`,
                            borderWidth: 1.5,
                            borderColor: roleBadgeBorderColor,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <IconSymbol
                            name={roleBadgeIcon}
                            size={11}
                            color={roleBadgeColor}
                          />
                          <Text
                            style={{
                              fontSize: 10,
                              fontWeight: "600",
                              color: roleBadgeColor,
                              letterSpacing: 0.5,
                            }}
                          >
                            {roleBadgeText}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Message bubble with long-press delete */}
                    <View>
                      <Pressable
                        onLongPress={() => {
                          if (canModerate) {
                            console.log(
                              "Long press detected, showing delete for:",
                              item.$id
                            );
                            Haptics.impactAsync(
                              Haptics.ImpactFeedbackStyle.Medium
                            );
                            setShowDeleteForMessage(item.$id!);
                          } else {
                            console.log(
                              "User cannot moderate, canModerate:",
                              canModerate
                            );
                          }
                        }}
                        delayLongPress={500}
                      >
                        <View
                          style={{
                            backgroundColor: isSender ? Primary : Secondary,
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            borderRadius: 20,
                            borderBottomRightRadius: isSender ? 4 : 20,
                            borderBottomLeftRadius: isSender ? 20 : 4,
                            borderWidth: 1,
                            borderColor: isSender
                              ? "rgba(255, 255, 255, 0.2)"
                              : "rgba(255, 255, 255, 0.15)",
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 3 },
                            shadowOpacity: 0.25,
                            shadowRadius: 6,
                            elevation: 4,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 15,
                              lineHeight: 20,
                              color: "white",
                            }}
                          >
                            {item.content}
                          </Text>
                          <Text
                            style={{
                              fontSize: 10,
                              color: "rgba(255, 255, 255, 0.6)",
                              marginTop: 6,
                              alignSelf: "flex-end",
                              fontWeight: "500",
                            }}
                          >
                            {new Date(item.$createdAt!).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </Text>
                        </View>
                      </Pressable>

                      {/* Compact delete action - slides down on long press */}
                      {showDeleteForMessage === item.$id && (
                        <Pressable
                          onPress={() => {
                            console.log("Delete button pressed for:", item.$id);
                            setShowDeleteForMessage(null);
                            handleDeleteMessage(item.$id!, item.content);
                          }}
                          style={({ pressed }) => ({
                            marginTop: 6,
                            alignSelf: isSender ? "flex-end" : "flex-start",
                            backgroundColor: pressed
                              ? "rgba(255, 59, 48, 0.18)"
                              : "rgba(255, 59, 48, 0.12)",
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: pressed
                              ? "rgba(255, 59, 48, 0.4)"
                              : "rgba(255, 59, 48, 0.3)",
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                          })}
                        >
                          <IconSymbol
                            name="trash.fill"
                            size={13}
                            color="#FF3B30"
                          />
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: "600",
                              color: "#FF3B30",
                            }}
                          >
                            Delete
                          </Text>
                        </Pressable>
                      )}
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
        </ImageBackground>
      </SafeAreaView>
    </>
  );
}
