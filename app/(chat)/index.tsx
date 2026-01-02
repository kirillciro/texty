import { IconSymbol } from "@/components/icon-symbol";
import { Text } from "@/components/Text";
import i18n from "@/localization/i18n";
import { appwriteConfig, db } from "@/utils/appwrite";
import { cleanupInactiveChatRooms } from "@/utils/chatroom-cleanup";
import { Gray } from "@/utils/colors";
import { ChatRoom } from "@/utils/types";
import { Link, useFocusEffect } from "expo-router";
import React from "react";
import { FlatList, ImageBackground, RefreshControl, View } from "react-native";
import { Query } from "react-native-appwrite";

export default function Index() {
  const [chatRooms, setChatRooms] = React.useState<ChatRoom[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [lastActivities, setLastActivities] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    fetchChatRooms();
    // Run cleanup on initial load
    cleanupInactiveChatRooms();
  }, []);

  // Refresh chat rooms when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchChatRooms();
      // Also run cleanup when screen comes into focus
      cleanupInactiveChatRooms();
    }, [])
  );

  const fetchChatRooms = async () => {
    try {
      const { documents, total } = await db.listDocuments(
        appwriteConfig.db,
        appwriteConfig.col.chatrooms,
        [Query.limit(100)]
      );
      console.log("🚀 Fetched chat rooms:", JSON.stringify(documents, null, 2));
      console.log("🍺 Total chat rooms:", total);
      setChatRooms(documents as unknown as ChatRoom[]);
      
      // Fetch last activity for each chat room
      const activities: Record<string, string> = {};
      for (const room of documents) {
        const { documents: messages } = await db.listDocuments(
          appwriteConfig.db,
          appwriteConfig.col.messages,
          [
            Query.equal("chatRoomId", room.$id),
            Query.orderDesc("$createdAt"),
            Query.limit(1),
          ]
        );
        
        if (messages.length > 0) {
          const lastMessage = messages[0];
          const date = new Date(lastMessage.$createdAt);
          const day = date.getDate();
          const month = date.toLocaleString('en-US', { month: 'short' });
          const time = date.toLocaleString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          });
          activities[room.$id] = `${day} ${month}. ${time}`;
        }
      }
      setLastActivities(activities);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchChatRooms();
      console.log("🔄 Chat rooms refreshed");
    } catch (error) {
      console.error("Error refreshing chat rooms:", error);
    } finally {
      setRefreshing(false);
    }
  };
  return (
    <ImageBackground
      source={require("@/assets/images/texty-bg.png")}
      style={{ flex: 1 }}
      imageStyle={{ opacity: 0.03 }}
      resizeMode="repeat"
    >
      <FlatList
        data={chatRooms}
        keyExtractor={(item) => item.$id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <Link
            href={{
              pathname: "/[chat]",
              params: { chat: item.$id },
            }}
          >
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "space-between",
                flexDirection: "row",
                padding: 20,
                gap: 16,
                borderRadius: 20,
                width: "100%",
                backgroundColor: "rgba(26, 26, 26, 0.28)",
                borderWidth: 1,
                borderColor: "rgba(107, 107, 107, 0.26)",
                shadowColor: "#161616a6",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <ItemTitleDescription
                title={item.title}
                description={item.description}
                lastActivity={lastActivities[item.$id]}
              />

              <IconSymbol
                style={{
                  alignSelf: "center",
                }}
                name="chevron.right"
                size={24}
                color={Gray}
              />
            </View>
          </Link>
        )}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: 16, gap: 16 }}
      />
    </ImageBackground>
  );
}

function ItemTitle({ title }: { title: string }) {
  return (
    <>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <IconSymbol name={"message"} size={16} color={Gray} />
        <View>
          <Text style={{ fontSize: 16, fontWeight: "600" }}>{title}</Text>
        </View>
      </View>
    </>
  );
}

function ItemTitleDescription({
  title,
  description,
  lastActivity,
}: {
  title: string;
  description: string;
  lastActivity?: string;
}) {
  return (
    <View style={{ flex: 1, gap: 6 }}>
      <ItemTitle title={title} />
      <Text 
        style={{ 
          fontSize: 14, 
          color: Gray,
          lineHeight: 18
        }}
      >
        {description}
      </Text>
      {lastActivity && (
        <Text 
          style={{ 
            fontSize: 11, 
            color: "rgba(142, 142, 147, 0.7)",
            fontWeight: "500",
            letterSpacing: 0.2
          }}
        >
          {i18n.t("chatRooms.lastActivity")}: {lastActivity}
        </Text>
      )}
    </View>
  );
}
