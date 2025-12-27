interface ChatRoom {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
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
