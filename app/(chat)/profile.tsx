import { IconSymbol } from "@/components/icon-symbol";
import { Text } from "@/components/Text";
import { useUserRole } from "@/hooks/useUserRole";
import { Gold, Gray, Primary, Purple } from "@/utils/colors";
import { UserRole } from "@/utils/types";
import { useAuth, useUser } from "@clerk/clerk-expo";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Alert, Image, ScrollView, TouchableOpacity, View } from "react-native";

export default function Profile() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const passkeys = user?.passkeys ?? [];
  const userRole = useUserRole();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(auth)");
    } catch (error) {
      console.error(error);
    }
  };

  const handleImagePick = async () => {
    try {
      // Request permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant camera roll permissions to change your profile picture."
        );
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;

        // Convert image to base64
        const base64 = await FileSystem.readAsStringAsync(imageUri, {
          encoding: "base64",
        });

        // Upload to Clerk with proper format
        await user?.setProfileImage({
          file: `data:image/jpeg;base64,${base64}`,
        });
        await user?.reload();

        Alert.alert("Success", "Profile picture updated!");
      }
    } catch (error: any) {
      console.error("Error updating profile image:", error);
      Alert.alert(
        "Error",
        "Failed to update profile picture. Please try again."
      );
    }
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Card with Glassmorphic Design */}
      <View
        style={{
          backgroundColor: "rgba(26, 26, 26, 0.6)",
          borderRadius: 28,
          padding: 24,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.1)",
        }}
      >
        <View style={{ alignItems: "center" }}>
          <TouchableOpacity
            onPress={handleImagePick}
            style={{
              position: "relative",
              marginBottom: 16,
            }}
          >
            <View
              style={{
                width: 110,
                height: 110,
                borderRadius: 55,
                padding: 5,
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderWidth: 2,
                borderColor: "rgba(255, 255, 255, 0.15)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={{ uri: user?.imageUrl }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                }}
              />
            </View>

            {/* Role Badge on Avatar */}
            {(userRole === "admin" || userRole === "editor") && (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                  backgroundColor: getRoleColor(userRole),
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  borderWidth: 2,
                  borderColor: "rgba(0, 0, 0, 0.8)",
                }}
              >
                <IconSymbol
                  name={getRoleIcon(userRole)}
                  size={12}
                  color="white"
                />
              </View>
            )}

            <View
              style={{
                position: "absolute",
                bottom: 5,
                right: 5,
                backgroundColor: Primary,
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 3,
                borderColor: "rgba(0, 0, 0, 0.8)",
              }}
            >
              <IconSymbol name="camera.fill" size={18} color="white" />
            </View>
          </TouchableOpacity>

          <Text
            style={{
              textAlign: "center",
              fontSize: 24,
              fontWeight: "800",
              letterSpacing: 0.3,
            }}
          >
            {user?.fullName}
          </Text>
          <Text
            style={{
              textAlign: "center",
              color: "rgba(255, 255, 255, 0.6)",
              fontSize: 14,
              marginTop: 6,
              fontWeight: "500",
            }}
          >
            {user?.emailAddresses[0]?.emailAddress}
          </Text>

          {/* Role Badge - Modern Glass Design */}
          <View
            style={{
              marginTop: 16,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor:
                userRole === "admin"
                  ? "rgba(255, 215, 0, 0.15)"
                  : userRole === "editor"
                  ? "rgba(157, 78, 221, 0.15)"
                  : "rgba(142, 142, 147, 0.15)",
              borderWidth: 1.5,
              borderColor:
                userRole === "admin"
                  ? "rgba(255, 215, 0, 0.6)"
                  : userRole === "editor"
                  ? "rgba(157, 78, 221, 0.6)"
                  : "rgba(142, 142, 147, 0.4)",
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <IconSymbol
              name={getRoleIcon(userRole)}
              size={14}
              color={getRoleColor(userRole)}
            />
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: getRoleColor(userRole),
                letterSpacing: 0.5,
              }}
            >
              {getRoleLabel(userRole).toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Actions Card */}
      <View
        style={{
          backgroundColor: "rgba(26, 26, 26, 0.6)",
          borderRadius: 24,
          padding: 16,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.1)",
          overflow: "hidden",
        }}
      >
        <TouchableOpacity
          onPress={handleSignOut}
          style={{
            paddingVertical: 14,
            paddingHorizontal: 16,
            borderRadius: 16,
            backgroundColor: "rgba(255, 59, 48, 0.15)",
            borderWidth: 1,
            borderColor: "rgba(255, 59, 48, 0.3)",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Text
            style={{
              color: "#FF3B30",
              fontSize: 16,
              fontWeight: "700",
              letterSpacing: 0.3,
            }}
          >
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>

      {/* Passkeys Card */}
      <View
        style={{
          backgroundColor: "rgba(26, 26, 26, 0.6)",
          borderRadius: 24,
          padding: 20,
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.1)",
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            marginBottom: 16,
            letterSpacing: 0.3,
          }}
        >
          Passkeys
        </Text>

        {passkeys.length === 0 ? (
          <View
            style={{
              padding: 20,
              borderRadius: 16,
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.05)",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.4)",
                fontSize: 14,
                fontWeight: "500",
              }}
            >
              No passkeys registered
            </Text>
          </View>
        ) : (
          passkeys.map((passkey) => (
            <View
              key={passkey.id}
              style={{
                padding: 16,
                borderRadius: 18,
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.1)",
                marginBottom: 12,
              }}
            >
              <Text
                style={{ fontSize: 14, fontWeight: "600", marginBottom: 6 }}
              >
                {passkey.name}
              </Text>
              <Text
                style={{
                  color: "rgba(255, 255, 255, 0.5)",
                  fontSize: 12,
                  marginBottom: 4,
                }}
              >
                Created: {passkey.createdAt.toLocaleDateString()}
              </Text>
              <Text style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: 12 }}>
                Last used: {passkey.lastUsedAt?.toLocaleDateString() || "Never"}
              </Text>
              <TouchableOpacity
                onPress={async () => {
                  try {
                    console.log("🗑️ Deleting passkey:", passkey.id);
                    await passkey.delete();
                    console.log("✅ Passkey deleted successfully");
                    await user?.reload();
                  } catch (error: any) {
                    console.error(
                      "❌ Error deleting passkey:",
                      error?.message || error
                    );
                    console.error("Full error:", error);
                  }
                }}
                style={{
                  marginTop: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 12,
                  backgroundColor: "rgba(255, 59, 48, 0.15)",
                  borderWidth: 1,
                  borderColor: "rgba(255, 59, 48, 0.3)",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#FF3B30",
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  Delete Passkey
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        <TouchableOpacity
          onPress={async () => {
            try {
              await user?.createPasskey();
              await user?.reload();
              Alert.alert("Success", "Passkey created successfully!");
            } catch (error: any) {
              console.error("Error creating passkey:", error);

              if (
                error?.errors?.[0]?.code === "passkey_registration_cancelled"
              ) {
                return;
              }

              Alert.alert(
                "Error",
                error?.errors?.[0]?.message ||
                  "Failed to create passkey. Please try again."
              );
            }
          }}
          style={{
            marginTop: 12,
            paddingVertical: 14,
            paddingHorizontal: 16,
            borderRadius: 16,
            backgroundColor: Primary,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <IconSymbol name="plus" size={16} color="white" />
          <Text
            style={{
              color: "white",
              fontSize: 15,
              fontWeight: "700",
              letterSpacing: 0.3,
            }}
          >
            Add New Passkey
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Helper functions for role display
function getRoleColor(role: UserRole): string {
  switch (role) {
    case "admin":
      return Gold;
    case "editor":
      return Purple;
    case "user":
    default:
      return Gray;
  }
}

function getRoleIcon(role: UserRole): any {
  switch (role) {
    case "admin":
      return "crown.fill";
    case "editor":
      return "pencil";
    case "user":
    default:
      return "person.fill";
  }
}

function getRoleLabel(role: UserRole): string {
  switch (role) {
    case "admin":
      return "Administrator";
    case "editor":
      return "Editor";
    case "user":
    default:
      return "User";
  }
}
