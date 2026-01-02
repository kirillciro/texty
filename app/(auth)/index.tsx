import { IconSymbol } from "@/components/icon-symbol";
import { Text } from "@/components/Text";
import { isClerkAPIResponseError, useSSO, useSignIn } from "@clerk/clerk-expo";
import { ClerkAPIError } from "@clerk/types";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

  const handleSignInWithApple = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_apple",
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
        console.error("Unexpected error during Apple sign-in:", error);
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
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <View
        style={{
          flex: 1,
          justifyContent: "space-between",
          alignItems: "center",
          padding: 24,
        }}
      >
        {/* Hero Section */}
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <View
            style={{
              width: 140,
              height: 140,
              borderRadius: 70,
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              borderWidth: 2,
              borderColor: "rgba(255, 255, 255, 0.15)",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 32,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 10,
            }}
          >
            <Image
              source={require("@/assets/images/texty-icon-round.png")}
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
              }}
            />
          </View>

          <Text
            style={{
              fontSize: 48,
              fontWeight: "800",
              letterSpacing: 0.5,
              marginBottom: 12,
            }}
          >
            Texty
          </Text>

          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              color: "rgba(255, 255, 255, 0.6)",
              textAlign: "center",
              lineHeight: 24,
              paddingHorizontal: 20,
            }}
          >
            Welcome to Texty, your chat rooms to-go.
          </Text>

          {/* Error Messages */}
          {errors.length > 0 && (
            <View
              style={{
                marginTop: 20,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 16,
                backgroundColor: "rgba(255, 59, 48, 0.15)",
                borderWidth: 1,
                borderColor: "rgba(255, 59, 48, 0.3)",
              }}
            >
              {errors.map((error) => (
                <Text
                  key={error.code}
                  style={{
                    color: "#FF3B30",
                    fontSize: 14,
                    fontWeight: "500",
                    textAlign: "center",
                  }}
                >
                  {error.message}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Auth Buttons */}
        <View
          style={{
            width: "100%",
            gap: 16,
            paddingBottom: 20,
            paddingHorizontal: 4,
          }}
        >
          {/* Passkeys Button */}
          <TouchableOpacity
            onPress={handleSignInWithPasskeys}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              paddingVertical: 16,
              paddingHorizontal: 20,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.15)",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <IconSymbol name="lock.fill" size={20} color="white" />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                letterSpacing: 0.3,
              }}
            >
              Sign in with Passkeys
            </Text>
          </TouchableOpacity>

          {/* Apple Button */}
          <TouchableOpacity
            onPress={handleSignInWithApple}
            style={{
              backgroundColor: "#000000",
              paddingVertical: 16,
              paddingHorizontal: 20,
              borderRadius: 20,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.1)",
            }}
          >
            <Image
              source={require("@/assets/images/apple-icon-white.png")}
              style={{ width: 22, height: 22 }}
            />
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 16,
                fontWeight: "700",
                letterSpacing: 0.3,
              }}
            >
              Continue with Apple
            </Text>
          </TouchableOpacity>

          {/* Google Button */}
          <TouchableOpacity
            onPress={handleSignInWithGoogle}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              paddingVertical: 16,
              paddingHorizontal: 20,
              borderRadius: 20,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
            }}
          >
            <Image
              source={require("@/assets/images/google-icon.png")}
              style={{ width: 22, height: 22 }}
            />
            <Text
              style={{
                color: "#000000",
                fontSize: 16,
                fontWeight: "700",
                letterSpacing: 0.3,
              }}
            >
              Continue with Google
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
