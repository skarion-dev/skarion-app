"use client";

import React, { useEffect, useState } from "react";
import type { ChatRoom } from "@/app/chat/actions";
import { getChatRooms } from "@/app/chat/actions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";

interface ChatRoomListProps {
  onSelectRoom: (room: ChatRoom) => void;
  selectedRoomId?: string;
}

export function ChatRoomList({ onSelectRoom, selectedRoomId }: ChatRoomListProps) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getChatRooms()
      .then((data) => setRooms(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">Loading chats...</div>
        ) : rooms.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">No candidate chats yet.</div>
        ) : (
          <div className="flex flex-col">
            {rooms.map((room) => {
              const isSelected = room.id === selectedRoomId;
              return (
                <button
                  key={room.id}
                  onClick={() => onSelectRoom(room)}
                  className={`flex flex-col items-start p-3 border-b text-left transition-colors hover:bg-muted/50 ${
                    isSelected ? "bg-muted" : ""
                  }`}
                >
                  <div className="font-medium text-sm line-clamp-1">{room.folderName}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    Click to view chat
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
