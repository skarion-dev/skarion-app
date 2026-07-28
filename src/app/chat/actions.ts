"use server";

import { auth } from "@/auth";
import { getApiUrl } from "@/lib/utils";

async function getAuthHeaders() {
  const session = await auth();
  return {
    Authorization: `Bearer ${(session as any)?.accessToken ?? ""}`,
    "Content-Type": "application/json",
  };
}

export interface ChatUser {
  id: string;
  name: string;
  image?: string;
  username: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  sender?: ChatUser;
  text?: string;
  fileUrl?: string;
  fileName?: string;
  parentId?: string;
  parent?: ChatMessage;
  createdAt: string;
}

export interface ChatRoom {
  id: string;
  candidateId: string;
  folderName: string;
  sharepointFolderUrl: string;
  createdAt: string;
  candidate?: {
    id: string;
    name: string;
  };
  members?: ChatUser[];
}

export async function getChatRooms(): Promise<ChatRoom[]> {
  const headers = await getAuthHeaders();
  try {
    const res = await fetch(getApiUrl("/chat/rooms"), {
      headers,
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getChatMessages(roomId: string): Promise<ChatMessage[]> {
  const headers = await getAuthHeaders();
  try {
    const res = await fetch(getApiUrl(`/chat/rooms/${roomId}/messages`), {
      headers,
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}
