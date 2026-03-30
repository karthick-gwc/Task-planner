/*Type-safe wrapper around DomoApi for every collection used in this project:  • tasks  •  users_meta  •  notifications  •  comments
 */
import DomoApi from '../API/domoAPI';
import type { Task, User, Notification } from '../components/types';

const COLLECTIONS = {
  TASKS:         'tasks',
  USERS_META:    'users_meta',
  NOTIFICATIONS: 'notifications',
  COMMENTS:      'comments',
} as const;

export interface Comment {
  id:        string;
  taskId:    string;
  userId:    string;
  text:      string;
  createdAt: string;
}

// ─── Utility helpers ──────────────────────────────────────────────────────────

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


function simpleHash(password: string): string {
  return btoa(password + '_tf_salt_2026');
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDocToTask(doc: any): Task {
  const c = doc?.content ?? {};
  return {
    id:           str(doc?.id),
    title:        str(c.title),
    description:  str(c.description),
    priority:     str(c.priority,   'medium') as Task['priority'],
    status:       str(c.status,     'pending') as Task['status'],
    category:     str(c.category,   'work')   as Task['category'],
    due_date:     str(c.due_date,   new Date().toISOString()),
    assigned_to:  str(c.assigned_to),
    created_by:   str(c.created_by),
    recurrence:   str(c.recurrence, 'none')   as Task['recurrence'],
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
    id:          str(c.userId,  str(doc?.id)),
    name:        str(c.displayName),
    email:       str(c.email),
    role:        str(c.role, 'employee') as User['role'],
    avatar:      str(c.avatarKey),
    manager_id:  str(c.manager_id),
    assigned_by: str(c.assigned_by),
    assigned_at: str(c.assigned_at),
    createdAt:   str(c.createdAt, new Date().toISOString()),
  };
}


function mapDocToNotification(doc: any): Notification {
  const c = doc?.content ?? {};
  return {
    id:        str(doc?.id),
    userId:    str(c.userId),
    taskId:    str(c.taskId),
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
  async getAll(): Promise<Task[]> {
    const docs = await DomoApi.ListDocuments(COLLECTIONS.TASKS);

    return Array.isArray(docs) ? (docs as any[]).map(mapDocToTask) : [];
  },

  async getById(id: string): Promise<Task> {
    const doc = await DomoApi.GetDocument(COLLECTIONS.TASKS, id);
    return mapDocToTask(doc);
  },

  async getByStatus(status: Task['status']): Promise<Task[]> {
    const docs = await DomoApi.QueryDocument(
      COLLECTIONS.TASKS,
      { 'content.status': { $eq: status } }
    );
    return Array.isArray(docs) ? (docs as any[]).map(mapDocToTask) : [];
  },

  async getByAssignee(userId: string): Promise<Task[]> {
    const docs = await DomoApi.QueryDocument(
      COLLECTIONS.TASKS,
      { 'content.assigned_to': { $eq: userId } }
    );
    return Array.isArray(docs) ? (docs as any[]).map(mapDocToTask) : [];
  },

  async getByCreator(userId: string): Promise<Task[]> {
    const docs = await DomoApi.QueryDocument(
      COLLECTIONS.TASKS,
      { 'content.created_by': { $eq: userId } }
    );
   return Array.isArray(docs) ? (docs as any[]).map(mapDocToTask) : [];
  },

  async create(task: Omit<Task, 'id'>): Promise<Task> {
    const raw = taskToRaw(task);
    const doc = await DomoApi.CreateDocument(COLLECTIONS.TASKS, raw);
    return mapDocToTask(doc);
  },

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

  async updateStatus(id: string, status: Task['status']): Promise<Task> {
    return TaskService.update(id, { status });
  },

  async updateProgress(id: string, progress: number): Promise<Task> {
    return TaskService.update(id, { progress });
  },

  async delete(id: string): Promise<void> {
    await DomoApi.DeleteDocument(COLLECTIONS.TASKS, id);
  },

  async deleteMany(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    await DomoApi.BulkDeleteDocuments(COLLECTIONS.TASKS, ids.join(','));
  },
};

// ═════════════════════════════════════════════════════════════════════════════
//  USERS META  — now includes password support for login/register
// ═════════════════════════════════════════════════════════════════════════════

export const UserMetaService = {
  async getAll(): Promise<User[]> {
    const docs = await DomoApi.ListDocuments(COLLECTIONS.USERS_META);
    return Array.isArray(docs) ? (docs as any[]).map(mapDocToUser) : [];
  },

  async getByUserId(userId: string): Promise<User | null> {
    const docs = await DomoApi.QueryDocument(
      COLLECTIONS.USERS_META,
      { 'content.userId': { $eq: userId } }
    );
    if (!Array.isArray(docs) || docs.length === 0) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return mapDocToUser((docs as any[])[0]);
  },

  /** Find a user by email address */
  async getByEmail(email: string): Promise<User | null> {
    const docs = await DomoApi.QueryDocument(
      COLLECTIONS.USERS_META,
      { 'content.email': { $eq: email } }
    );
    if (!Array.isArray(docs) || docs.length === 0) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return mapDocToUser((docs as any[])[0]);
  },

  /**
   * Validate login: checks email + password_hash match in users_meta.
   */
  async validatePassword(email: string, password: string): Promise<boolean> {
    const docs = await DomoApi.QueryDocument(
      COLLECTIONS.USERS_META,
      { 'content.email': { $eq: email } }
    );
    if (!Array.isArray(docs) || docs.length === 0) return false;
   
    const storedHash = str((docs as any[])[0]?.content?.password_hash);
    return storedHash === simpleHash(password);
  },

  /**
   * Create a new user in users_meta with a hashed password.
   * Called during registration.
   */
  async create(user: User, password: string): Promise<User> {
    const raw: Record<string, unknown> = {
      userId:        user.id,
      displayName:   user.name,
      email:         user.email,
      role:          user.role,
      avatarKey:     user.avatar ?? '',
      createdAt:     user.createdAt,
      password_hash: simpleHash(password),
    };
    const doc = await DomoApi.CreateDocument(COLLECTIONS.USERS_META, raw);
    return mapDocToUser(doc);
  },

  /**
   * Upsert: update the record if one exists for this userId,
   * otherwise create a new document (without overwriting password).
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
      const existingDoc  = (docs as any[])[0];
      const existingId   = str(existingDoc?.id);
      // Preserve password_hash on update
      const existingHash = str(existingDoc?.content?.password_hash);
      const doc = await DomoApi.UpdateDocument(
        COLLECTIONS.USERS_META, existingId,
        { ...raw, password_hash: existingHash }
      );
      return mapDocToUser(doc);
    }

    const doc = await DomoApi.CreateDocument(COLLECTIONS.USERS_META, raw);
    return mapDocToUser(doc);
  },

  /**
    Update manager assignment for a user
   */
  async updateManager(employeeId: string, managerId: string, assignedBy: string): Promise<User> {
    const docs = await DomoApi.QueryDocument(
      COLLECTIONS.USERS_META,
      { 'content.userId': { $eq: employeeId } }
    );

    if (!Array.isArray(docs) || docs.length === 0) {
      throw new Error('User not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingDoc = (docs as any[])[0];
    const existingId = str(existingDoc?.id);
    const c = existingDoc?.content ?? {};

    const updatedContent = {
      ...c,
      manager_id: managerId,
      assigned_by: assignedBy,
      assigned_at: new Date().toISOString(),
    };

    const doc = await DomoApi.UpdateDocument(COLLECTIONS.USERS_META, existingId, updatedContent);
    return mapDocToUser(doc);
  },

  async delete(docId: string): Promise<void> {
    await DomoApi.DeleteDocument(COLLECTIONS.USERS_META, docId);
  },
};

// ═════════════════════════════════════════════════════════════════════════════
//  NOTIFICATIONS
// ═════════════════════════════════════════════════════════════════════════════

export const NotificationService = {
  async getByUser(userId: string): Promise<Notification[]> {
    const docs = await DomoApi.QueryDocument(
      COLLECTIONS.NOTIFICATIONS,
      { 'content.userId': { $eq: userId } },
      { orderby: 'content.createdAt desc', limit: 50 }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Array.isArray(docs) ? (docs as any[]).map(mapDocToNotification) : [];
  },

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

  async create(
    notification: Omit<Notification, 'id'>,
    userId: string,
    taskId = ''
  ): Promise<Notification> {
    const raw = notificationToRaw(notification, userId, taskId);
    const doc = await DomoApi.CreateDocument(COLLECTIONS.NOTIFICATIONS, raw);
    return mapDocToNotification(doc);
  },

  async markRead(id: string): Promise<void> {
    const doc = await DomoApi.GetDocument(COLLECTIONS.NOTIFICATIONS, id);
    const c = (doc as any)?.content ?? {};
    await DomoApi.UpdateDocument(COLLECTIONS.NOTIFICATIONS, id, { ...c, read: 1 });
  },

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

  async delete(id: string): Promise<void> {
    await DomoApi.DeleteDocument(COLLECTIONS.NOTIFICATIONS, id);
  },

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
  async getByTask(taskId: string): Promise<Comment[]> {
    const docs = await DomoApi.QueryDocument(
      COLLECTIONS.COMMENTS,
      { 'content.taskId': { $eq: taskId } },
      { orderby: 'content.createdAt asc' }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Array.isArray(docs) ? (docs as any[]).map(mapDocToComment) : [];
  },

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

  async delete(id: string): Promise<void> {
    await DomoApi.DeleteDocument(COLLECTIONS.COMMENTS, id);
  },

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
