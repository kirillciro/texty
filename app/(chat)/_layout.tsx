import { useUser } from "@clerk/clerk-expo";
import { Link, Redirect, Stack } from "expo-router";

import { IconSymbol } from "@/components/icon-symbol";
import { Primary } from "@/utils/colors";
import { Image } from "react-native";

export default function RootLayout() {
  const { isSignedIn } = useUser();
  const { user } = useUser();

  if (!isSignedIn) {
    return <Redirect href="/(auth)" />;
  }
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerLargeTitle: true,
          headerTitle: "Chat Rooms",
          headerLeft: (props) => (
            <Link
              style={{
                marginInline: 3,
              }}
              href="/profile"
            >
              <Image
                source={{ uri: user?.imageUrl }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                }}
              />
            </Link>
          ),
          headerRight: (props) => {
            return (
              <Link
                style={{
                  marginInline: 5,
                }}
                href="/new-room"
              >
                <IconSymbol name="plus" color={Primary} />
              </Link>
            );
          },
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          presentation: "modal",
          headerTitle: "Profile",
          headerLeft: () => (
            <Link
              style={{
                marginInline: 5,
              }}
              dismissTo
              href={"/"}
            >
              <IconSymbol name="chevron.left" color={Primary} />
            </Link>
          ),
        }}
      />
      <Stack.Screen
        name="new-room"
        options={{
          presentation: "modal",
          headerTitle: "New Chat Room",
          headerLeft: () => (
            <Link
              style={{
                marginInline: 5,
              }}
              dismissTo
              href={"/"}
            >
              <IconSymbol name="chevron.left" color={Primary} />
            </Link>
          ),
        }}
      />
      <Stack.Screen
        name="[chat]"
        options={{
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="settings/[chat]"
        options={{
          headerTitle: "Room Settings",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
