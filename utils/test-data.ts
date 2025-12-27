import { ChatRoom } from "./types";

export const chatRooms: ChatRoom[] = [
  {
    id: "1",
    title: "General Chat",
    description: "A place for general discussions",
    createdAt: new Date("2023-01-01T10:00:00Z"),
    updatedAt: new Date("2023-01-02T12:00:00Z"),
  },
  {
    id: "2",
    title: "Tech Talk",
    description: "Discuss the latest in technology",
    createdAt: new Date("2023-02-01T11:00:00Z"),
    updatedAt: new Date("2023-02-02T13:00:00Z"),
  },
  {
    id: "3",
    title: "Random",
    description: "Off-topic conversations",
    createdAt: new Date("2023-03-01T09:30:00Z"),
    updatedAt: new Date("2023-03-02T10:30:00Z"),
  },
];
