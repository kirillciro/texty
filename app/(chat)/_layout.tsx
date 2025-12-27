import { useUser } from "@clerk/clerk-expo";
import { Stack, Redirect, Link } from "expo-router";

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
        options={{
          headerLargeTitle: true,
          headerTitle: "Chat Rooms",
          headerLeft: (props) => (
            <Link href="/profile">
              <Image
                source={{ uri: user?.imageUrl }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 17,
                }}
              />
            </Link>
          ),
        }}
        name="index"
      />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
