/**
 * IMPROVEMENT: Updated ChatRoom interface to match Appwrite document structure
 * - Changed from 'id' to '$id' (Appwrite's document ID field)
 * - Added Appwrite metadata fields ($collectionId, $databaseId, etc.)
 * - Changed Date types to string (Appwrite returns ISO date strings)
 */
interface ChatRoom {
  $id: string;
  $collectionId?: string;
  $databaseId?: string;
  $createdAt?: string;
  $updatedAt?: string;
  $permissions?: any[];
  title: string;
  description: string;
}

interface Message {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  $collectionId?: string;
  $databaseId?: string;
  $permissions?: any[];
  content: string;
  senderId: string;
  senderName: string;
  SenderPhoto: string;
  chatRoomId: string;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  imageUrl: string;
}

export type { ChatRoom, Message, User };
