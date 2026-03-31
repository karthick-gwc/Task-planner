/**
 * TaskComments.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Displays and manages comments for a single task.
 * Usage:
 *   <TaskComments taskId={task.id} />
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Loader2, Trash2, MessageSquare, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '../../hooks/useAppRedux';
import { CommentService } from '../../services/domoDataService';
import { formatRelative, cn } from '../utils';

interface Comment {
  id: string;
  taskId: string;
  userId: string;
  text: string;
  createdAt: string;
}

// ─── Helper: get initials from a name ────────────────────────────────────────
function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ─── Avatar colours (deterministic by userId) ─────────────────────────────────
const AVATAR_COLORS = [
  'bg-brand-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-sky-600',
  'bg-violet-600',
];

function avatarColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash += userId.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface TaskCommentsProps {
  taskId: string;
}

// ═════════════════════════════════════════════════════════════════════════════

export function TaskComments({ taskId }: TaskCommentsProps) {
  const currentUser = useAppSelector((s) => s.auth.user);

  const [comments,    setComments]    = useState<Comment[]>([]);
  const [text,        setText]        = useState('');
  const [loading,     setLoading]     = useState(true);
  const [sending,     setSending]     = useState(false);
  const [deletingId,  setDeletingId]  = useState<string | null>(null);
  const [error,       setError]       = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Load comments ───────────────────────────────────────────────────────────
  const loadComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await CommentService.getByTask(taskId);
      setComments(data);
    } catch {
      setError('Failed to load comments. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (taskId) loadComments();
  }, [taskId, loadComments]);

  // ── Scroll to bottom on new comment ────────────────────────────────────────
  useEffect(() => {
    if (!loading) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments.length, loading]);

  // ── Submit comment ──────────────────────────────────────────────────────────
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !currentUser?.id || sending) return;

    setSending(true);
    setError(null);

    // Optimistic add
    const optimistic: Comment = {
      id:        `optimistic-${Date.now()}`,
      taskId,
      userId:    currentUser.id,
      text:      trimmed,
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [...prev, optimistic]);
    setText('');

    try {
      const saved = await CommentService.create(taskId, currentUser.id, trimmed);
      // Replace optimistic with real document (has Domo-generated id)
      setComments((prev) =>
        prev.map((c) => (c.id === optimistic.id ? saved : c))
      );
    } catch {
      // Roll back optimistic comment
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
      setText(trimmed);
      setError('Failed to send comment. Please try again.');
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  // ── Delete comment ──────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (deletingId) return;
    // Optimistic removal
    setComments((prev) => prev.filter((c) => c.id !== id));
    setDeletingId(id);
    try {
      await CommentService.delete(id);
    } catch {
      // Reload to restore state if delete failed
      await loadComments();
      setError('Failed to delete comment.');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Keyboard submit (Ctrl/Cmd + Enter) ─────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-[var(--text-muted)]" />
          <span className="text-sm font-semibold text-[var(--text)]">Comments</span>
          {comments.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-[var(--surface-3)] text-[var(--text-muted)] text-[10px] font-medium">
              {comments.length}
            </span>
          )}
        </div>
        <button
          onClick={loadComments}
          disabled={loading}
          className="h-7 w-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-3)] transition-all disabled:opacity-40"
          aria-label="Refresh comments"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
        </button>
      </div>

      {/* ── Comment list ── */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 min-h-0">

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-[var(--surface-3)] shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 rounded bg-[var(--surface-3)]" />
                  <div className="h-10 w-full rounded-xl bg-[var(--surface-3)]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <span className="flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-400/70 hover:text-red-400 transition-colors text-xs underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && comments.length === 0 && !error && (
          <div className="flex flex-col items-center gap-2 py-10 text-[var(--text-muted)]">
            <MessageSquare className="h-8 w-8 opacity-20" />
            <p className="text-sm">No comments yet</p>
            <p className="text-xs opacity-60">Be the first to comment</p>
          </div>
        )}

        {/* Comments */}
        <AnimatePresence initial={false}>
          {!loading && comments.map((comment) => {
            const isOwn = comment.userId === currentUser?.id;

            return (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'flex gap-3 group',
                  isOwn && 'flex-row-reverse'
                )}
              >
                {/* Avatar */}
                <div className={cn(
                  'h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white',
                  avatarColor(comment.userId)
                )}>
                  {currentUser && isOwn
                    ? initials(currentUser.name)
                    : initials(comment.userId)
                  }
                </div>

                {/* Bubble */}
                <div className={cn(
                  'flex flex-col max-w-[75%]',
                  isOwn && 'items-end'
                )}>
                  {/* Meta row */}
                  <div className={cn(
                    'flex items-center gap-2 mb-1',
                    isOwn && 'flex-row-reverse'
                  )}>
                    <span className="text-xs font-medium text-[var(--text)]">
                      {isOwn ? 'You' : comment.userId}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {formatRelative(comment.createdAt)}
                    </span>
                    {/* Delete button — own comments only */}
                    {isOwn && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        disabled={!!deletingId}
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 flex items-center justify-center rounded text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30"
                        aria-label="Delete comment"
                      >
                        {deletingId === comment.id
                          ? <Loader2 className="h-3 w-3 animate-spin" />
                          : <Trash2 className="h-3 w-3" />
                        }
                      </button>
                    )}
                  </div>

                  {/* Text bubble */}
                  <div className={cn(
                    'px-3 py-2 rounded-2xl text-sm leading-relaxed break-words',
                    isOwn
                      ? 'bg-brand-600 text-white rounded-tr-sm'
                      : 'bg-[var(--surface-3)] text-[var(--text)] rounded-tl-sm',
                    comment.id.startsWith('optimistic-') && 'opacity-60'
                  )}>
                    {comment.text}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* ── Compose area ── */}
      <div className="shrink-0 border-t border-[var(--border)] p-4">
        <div className="flex gap-2 items-end">

          {/* Current user avatar */}
          {currentUser && (
            <div className={cn(
              'h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white mb-0.5',
              avatarColor(currentUser.id)
            )}>
              {initials(currentUser.name)}
            </div>
          )}

          {/* Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                // Auto-grow
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder="Add a comment… (Ctrl+Enter to send)"
              rows={1}
              className={cn(
                'w-full resize-none rounded-xl border bg-[var(--surface-2)] text-[var(--text)]',
                'placeholder:text-[var(--text-muted)] text-sm px-3 py-2 outline-none',
                'border-[var(--border)] focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
                'transition-all duration-150 min-h-[38px]'
              )}
            />
          </div>

          {/* Send button */}
          <button
            onClick={() => handleSubmit()}
            disabled={!text.trim() || sending || !currentUser}
            className={cn(
              'h-9 w-9 flex items-center justify-center rounded-xl transition-all shrink-0',
              text.trim() && !sending
                ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/30'
                : 'bg-[var(--surface-3)] text-[var(--text-muted)] cursor-not-allowed',
              'disabled:opacity-50'
            )}
            aria-label="Send comment"
          >
            {sending
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Send className="h-4 w-4" />
            }
          </button>
        </div>

        <p className="text-[10px] text-[var(--text-muted)] mt-1.5 ml-10 opacity-60">
          Ctrl+Enter to send
        </p>
      </div>
    </div>
  );
}
