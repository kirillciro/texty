import { Button } from "@/components/Button";
import { IconSymbol } from "@/components/icon-symbol";
import { Text } from "@/components/Text";
import { Gray, Primary } from "@/utils/colors";
import { useAuth, useUser } from "@clerk/clerk-expo";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Alert, Image, TouchableOpacity, View } from "react-native";

export default function Profile() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const passkeys = user?.passkeys ?? [];

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
    <View style={{ flex: 1, alignItems: "center", padding: 16, gap: 10 }}>
      <TouchableOpacity
        onPress={handleImagePick}
        style={{
          marginTop: 20,
          position: "relative",
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
        <View
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            backgroundColor: Primary,
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 3,
            borderColor: "#000",
          }}
        >
          <IconSymbol name="camera.fill" size={16} color="white" />
        </View>
      </TouchableOpacity>

      <View style={{ alignItems: "center", width: "100%" }}>
        <Text style={{ textAlign: "center", marginTop: 10, fontSize: 18 }}>
          {user?.fullName}
        </Text>
        <Text style={{ textAlign: "center", marginBottom: 20, color: Gray }}>
          {user?.emailAddresses[0]?.emailAddress}
        </Text>
      </View>

      <Button title="Sign Out" onPress={handleSignOut}>
        Sign Out
      </Button>

      <View style={{ marginTop: 30, width: "100%" }}>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>Passkeys</Text>
        {passkeys.length === 0 ? (
          <Text style={{ color: Gray }}>No passkeys registered.</Text>
        ) : (
          passkeys.map((passkey) => (
            <View
              key={passkey.id}
              style={{
                padding: 10,
                borderWidth: 1,
                borderColor: Gray,
                borderRadius: 8,
                marginBottom: 10,
              }}
            >
              <Text>ID: {passkey.id}</Text>
              <Text>Name: {passkey.name}</Text>
              <Text style={{ color: Gray, fontSize: 12 }}>
                Created At: {passkey.createdAt.toLocaleDateString()}
              </Text>
              <Text>Last Used: {passkey.lastUsedAt?.toLocaleDateString()}</Text>
              <TouchableOpacity
                onPress={async () => {
                  try {
                    console.log("🗑️ Deleting passkey:", passkey.id);
                    await passkey.delete();
                    console.log("✅ Passkey deleted successfully");

                    // Reload user data to refresh passkey list
                    await user?.reload();
                  } catch (error: any) {
                    console.error(
                      "❌ Error deleting passkey:",
                      error?.message || error
                    );
                    console.error("Full error:", error);
                  }
                }}
                style={{ marginTop: 8 }}
              >
                <Text style={{ color: "red" }}>Delete Passkey</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
        <Button
          style={{ marginTop: 10 }}
          title="Add New Passkey"
          onPress={async () => {
            try {
              await user?.createPasskey();
            } catch (error) {
              console.error("Error creating passkey:", error);
            }
          }}
        >
          Add New Passkey
        </Button>
      </View>
    </View>
  );
}
