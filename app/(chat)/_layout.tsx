import { useUser } from "@clerk/clerk-expo";
import { Link, Redirect, Stack } from "expo-router";

import { IconSymbol } from "@/components/icon-symbol";
import { useUserRole } from "@/hooks/useUserRole";
import { Gold, Primary, Purple } from "@/utils/colors";
import { Image, View } from "react-native";

export default function RootLayout() {
  const { isSignedIn } = useUser();
  const { user } = useUser();
  const userRole = useUserRole();

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
              <View style={{ position: "relative" }}>
                <Image
                  source={{ uri: user?.imageUrl }}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                  }}
                />
                {(userRole === "admin" || userRole === "editor") && (
                  <View
                    style={{
                      position: "absolute",
                      bottom: -2,
                      right: -2,
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      backgroundColor: userRole === "admin" ? Gold : Purple,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 2,
                      borderColor: "#000",
                    }}
                  >
                    <IconSymbol
                      name={userRole === "admin" ? "crown.fill" : "pencil"}
                      size={8}
                      color="white"
                    />
                  </View>
                )}
              </View>
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
