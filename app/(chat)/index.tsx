import React from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { Link } from "expo-router";
import { chatRooms } from "@/utils/test-data";
import { IconSymbol } from "@/components/icon-symbol";
import { Gray } from "@/utils/colors";
import { Text } from "@/components/Text";

export default function Index() {
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1300);
  }, []);

  return (
    <FlatList
      data={chatRooms}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      renderItem={({ item }) => (
        <Link
          href={{
            pathname: "/[chat]",
            params: { chat: item.id },
          }}
        >
          <View
            style={{
              flex: 1,
              alignItems: "flex-end",
              justifyContent: "space-between",
              flexDirection: "row",
              padding: 20,
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
  );
}

function ItemTitle({ title }: { title: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <IconSymbol name={"message"} size={16} color={Gray} />
      <View>
        <Text style={{ fontSize: 16, fontWeight: "600" }}>{title}</Text>
      </View>
    </View>
  );
}

function ItemTitleDescription({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View>
      <ItemTitle title={title} />
      <Text style={{ fontSize: 14, color: Gray }}>{description}</Text>
    </View>
  );
}
