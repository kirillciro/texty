import { View } from "react-native";
import { Text } from "@/components/Text";
import { useLocalSearchParams } from "expo-router";

export default function Chat() {
  const { chat: chatId } = useLocalSearchParams();
  return (
    <View>
      <Text>{chatId}</Text>
    </View>
  );
}
