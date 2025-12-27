import { View, Image } from "react-native";
import { Text } from "@/components/Text";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { isClerkAPIResponseError, useSSO, useSignIn } from "@clerk/clerk-expo";
import { ClerkAPIError } from "@clerk/types";
import { useState } from "react";

WebBrowser.maybeCompleteAuthSession();

export default function Index() {
  const { startSSOFlow } = useSSO();
  const { setActive, signIn } = useSignIn();
  const [errors, setErrors] = useState<ClerkAPIError[]>([]);

  const handleSignInWithGoogle = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: AuthSession.makeRedirectUri(),
      });

      if (createdSessionId) {
        setActive!({ session: createdSessionId });
      } else {
        // theres no session, handle accordingly
      }
    } catch (error) {
      if (isClerkAPIResponseError(error)) {
        setErrors(error.errors);
      } else {
        console.error("Unexpected error during SSO sign-in:", error);
      }
    }
  };
  const handleSignInWithPasskeys = async () => {
    try {
      const signInAttempt = await signIn?.authenticateWithPasskey({
        flow: "discoverable",
      });
      if (signInAttempt?.status === "complete") {
        await setActive!({ session: signInAttempt.createdSessionId });
      } else {
        //theres no session, handle accordingly
      }
    } catch (error) {
      if (isClerkAPIResponseError(error)) {
        setErrors(error.errors);
      } else {
        console.error("Unexpected error during SSO sign-in:", error);
      }
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        }}
      >
        <View style={{ flex: 0.1 }} />

        <View style={{ gap: 20, alignItems: "center" }}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={{ width: 100, height: 100 }}
          />
          <Text style={{ fontSize: 32, fontWeight: "bold" }}>Texty</Text>
          <Text>Welcome to Texty, your chat rooms to-go.</Text>
          {errors.map((error) => (
            <Text key={error.code} style={{ color: "red" }}>
              {error.message}
            </Text>
          ))}
        </View>

        <View style={{ flex: 1 }} />

        <Button onPress={handleSignInWithPasskeys} style={{ marginBottom: 20 }}>
          Sign in with PassKeys
        </Button>
        <Button
          onPress={handleSignInWithGoogle}
          style={{
            flexDirection: "row",
            gap: 10,
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <Image
            source={require("@/assets/images/google-icon.png")}
            style={{ width: 20, height: 20 }}
          />
          <Text style={{ color: "black", fontWeight: "500" }}>
            Continue with Google
          </Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
