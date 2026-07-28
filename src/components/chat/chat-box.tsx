"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import {
  Send,
  Paperclip,
  X,
  Reply,
  ArrowLeft,
  ExternalLink,
  ImageIcon,
  FileText,
} from "lucide-react";
import { getApiUrl } from "@/lib/utils";
import type { ChatRoom, ChatMessage } from "@/app/chat/actions";
import { getChatMessages } from "@/app/chat/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatBoxProps {
  room: ChatRoom;
  accessToken: string;
  currentUserId: string;
  onBack?: () => void;
  isCsView?: boolean;
}

interface StagedFile {
  file: File;
  localUrl: string; // blob URL for preview
  isImage: boolean;
}

function getFileExtension(fileName: string) {
  return fileName?.split(".").pop()?.toLowerCase() ?? "";
}

function isImageFile(fileName: string) {
  return ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(
    getFileExtension(fileName)
  );
}

/** Renders a sent message's file attachment */
function FilePreview({
  fileUrl,
  fileName,
  isMe,
}: {
  fileUrl: string;
  fileName: string;
  isMe: boolean;
}) {
  const ext = getFileExtension(fileName);

  if (isImageFile(fileName)) {
    return (
      <a
        href={fileUrl}
        target="_blank"
        rel="noreferrer"
        className="block mt-2 group/img"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fileUrl}
          alt={fileName}
          className="max-w-[240px] max-h-[180px] rounded-xl object-cover border border-black/10 group-hover/img:opacity-90 transition-opacity shadow-sm"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <span className="text-[10px] mt-1 flex items-center gap-1 opacity-60">
          <ExternalLink className="h-2.5 w-2.5" />
          {fileName}
        </span>
      </a>
    );
  }

  const docColors: Record<string, string> = {
    pdf: "bg-red-500",
    doc: "bg-blue-500",
    docx: "bg-blue-500",
    xls: "bg-green-600",
    xlsx: "bg-green-600",
    ppt: "bg-orange-500",
    pptx: "bg-orange-500",
    txt: "bg-gray-500",
    csv: "bg-teal-500",
    zip: "bg-purple-500",
    rar: "bg-purple-500",
  };
  const dotColor = docColors[ext] ?? "bg-gray-400";

  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noreferrer"
      className={`flex items-center gap-2.5 mt-2 px-3 py-2.5 rounded-xl border hover:opacity-80 transition-opacity max-w-[240px] ${
        isMe
          ? "bg-white/15 border-white/20 text-primary-foreground"
          : "bg-background border-border text-foreground"
      }`}
    >
      <div
        className={`${dotColor} text-white rounded-md px-1.5 py-1 text-[10px] font-bold uppercase leading-none shrink-0`}
      >
        {ext || "file"}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium truncate max-w-[160px]">{fileName}</p>
        <p
          className={`text-[10px] mt-0.5 flex items-center gap-1 ${
            isMe ? "text-primary-foreground/60" : "text-muted-foreground"
          }`}
        >
          <ExternalLink className="h-2.5 w-2.5" />
          Open file
        </p>
      </div>
    </a>
  );
}

export function ChatBox({
  room,
  accessToken,
  currentUserId,
  onBack,
  isCsView,
}: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [stagedFile, setStagedFile] = useState<StagedFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [connected, setConnected] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history + connect socket
  useEffect(() => {
    getChatMessages(room.id).then((msgs) => setMessages(msgs));

    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
      "http://localhost:5001";

    // Connect to the /chat namespace
    // NOTE: omit transports so socket.io can use polling → websocket upgrade
    const socket = io(`${baseUrl}/chat`, {
      path: "/socket.io",
      withCredentials: true,
      auth: { token: accessToken },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Chat] Connected, joining room", room.id);
      setConnected(true);
      socket.emit("chat:join", room.id);
    });

    socket.on("connect_error", (err) => {
      console.error("[Chat] Connect error:", err.message);
    });

    socket.on("disconnect", () => setConnected(false));

    socket.io.on("reconnect", () => {
      socket.emit("chat:join", room.id);
    });

    socket.on("chat:message", (message: ChatMessage) => {
      setMessages((prev) => {
        // Skip exact duplicates
        if (prev.find((m) => m.id === message.id)) return prev;
        // Remove matching optimistic placeholder
        const withoutOptimistic = prev.filter((m) => {
          if (!m.id.startsWith("optimistic-")) return true;
          if (m.senderId !== message.senderId) return true;
          if (message.text && m.text === message.text) return false;
          if (message.fileName && m.fileName === message.fileName) return false;
          return true;
        });
        return [...withoutOptimistic, message];
      });
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.off("chat:message");
      socket.io.off("reconnect");
      socket.disconnect();
    };
  }, [room.id, accessToken]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Revoke blob URL when staged file changes
  useEffect(() => {
    return () => {
      if (stagedFile) URL.revokeObjectURL(stagedFile.localUrl);
    };
  }, [stagedFile]);

  /** Stage a file locally — shows preview, doesn't upload yet */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Revoke previous blob
    if (stagedFile) URL.revokeObjectURL(stagedFile.localUrl);
    setStagedFile({
      file,
      localUrl: URL.createObjectURL(file),
      isImage: isImageFile(file.name),
    });
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /** Clear the staged file without sending */
  const clearStagedFile = () => {
    if (stagedFile) URL.revokeObjectURL(stagedFile.localUrl);
    setStagedFile(null);
  };

  const handleSend = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      const trimmed = text.trim();
      const hasFile = !!stagedFile;
      if (!trimmed && !hasFile) return;

      // ── Send text message optimistically ──────────────────────────────────
      if (trimmed) {
        const optimisticMsg: ChatMessage = {
          id: `optimistic-${Date.now()}`,
          roomId: room.id,
          senderId: currentUserId,
          text: trimmed,
          parentId: replyingTo?.id,
          parent: replyingTo ?? undefined,
          createdAt: new Date().toISOString(),
          sender: { id: currentUserId, name: "You", username: "" },
        };
        setMessages((prev) => [...prev, optimisticMsg]);
        setText("");
        if (inputRef.current) inputRef.current.style.height = "auto";

        try {
          await fetch(getApiUrl(`/chat/rooms/${room.id}/messages`), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ text: trimmed, parentId: replyingTo?.id }),
          });
        } catch (err) {
          console.error("Failed to send message", err);
          setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
        }
      }

      // ── Upload staged file (optimistic: show local blob immediately) ──────
      if (hasFile && stagedFile) {
        setUploading(true);
        const fileName = stagedFile.file.name;
        const localUrl = stagedFile.localUrl;
        const formData = new FormData();
        formData.append("file", stagedFile.file);
        if (replyingTo) formData.append("parentId", replyingTo.id);

        // Show optimistic file message immediately using local blob URL
        const optimisticFileMsg: ChatMessage = {
          id: `optimistic-file-${Date.now()}`,
          roomId: room.id,
          senderId: currentUserId,
          fileUrl: localUrl,
          fileName,
          parentId: replyingTo?.id,
          parent: replyingTo ?? undefined,
          createdAt: new Date().toISOString(),
          sender: { id: currentUserId, name: "You", username: "" },
        };
        setMessages((prev) => [...prev, optimisticFileMsg]);
        clearStagedFile();

        try {
          const res = await fetch(getApiUrl(`/chat/rooms/${room.id}/upload`), {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}` },
            body: formData,
          });
          if (!res.ok)
            console.error("Upload failed:", await res.json().catch(() => ({})));
        } catch (err) {
          console.error("Failed to upload file", err);
        } finally {
          setUploading(false);
        }
      }

      setReplyingTo(null);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text, stagedFile, replyingTo, room.id, accessToken, currentUserId]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Group consecutive messages from same sender
  const groupedMessages = messages.map((msg, i) => {
    const prev = messages[i - 1];
    const showAvatar = !prev || prev.senderId !== msg.senderId;
    const showName = !prev || prev.senderId !== msg.senderId;
    return { ...msg, showAvatar, showName };
  });

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const canSend = (text.trim().length > 0 || !!stagedFile) && !uploading;

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-background/95 backdrop-blur shrink-0">
        {isCsView && onBack && (
          <button
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1 rounded-md hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm truncate">{room.folderName}</p>
            <span
              className={`h-1.5 w-1.5 rounded-full shrink-0 transition-colors ${
                connected ? "bg-emerald-500" : "bg-muted-foreground/30"
              }`}
              title={connected ? "Connected" : "Reconnecting…"}
            />
          </div>
          {room.members && room.members.length > 0 && (
            <p className="text-xs text-muted-foreground truncate">
              {room.members.map((m) => m.name).join(", ")}
            </p>
          )}
        </div>
        {room.sharepointFolderUrl && (
          <a
            href={room.sharepointFolderUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground border rounded-md px-2 py-1 transition-colors shrink-0 flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            SharePoint
          </a>
        )}
      </div>

      {/* ── Messages (native scroll) ── */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto min-h-0 px-4 py-4"
      >
        <div className="flex flex-col gap-1">
          {groupedMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-sm text-muted-foreground">
              <span className="text-3xl">👋</span>
              No messages yet. Say hello!
            </div>
          )}

          {groupedMessages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            const isOptimistic = msg.id.startsWith("optimistic-");
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"} ${
                  msg.showName ? "mt-4" : "mt-0.5"
                }`}
              >
                {/* Sender name + time */}
                {msg.showName && (
                  <div
                    className={`flex items-center gap-1.5 mb-1 px-1 ${
                      isMe ? "flex-row-reverse" : ""
                    }`}
                  >
                    {msg.showAvatar && (
                      <Avatar className="h-6 w-6 shrink-0">
                        {msg.sender?.image ? (
                          <AvatarImage src={msg.sender.image} />
                        ) : (
                          <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                            {msg.sender?.name?.charAt(0) || "?"}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    )}
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {isMe ? "You" : msg.sender?.name || "Unknown"}
                    </span>
                    <span className="text-[10px] text-muted-foreground/50">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={`group relative flex items-end gap-1.5 max-w-[85%] ${
                    isMe ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed transition-opacity ${
                      isOptimistic ? "opacity-60" : "opacity-100"
                    } ${
                      isMe
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                    }`}
                  >
                    {/* Reply preview */}
                    {msg.parent && (
                      <div
                        className={`text-xs mb-2 px-2 py-1.5 rounded-lg border-l-2 ${
                          isMe
                            ? "border-white/40 bg-white/10 text-primary-foreground/80"
                            : "border-primary/40 bg-primary/5 text-muted-foreground"
                        }`}
                      >
                        <p className="font-semibold text-[10px] mb-0.5">
                          {msg.parent.sender?.name}
                        </p>
                        <p className="truncate max-w-[200px]">
                          {msg.parent.text ||
                            msg.parent.fileName ||
                            "Attachment"}
                        </p>
                      </div>
                    )}

                    {/* Text */}
                    {msg.text && (
                      <span className="whitespace-pre-wrap break-words">
                        {msg.text}
                      </span>
                    )}

                    {/* File / Image */}
                    {msg.fileUrl && msg.fileName && (
                      <FilePreview
                        fileUrl={msg.fileUrl}
                        fileName={msg.fileName}
                        isMe={isMe}
                      />
                    )}
                  </div>

                  {/* Reply on hover */}
                  {!isOptimistic && (
                    <button
                      onClick={() => {
                        setReplyingTo(msg);
                        inputRef.current?.focus();
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 mb-1"
                      title="Reply"
                    >
                      <Reply className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Sub-group time */}
                {!msg.showName && (
                  <span
                    className={`text-[9px] text-muted-foreground/40 px-1 mt-0.5 ${
                      isMe ? "text-right" : ""
                    }`}
                  >
                    {formatTime(msg.createdAt)}
                  </span>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Reply bar ── */}
      {replyingTo && (
        <div className="px-4 py-2 border-t bg-muted/30 flex items-center gap-2 shrink-0">
          <div className="w-0.5 h-8 rounded-full bg-primary/60 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-primary">
              Replying to {replyingTo.sender?.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {replyingTo.text
                ? replyingTo.text.slice(0, 70) +
                  (replyingTo.text.length > 70 ? "…" : "")
                : replyingTo.fileName}
            </p>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0 p-1 rounded hover:bg-muted"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ── Staged file preview tray ── */}
      {stagedFile && (
        <div className="px-3 pt-2 pb-0 shrink-0">
          <div className="relative inline-flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2 max-w-full">
            {stagedFile.isImage ? (
              /* Image thumbnail */
              <div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border border-black/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={stagedFile.localUrl}
                  alt={stagedFile.file.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <ImageIcon className="h-4 w-4 text-white" />
                </div>
              </div>
            ) : (
              /* Non-image chip */
              <div className="flex items-center gap-2 shrink-0">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
              </div>
            )}

            {/* File name + size */}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate max-w-[180px]">
                {stagedFile.file.name}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {(stagedFile.file.size / 1024).toFixed(1)} KB ·{" "}
                {stagedFile.isImage ? "Image" : "File"}
              </p>
              <p className="text-[10px] text-primary/80 font-medium mt-0.5">
                Press Send to attach →
              </p>
            </div>

            {/* Remove button */}
            <button
              onClick={clearStagedFile}
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-muted-foreground/20 hover:bg-destructive hover:text-white text-muted-foreground flex items-center justify-center transition-colors shrink-0"
              title="Remove file"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* ── Input bar ── */}
      <div className="px-3 py-3 border-t bg-background shrink-0">
        <div
          className={`flex items-end gap-2 bg-muted/40 rounded-xl border px-3 py-2 transition-colors ${
            uploading
              ? "border-border/40 opacity-70"
              : "border-border/60 focus-within:border-primary/50 focus-within:bg-muted/60"
          }`}
        >
          {/* File picker */}
          <label
            className={`cursor-pointer shrink-0 mb-0.5 transition-colors ${
              uploading
                ? "text-muted-foreground/40 cursor-not-allowed"
                : stagedFile
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
            }`}
            title="Attach file"
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <Paperclip className="h-4 w-4" />
          </label>

          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height =
                Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              uploading
                ? "Uploading…"
                : stagedFile
                  ? "Add a caption (optional)…"
                  : "Message… (Enter to send, Shift+Enter for new line)"
            }
            disabled={uploading}
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-sm placeholder:text-muted-foreground min-h-[24px] max-h-[120px] leading-6 py-0"
          />

          <button
            onClick={() => handleSend()}
            disabled={!canSend}
            className="shrink-0 mb-0.5 p-1.5 rounded-lg bg-primary text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-95 transition-all"
          >
            {uploading ? (
              <span className="h-3.5 w-3.5 block rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
