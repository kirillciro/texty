import { Button } from "@/components/Button";
import { Text } from "@/components/Text";
import { Gray } from "@/utils/colors";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { Image, TouchableOpacity, View } from "react-native";

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

  return (
    <View style={{ flex: 1, alignItems: "center", padding: 16, gap: 10 }}>
      <Image
        source={{ uri: user?.imageUrl }}
        style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          alignSelf: "center",
          marginTop: 20,
        }}
      />

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
