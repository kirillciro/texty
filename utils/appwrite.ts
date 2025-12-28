import { Client, Databases } from "react-native-appwrite";

// IMPROVEMENT: Validate environment variables to catch configuration errors early
if (!process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT) {
  throw new Error("EXPO_PUBLIC_APPWRITE_ENDPOINT is not defined");
}

if (!process.env.EXPO_PUBLIC_APPWRITE_ID) {
  throw new Error("EXPO_PUBLIC_APPWRITE_ID is not defined");
}

if (!process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID) {
  throw new Error("EXPO_PUBLIC_APPWRITE_DATABASE_ID is not defined");
}

// Configuration object for Appwrite connection
const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_ID,
  platform: "com.kirills.chatapp",
  db: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
  col: {
    chatrooms: "chatrooms",
    messages: "messages",
    users: "users",
  },
};

// IMPROVEMENT: Updated to use variable declarations before initialization
// This follows the official Appwrite React Native documentation pattern
let client: Client;
let db: Databases;

// IMPROVEMENT: Initialize client following official Appwrite documentation
// Updated from react-native-appwrite v0.7.0 to v0.19.0 for Expo SDK 54 compatibility
client = new Client();
client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

db = new Databases(client);

export { appwriteConfig, client, db };
