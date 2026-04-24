"use client";

import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { MessageCircle, CornerDownRight, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Comment } from "@/api-client/services/EtlService";

interface CommentsPanelProps {
  comments: Comment[];
  onChange: (comments: Comment[]) => void;
  currentUserName: string;
  readOnly?: boolean;
}

/* ── helpers ──────────────────────────────────────────────── */
function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  "bg-violet-500", "bg-sky-500", "bg-emerald-500", "bg-amber-500",
  "bg-rose-500",   "bg-pink-500",  "bg-indigo-500",  "bg-teal-500",
];

function AvatarBubble({ name, xs = false }: { name: string; xs?: boolean }) {
  const idx = (name.charCodeAt(0) + name.length) % AVATAR_COLORS.length;
  return (
    <Avatar className={xs ? "h-5 w-5 shrink-0" : "h-7 w-7 shrink-0"}>
      <AvatarFallback
        className={`font-bold text-white ${AVATAR_COLORS[idx]} ${xs ? "text-[8px]" : "text-[10px]"}`}
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   CommentInput — simple text area, no mention feature
   ────────────────────────────────────────────────────────────────────────── */
interface CommentInputProps {
  placeholder?: string;
  onSubmit: (text: string) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}

function CommentInput({
  placeholder = "Write a comment…",
  onSubmit,
  onCancel,
  autoFocus = false,
}: CommentInputProps) {
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus) setTimeout(() => ref.current?.focus(), 50);
  }, [autoFocus]);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative">
      <Textarea
        ref={ref}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="min-h-[76px] resize-none text-sm"
        rows={3}
      />

      <div className="flex items-center justify-between mt-4">
        <div className="flex gap-2">
          {onCancel && (
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="button" size="sm" onClick={handleSubmit} disabled={!text.trim()}>
            <Send className="h-3.5 w-3.5 mr-1.5" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   ReplyThread — renders one top-level comment card with its replies nested
   ────────────────────────────────────────────────────────────────────────── */
interface ReplyThreadProps {
  comment: Comment;
  replies: Comment[];
  onReply: (parentId: string, text: string) => void;
}

function ReplyThread({ comment, replies, onReply }: ReplyThreadProps) {
  const [replyOpen, setReplyOpen] = useState(false);

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* ── top-level comment ── */}
      <div className="flex gap-3 p-3.5">
        <AvatarBubble name={comment.author} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm font-semibold text-foreground">{comment.author}</span>
            <span className="text-[11px] text-muted-foreground ml-auto whitespace-nowrap">
              {comment.timestamp ? format(new Date(comment.timestamp), "MMM d 'at' HH:mm") : ""}
            </span>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed break-words">
            {comment.text}
          </p>
          {/* Reply toggle */}
          <button
            type="button"
            className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
            onClick={() => setReplyOpen((v) => !v)}
          >
            <CornerDownRight className="h-3 w-3" />
            {replyOpen
              ? "Cancel reply"
              : replies.length > 0
              ? `${replies.length} repl${replies.length === 1 ? "y" : "ies"} · Reply`
              : "Reply"}
          </button>
        </div>
      </div>

      {/* ── nested replies ── */}
      {replies.length > 0 && (
        <div className="border-t divide-y">
          {replies.map((reply, i) => (
            <div key={reply.id || `reply-${i}`} className="flex gap-2.5 px-3.5 py-2.5 bg-muted/20">
              {/* visual connector */}
              <div className="flex flex-col items-center pt-1 shrink-0">
                <div className="w-3.5 h-3 border-l-2 border-b-2 border-muted-foreground/20 rounded-bl-sm" />
              </div>
              <AvatarBubble name={reply.author} xs />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-xs font-semibold text-foreground">{reply.author}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto whitespace-nowrap">
                    {reply.timestamp ? format(new Date(reply.timestamp), "MMM d 'at' HH:mm") : ""}
                  </span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed break-words">
                  {reply.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── reply input ── */}
      {replyOpen && (
        <div className="border-t p-3.5 bg-muted/10">
          <CommentInput
            placeholder={`Reply to ${comment.author}…`}
            onSubmit={(replyText) => {
              onReply(comment.id, replyText);
              setReplyOpen(false);
            }}
            onCancel={() => setReplyOpen(false)}
            autoFocus
          />
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   CommentsPanel — public export
   ────────────────────────────────────────────────────────────────────────── */
export function CommentsPanel({
  comments,
  onChange,
  currentUserName,
  readOnly = false,
}: CommentsPanelProps) {
  /* Only top-level comments are threads; replies are children */
  const topLevel = comments.filter((c) => !c.parentId);
  const getReplies = (parentId: string) =>
    comments.filter((c) => c.parentId === parentId);

  /* Build and append a new comment/reply */
  const addComment = (text: string, parentId?: string) => {
    const newComment: Comment = {
      id: crypto.randomUUID(),
      text,
      author: currentUserName,
      timestamp: new Date().toISOString(),
      parentId: parentId ?? undefined,
    };
    onChange([...comments, newComment]);
  };

  const totalReplies = comments.length - topLevel.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">
          Comments
          {comments.length > 0 && (
            <span className="ml-1.5 text-muted-foreground font-normal text-xs">
              ({topLevel.length} thread{topLevel.length !== 1 ? "s" : ""}
              {totalReplies > 0 ? `, ${totalReplies} repl${totalReplies !== 1 ? "ies" : "y"}` : ""})
            </span>
          )}
        </p>
      </div>

      {/* Thread list */}
      {topLevel.length > 0 ? (
        <ScrollArea className="max-h-[360px]">
          <div className="space-y-3 pr-2 pb-1">
            {topLevel.map((comment, i) => (
              <ReplyThread
                key={comment.id || `comment-${i}`}
                comment={comment}
                replies={getReplies(comment.id)}
                onReply={(pid, text) => addComment(text, pid)}
              />
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="rounded-lg border border-dashed bg-muted/10 py-7 text-center text-sm text-muted-foreground">
          <MessageCircle className="h-6 w-6 mx-auto mb-2 opacity-30" />
          No comments yet — be the first to comment.
        </div>
      )}

      {/* New comment input */}
      {!readOnly && (
        <div className="pt-1">
          <CommentInput
            onSubmit={(text) => addComment(text)}
          />
        </div>
      )}
    </div>
  );
}
