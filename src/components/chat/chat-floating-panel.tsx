"use client";

import React, { useState, useEffect } from "react";
import { MessageCircle, X, ChevronDown } from "lucide-react";
import { ChatBox } from "./chat-box";
import { ChatRoomList } from "./chat-room-list";
import type { ChatRoom } from "@/app/chat/actions";
import { getChatRooms } from "@/app/chat/actions";

interface ChatFloatingPanelProps {
  accessToken: string;
  currentUserId: string;
  isCustomerSupport: boolean;
  isCandidate: boolean;
}

export function ChatFloatingPanel({
  accessToken,
  currentUserId,
  isCustomerSupport,
  isCandidate,
}: ChatFloatingPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [candidateRoom, setCandidateRoom] = useState<ChatRoom | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isCandidate && !isCustomerSupport && !candidateRoom) {
      getChatRooms().then((rooms) => {
        if (rooms.length > 0) {
          setCandidateRoom(rooms[0]);
          if (!isOpen) setSelectedRoom(rooms[0]);
        }
      });
    }
  }, [isCandidate, isCustomerSupport, candidateRoom, isOpen]);

  if (!isCustomerSupport && !isCandidate) return null;

  const showingRoom = isCustomerSupport ? selectedRoom : candidateRoom;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Expanded panel */}
      {isOpen && (
        <div
          className="flex flex-col shadow-2xl rounded-2xl overflow-hidden border bg-background"
          style={{
            width: "min(480px, calc(100vw - 48px))",
            height: "min(680px, calc(100vh - 120px))",
          }}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground shrink-0">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 opacity-80" />
              <span className="font-semibold text-sm">
                {showingRoom ? showingRoom.folderName : "Chat"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                title="Minimise"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {isCustomerSupport ? (
              selectedRoom ? (
                <ChatBox
                  room={selectedRoom}
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
            ) : candidateRoom ? (
              <ChatBox
                room={candidateRoom}
                accessToken={accessToken}
                currentUserId={currentUserId}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                Loading chat…
              </div>
            )}
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center hover:bg-primary/90 transition-all active:scale-95"
        title={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>
    </div>
  );
}
