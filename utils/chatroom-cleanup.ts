import { Query } from "react-native-appwrite";
import { appwriteConfig, db } from "./appwrite";

/**
 * Deletes inactive chat rooms that haven't received messages in 24 hours
 * This helps manage storage and keep only active conversations
 */
export async function cleanupInactiveChatRooms(): Promise<{
  deleted: number;
  errors: number;
}> {
  try {
    console.log("🧹 Starting cleanup of inactive chat rooms...");

    // Calculate 24 hours ago timestamp
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    const cutoffTime = twentyFourHoursAgo.toISOString();

    console.log(`📅 Cutoff time: ${cutoffTime}`);

    // Fetch all chat rooms that haven't been updated in 24 hours
    const { documents: inactiveChatRooms } = await db.listDocuments(
      appwriteConfig.db,
      appwriteConfig.col.chatrooms,
      [Query.lessThan("$updatedAt", cutoffTime), Query.limit(100)]
    );

    if (inactiveChatRooms.length === 0) {
      console.log("✅ No inactive chat rooms found");
      return { deleted: 0, errors: 0 };
    }

    console.log(
      `🗑️  Found ${inactiveChatRooms.length} inactive chat rooms to delete`
    );

    let deletedCount = 0;
    let errorCount = 0;

    // Delete each inactive chat room and its messages
    for (const room of inactiveChatRooms) {
      try {
        // First, delete all messages in the chat room
        const { documents: messages } = await db.listDocuments(
          appwriteConfig.db,
          appwriteConfig.col.messages,
          [
            Query.equal("chatRoomId", room.$id),
            Query.limit(1000), // Adjust based on expected message volume
          ]
        );

        // Delete all messages
        for (const message of messages) {
          try {
            await db.deleteDocument(
              appwriteConfig.db,
              appwriteConfig.col.messages,
              message.$id
            );
          } catch (msgError) {
            console.error(
              `❌ Error deleting message ${message.$id}:`,
              msgError
            );
            errorCount++;
          }
        }

        // Then delete the chat room itself
        await db.deleteDocument(
          appwriteConfig.db,
          appwriteConfig.col.chatrooms,
          room.$id
        );

        deletedCount++;
        console.log(
          `✅ Deleted inactive chat room: ${room.title} (ID: ${room.$id})`
        );
      } catch (roomError) {
        console.error(`❌ Error deleting chat room ${room.$id}:`, roomError);
        errorCount++;
      }
    }

    console.log(
      `🧹 Cleanup complete: ${deletedCount} rooms deleted, ${errorCount} errors`
    );

    return { deleted: deletedCount, errors: errorCount };
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    return { deleted: 0, errors: 1 };
  }
}

/**
 * Checks if a specific chat room is inactive (no activity for 24 hours)
 */
export function isChatRoomInactive(lastUpdatedAt: string): boolean {
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

  const lastUpdate = new Date(lastUpdatedAt);
  return lastUpdate < twentyFourHoursAgo;
}

/**
 * Gets the time remaining before a chat room expires
 */
export function getTimeUntilExpiry(lastUpdatedAt: string): string {
  const lastUpdate = new Date(lastUpdatedAt);
  const expiryTime = new Date(lastUpdate.getTime() + 24 * 60 * 60 * 1000);
  const now = new Date();

  const diffMs = expiryTime.getTime() - now.getTime();

  if (diffMs <= 0) {
    return "Expired";
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  return `${minutes}m remaining`;
}
