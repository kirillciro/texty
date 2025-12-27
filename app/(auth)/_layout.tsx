import { useUser } from "@clerk/clerk-expo";
import { Stack, Redirect } from "expo-router";

export default function RootLayout() {
  const { isSignedIn } = useUser();
  if (isSignedIn) {
    return <Redirect href="/(chat)" />;
  }
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
