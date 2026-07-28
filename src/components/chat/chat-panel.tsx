"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ChatBox } from "./chat-box";
import { ChatRoomList } from "./chat-room-list";
import type { ChatRoom } from "@/app/chat/actions";
import { getChatRooms } from "@/app/chat/actions";

interface ChatPanelProps {
  accessToken: string;
  currentUserId: string;
  isCustomerSupport: boolean;
  isCandidate: boolean;
}

export function ChatPanel({
  accessToken,
  currentUserId,
  isCustomerSupport,
  isCandidate,
}: ChatPanelProps) {
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [candidateRoom, setCandidateRoom] = useState<ChatRoom | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [loadingRoom, setLoadingRoom] = useState(false);

  // Load candidate's own room
  useEffect(() => {
    if (isCandidate && !isCustomerSupport && !candidateRoom) {
      setLoadingRoom(true);
      getChatRooms()
        .then((rooms) => {
          if (rooms.length > 0) {
            setCandidateRoom(rooms[0]);
            setSelectedRoom(rooms[0]);
          }
        })
        .finally(() => setLoadingRoom(false));
    }
  }, [isCandidate, isCustomerSupport, candidateRoom]);

  if (!isCustomerSupport && !isCandidate) return null;

  const activeRoom = isCustomerSupport ? selectedRoom : candidateRoom;

  return (
    <div
      className={`flex flex-col border-l bg-background transition-all duration-300 ease-in-out shrink-0 h-full ${
        collapsed ? "w-12" : "w-[380px]"
      }`}
      style={{ minHeight: 0 }}
    >
      {/* Collapse toggle + header */}
      <div className="flex items-center gap-2 px-3 py-3 border-b bg-muted/30 shrink-0">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
          title={collapsed ? "Expand chat" : "Collapse chat"}
        >
          {collapsed ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {!collapsed && (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <MessageSquare className="h-4 w-4 text-primary shrink-0" />
            <span className="font-semibold text-sm truncate">
              {isCustomerSupport
                ? selectedRoom
                  ? selectedRoom.folderName
                  : "Candidate Chats"
                : candidateRoom
                  ? candidateRoom.folderName
                  : "My Chat"}
            </span>
          </div>
        )}

        {collapsed && (
          <MessageSquare className="h-4 w-4 text-primary mx-auto" />
        )}
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="flex-1 overflow-hidden min-h-0">
          {isCustomerSupport ? (
            activeRoom ? (
              <ChatBox
                room={activeRoom}
                accessToken={accessToken}
                currentUserId={currentUserId}
                isCsView
                onBack={() => setSelectedRoom(null)}
              />
            ) : (
              <ChatRoomList
                onSelectRoom={(room) => setSelectedRoom(room)}
                selectedRoomId={undefined}
              />
            )
          ) : loadingRoom ? (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground gap-2">
              <span className="animate-pulse">Loading chat…</span>
            </div>
          ) : candidateRoom ? (
            <ChatBox
              room={candidateRoom}
              accessToken={accessToken}
              currentUserId={currentUserId}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
              <Users className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No chat assigned yet. A support agent will be in touch soon.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
