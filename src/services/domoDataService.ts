/**
 * domoDataService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Type-safe wrapper around DomoApi for every collection used in this project:
 *   • tasks
 *   • users_meta
 *   • notifications
 *   • comments
 *
 * DomoApi (domoAPI.js) is plain JavaScript — all its methods return Promise<any>.
 * This service types the results at the boundary using mapper functions so the
 * rest of the app works with plain typed Task / User / Notification / Comment
 * objects.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import DomoApi from '../API/domoAPI';
import type { Task, User, Notification } from '../components/types';

// ─── Collection names (must match manifest.json exactly) ─────────────────────
const COLLECTIONS = {
  TASKS:         'tasks',
  USERS_META:    'users_meta',
  NOTIFICATIONS: 'notifications',
  COMMENTS:      'comments',
} as const;

// ─── Comment type (not in global types yet) ───────────────────────────────────
export interface Comment {
  id:        string;
  taskId:    string;
  userId:    string;
  text:      string;
  createdAt: string;
}

// ─── Utility helpers ─────────────────────────────────────────────────────────

function safeJsonParse<T>(value: unknown, fallback: T): T {
  if (!value || typeof value !== 'string') return fallback;
  try   { return JSON.parse(value) as T; }
  catch { return fallback; }
}

function str(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}

function num(v: unknown, fallback = 0): number {
  return typeof v === 'number' ? v : fallback;
}

// ─── Mappers: raw Domo document (any) → typed app model ──────────────────────
// Domo AppDB returns { id: string, content: { ...yourFields } }
// domoAPI.js is plain JS so all returns are `any` — we type at this boundary.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDocToTask(doc: any): Task {
  const c = doc?.content ?? {};
  return {
    id:           str(doc?.id),
    title:        str(c.title),
    description:  str(c.description),
    priority:     str(c.priority,   'medium')  as Task['priority'],
    status:       str(c.status,     'pending') as Task['status'],
    category:     str(c.category,   'work')    as Task['category'],
    due_date:     str(c.due_date,   new Date().toISOString()),
    assigned_to:  str(c.assigned_to),
    created_by:   str(c.created_by),
    recurrence:   str(c.recurrence, 'none')    as Task['recurrence'],
    tags:         safeJsonParse<string[]>(c.tags,         []),
    dependencies: safeJsonParse<string[]>(c.dependencies, []),
    progress:     num(c.progress),
    createdAt:    str(c.createdAt,  new Date().toISOString()),
    updatedAt:    str(c.updatedAt,  new Date().toISOString()),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDocToUser(doc: any): User {
  const c = doc?.content ?? {};
  return {
    id:        str(c.userId,   str(doc?.id)),
    name:      str(c.displayName),
    email:     str(c.email),
    role:      str(c.role, 'employee') as User['role'],
    avatar:    str(c.avatarKey),
    createdAt: str(c.createdAt, new Date().toISOString()),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDocToNotification(doc: any): Notification {
  const c = doc?.content ?? {};
  return {
    id:        str(doc?.id),
    title:     str(c.title),
    message:   str(c.message),
    type:      str(c.type, 'info') as Notification['type'],
    read:      c.read === 1,
    createdAt: str(c.createdAt, new Date().toISOString()),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDocToComment(doc: any): Comment {
  const c = doc?.content ?? {};
  return {
    id:        str(doc?.id),
    taskId:    str(c.taskId),
    userId:    str(c.userId),
    text:      str(c.text),
    createdAt: str(c.createdAt, new Date().toISOString()),
  };
}

// ─── Mappers: app model → raw Domo content ────────────────────────────────────

function taskToRaw(task: Omit<Task, 'id'>): Record<string, unknown> {
  return {
    title:        task.title,
    description:  task.description  ?? '',
    priority:     task.priority,
    status:       task.status,
    category:     task.category,
    due_date:     task.due_date,
    assigned_to:  task.assigned_to  ?? '',
    created_by:   task.created_by,
    recurrence:   task.recurrence,
    tags:         JSON.stringify(task.tags         ?? []),
    dependencies: JSON.stringify(task.dependencies ?? []),
    progress:     task.progress     ?? 0,
    createdAt:    task.createdAt,
    updatedAt:    task.updatedAt,
  };
}

function notificationToRaw(
  n: Omit<Notification, 'id'>,
  userId: string,
  taskId: string
): Record<string, unknown> {
  return {
    title:     n.title,
    message:   n.message,
    type:      n.type,
    read:      n.read ? 1 : 0,
    userId,
    taskId,
    createdAt: n.createdAt ?? new Date().toISOString(),
  };
}

// ═════════════════════════════════════════════════════════════════════════════
//  TASKS
// ═════════════════════════════════════════════════════════════════════════════

export const TaskService = {

  /** Fetch all tasks from Domo AppDB */
  async getAll(): Promise<Task[]> {
    const docs = await DomoApi.ListDocuments(COLLECTIONS.TASKS);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Array.isArray(docs) ? (docs as any[]).map(mapDocToTask) : [];
  },

  /** Fetch a single task by its Domo document id */
  async getById(id: string): Promise<Task> {
    const doc = await DomoApi.GetDocument(COLLECTIONS.TASKS, id);
    return mapDocToTask(doc);
  },

  /** Fetch tasks filtered by status */
  async getByStatus(status: Task['status']): Promise<Task[]> {
    const docs = await DomoApi.QueryDocument(
      COLLECTIONS.TASKS,
      { 'content.status': { $eq: status } }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Array.isArray(docs) ? (docs as any[]).map(mapDocToTask) : [];
  },

  /** Fetch tasks assigned to a specific user */
  async getByAssignee(userId: string): Promise<Task[]> {
    const docs = await DomoApi.QueryDocument(
      COLLECTIONS.TASKS,
      { 'content.assigned_to': { $eq: userId } }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Array.isArray(docs) ? (docs as any[]).map(mapDocToTask) : [];
  },

  /** Fetch tasks created by a specific user */
  async getByCreator(userId: string): Promise<Task[]> {
    const docs = await DomoApi.QueryDocument(
      COLLECTIONS.TASKS,
      { 'content.created_by': { $eq: userId } }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Array.isArray(docs) ? (docs as any[]).map(mapDocToTask) : [];
  },

  /** Create a new task — returns the created Task with its Domo-generated id */
  async create(task: Omit<Task, 'id'>): Promise<Task> {
    const raw = taskToRaw(task);
    const doc = await DomoApi.CreateDocument(COLLECTIONS.TASKS, raw);
    return mapDocToTask(doc);
  },

  /** Full update — fetches current, merges updates, writes back */
  async update(id: string, updates: Partial<Omit<Task, 'id'>>): Promise<Task> {
    const current = await TaskService.getById(id);
    const merged: Omit<Task, 'id'> = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    const raw = taskToRaw(merged);
    const doc = await DomoApi.UpdateDocument(COLLECTIONS.TASKS, id, raw);
    return mapDocToTask(doc);
  },

  /** Update only the status field — used by Kanban move */
  async updateStatus(id: string, status: Task['status']): Promise<Task> {
    return TaskService.update(id, { status });
  },

  /** Update only the progress field (0–100) */
  async updateProgress(id: string, progress: number): Promise<Task> {
    return TaskService.update(id, { progress });
  },

  /** Delete a single task */
  async delete(id: string): Promise<void> {
    await DomoApi.DeleteDocument(COLLECTIONS.TASKS, id);
  },

  /** Delete multiple tasks at once */
  async deleteMany(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    await DomoApi.BulkDeleteDocuments(COLLECTIONS.TASKS, ids.join(','));
  },
};

// ═════════════════════════════════════════════════════════════════════════════
//  USERS META
// ═════════════════════════════════════════════════════════════════════════════

export const UserMetaService = {

  /** Fetch all user meta records */
  async getAll(): Promise<User[]> {
    const docs = await DomoApi.ListDocuments(COLLECTIONS.USERS_META);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Array.isArray(docs) ? (docs as any[]).map(mapDocToUser) : [];
  },

  /** Find the users_meta record for a given Domo userId */
  async getByUserId(userId: string): Promise<User | null> {
    const docs = await DomoApi.QueryDocument(
      COLLECTIONS.USERS_META,
      { 'content.userId': { $eq: userId } }
    );
    if (!Array.isArray(docs) || docs.length === 0) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return mapDocToUser((docs as any[])[0]);
  },

  /**
   * Upsert: update the record if one exists for this userId,
   * otherwise create a new document.
   */
  async upsert(user: User): Promise<User> {
    const docs = await DomoApi.QueryDocument(
      COLLECTIONS.USERS_META,
      { 'content.userId': { $eq: user.id } }
    );

    const raw: Record<string, unknown> = {
      userId:      user.id,
      displayName: user.name,
      email:       user.email,
      role:        user.role,
      avatarKey:   user.avatar ?? '',
      createdAt:   user.createdAt,
    };

    if (Array.isArray(docs) && docs.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existingId = str((docs as any[])[0]?.id);
      const doc = await DomoApi.UpdateDocument(
        COLLECTIONS.USERS_META, existingId, raw
      );
      return mapDocToUser(doc);
    }

    const doc = await DomoApi.CreateDocument(COLLECTIONS.USERS_META, raw);
    return mapDocToUser(doc);
  },

  /** Delete a users_meta document by its Domo document id */
  async delete(docId: string): Promise<void> {
    await DomoApi.DeleteDocument(COLLECTIONS.USERS_META, docId);
  },
};

// ═════════════════════════════════════════════════════════════════════════════
//  NOTIFICATIONS
// ═════════════════════════════════════════════════════════════════════════════

export const NotificationService = {

  /** Fetch notifications for a user (newest first, max 50) */
  async getByUser(userId: string): Promise<Notification[]> {
    const docs = await DomoApi.QueryDocument(
      COLLECTIONS.NOTIFICATIONS,
      { 'content.userId': { $eq: userId } },
      { orderby: 'content.createdAt desc', limit: 50 }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Array.isArray(docs) ? (docs as any[]).map(mapDocToNotification) : [];
  },

  /** Fetch only unread notifications for a user */
  async getUnreadByUser(userId: string): Promise<Notification[]> {
    const docs = await DomoApi.QueryDocument(
      COLLECTIONS.NOTIFICATIONS,
      {
        $and: [
          { 'content.userId': { $eq: userId } },
          { 'content.read':   { $eq: 0 } },
        ],
      }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Array.isArray(docs) ? (docs as any[]).map(mapDocToNotification) : [];
  },

  /** Create a notification document */
  async create(
    notification: Omit<Notification, 'id'>,
    userId: string,
    taskId = ''
  ): Promise<Notification> {
    const raw = notificationToRaw(notification, userId, taskId);
    const doc = await DomoApi.CreateDocument(COLLECTIONS.NOTIFICATIONS, raw);
    return mapDocToNotification(doc);
  },

  /** Mark a single notification as read */
  async markRead(id: string): Promise<void> {
    const doc = await DomoApi.GetDocument(COLLECTIONS.NOTIFICATIONS, id);
    const c = doc?.content?? {};
    await DomoApi.UpdateDocument(COLLECTIONS.NOTIFICATIONS, id, {
      ...c,
      read: 1,
    });
  },

  /** Mark all unread notifications as read for a given user */
  async markAllRead(userId: string): Promise<void> {
    const docs = await DomoApi.QueryDocument(
      COLLECTIONS.NOTIFICATIONS,
      {
        $and: [
          { 'content.userId': { $eq: userId } },
          { 'content.read':   { $eq: 0 } },
        ],
      }
    );
    if (!Array.isArray(docs) || docs.length === 0) return;
    await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (docs as any[]).map((doc: any) =>
        DomoApi.UpdateDocument(
          COLLECTIONS.NOTIFICATIONS,
          str(doc?.id),
          { ...(doc?.content ?? {}), read: 1 }
        )
      )
    );
  },

  /** Delete a single notification */
  async delete(id: string): Promise<void> {
    await DomoApi.DeleteDocument(COLLECTIONS.NOTIFICATIONS, id);
  },

  /** Delete all notifications belonging to a user */
  async deleteAllForUser(userId: string): Promise<void> {
    const docs = await DomoApi.QueryDocument(
      COLLECTIONS.NOTIFICATIONS,
      { 'content.userId': { $eq: userId } }
    );
    if (!Array.isArray(docs) || docs.length === 0) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ids = (docs as any[])
      .map((d: any) => str(d?.id))
      .filter(Boolean)
      .join(',');
    if (ids) await DomoApi.BulkDeleteDocuments(COLLECTIONS.NOTIFICATIONS, ids);
  },
};

// ═════════════════════════════════════════════════════════════════════════════
//  COMMENTS
// ═════════════════════════════════════════════════════════════════════════════

export const CommentService = {

  /** Fetch all comments for a task, oldest first */
  async getByTask(taskId: string): Promise<Comment[]> {
    const docs = await DomoApi.QueryDocument(
      COLLECTIONS.COMMENTS,
      { 'content.taskId': { $eq: taskId } },
      { orderby: 'content.createdAt asc' }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Array.isArray(docs) ? (docs as any[]).map(mapDocToComment) : [];
  },

  /** Add a comment to a task */
  async create(taskId: string, userId: string, text: string): Promise<Comment> {
    const raw: Record<string, unknown> = {
      taskId,
      userId,
      text,
      createdAt: new Date().toISOString(),
    };
    const doc = await DomoApi.CreateDocument(COLLECTIONS.COMMENTS, raw);
    return mapDocToComment(doc);
  },

  /** Delete a single comment */
  async delete(id: string): Promise<void> {
    await DomoApi.DeleteDocument(COLLECTIONS.COMMENTS, id);
  },

  /** Delete all comments for a task (call this when deleting a task) */
  async deleteAllForTask(taskId: string): Promise<void> {
    const docs = await DomoApi.QueryDocument(
      COLLECTIONS.COMMENTS,
      { 'content.taskId': { $eq: taskId } }
    );
    if (!Array.isArray(docs) || docs.length === 0) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ids = (docs as any[])
      .map((d: any) => str(d?.id))
      .filter(Boolean)
      .join(',');
    if (ids) await DomoApi.BulkDeleteDocuments(COLLECTIONS.COMMENTS, ids);
  },
};