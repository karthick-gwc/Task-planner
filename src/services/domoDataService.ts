import DomoApi from '@/API/domoAPI';
import type {
  Notification,
  Subtask,
  Task,
  TaskHistoryEvent,
  TimeEntry,
  User,
} from '@/components/types';

const COLLECTIONS = {
  TASKS: 'tasks',
  USERS_META: 'users_meta',
  NOTIFICATIONS: 'notifications',
  COMMENTS: 'comments',
} as const;

type DomoDocument = {
  id?: string;
  content?: Record<string, unknown>;
};

type QueryOptions = {
  limit?: number;
  offset?: number;
  orderby?: string;
};

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  text: string;
  createdAt: string;
}

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function num(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function safeJsonParse<T>(value: unknown, fallback: T): T {
  if (typeof value !== 'string' || !value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function maybeArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === 'string') return safeJsonParse<T[]>(value, []);
  return [];
}

function simpleHash(password: string): string {
  return btoa(`${password}_tf_salt_2026`);
}

function mapDocToTask(doc: DomoDocument): Task {
  const content = doc.content ?? {};

  return {
    id: str(doc.id),
    title: str(content.title),
    description: str(content.description),
    priority: str(content.priority, 'medium') as Task['priority'],
    status: str(content.status, 'pending') as Task['status'],
    category: str(content.category, 'work') as Task['category'],
    due_date: str(content.due_date, new Date().toISOString()),
    assigned_to: str(content.assigned_to),
    created_by: str(content.created_by),
    recurrence: str(content.recurrence, 'none') as Task['recurrence'],
    dependencies: maybeArray<string>(content.dependencies),
    tags: maybeArray<string>(content.tags),
    progress: num(content.progress),
    productivity_score: num(content.productivity_score, 0) || undefined,
    storyPoints: num(content.storyPoints, 0) || undefined,
    sprintId: str(content.sprintId) || undefined,
    subtasks: maybeArray<Subtask>(content.subtasks),
    history: maybeArray<TaskHistoryEvent>(content.history),
    timeEntries: maybeArray<TimeEntry>(content.timeEntries),
    watchers: maybeArray<string>(content.watchers),
    attachments: num(content.attachments, 0) || undefined,
    estimatedHours: num(content.estimatedHours, 0) || undefined,
    loggedHours: num(content.loggedHours, 0) || undefined,
    completedAt: str(content.completedAt) || undefined,
    createdAt: str(content.createdAt, new Date().toISOString()),
    updatedAt: str(content.updatedAt, new Date().toISOString()),
  };
}

function mapDocToUser(doc: DomoDocument): User {
  const content = doc.content ?? {};

  return {
    id: str(content.userId, str(doc.id)),
    name: str(content.displayName),
    email: str(content.email),
    role: str(content.role, 'employee') as User['role'],
    avatar: str(content.avatarKey),
    manager_id: str(content.manager_id),
    assigned_by: str(content.assigned_by),
    assigned_at: str(content.assigned_at),
    department: str(content.department) || undefined,
    jobTitle: str(content.jobTitle) || undefined,
    phone: str(content.phone) || undefined,
    location: str(content.location) || undefined,
    bio: str(content.bio) || undefined,
    joinedAt: str(content.joinedAt) || undefined,
    createdAt: str(content.createdAt, new Date().toISOString()),
  };
}

function mapDocToNotification(doc: DomoDocument): Notification {
  const content = doc.content ?? {};

  return {
    id: str(doc.id),
    userId: str(content.userId) || undefined,
    taskId: str(content.taskId) || undefined,
    title: str(content.title),
    message: str(content.message),
    type: str(content.type, 'info') as Notification['type'],
    read: content.read === 1 || content.read === true,
    createdAt: str(content.createdAt, new Date().toISOString()),
  };
}

function mapDocToComment(doc: DomoDocument): Comment {
  const content = doc.content ?? {};

  return {
    id: str(doc.id),
    taskId: str(content.taskId),
    userId: str(content.userId),
    text: str(content.text),
    createdAt: str(content.createdAt, new Date().toISOString()),
  };
}

function taskToRaw(task: Omit<Task, 'id'>): Record<string, unknown> {
  return {
    title: task.title,
    description: task.description ?? '',
    priority: task.priority,
    status: task.status,
    category: task.category,
    due_date: task.due_date,
    assigned_to: task.assigned_to ?? '',
    created_by: task.created_by,
    recurrence: task.recurrence,
    dependencies: JSON.stringify(task.dependencies ?? []),
    tags: JSON.stringify(task.tags ?? []),
    progress: task.progress ?? 0,
    productivity_score: task.productivity_score ?? 0,
    storyPoints: task.storyPoints ?? 0,
    sprintId: task.sprintId ?? '',
    subtasks: JSON.stringify(task.subtasks ?? []),
    history: JSON.stringify(task.history ?? []),
    timeEntries: JSON.stringify(task.timeEntries ?? []),
    watchers: JSON.stringify(task.watchers ?? []),
    attachments: task.attachments ?? 0,
    estimatedHours: task.estimatedHours ?? 0,
    loggedHours: task.loggedHours ?? 0,
    completedAt: task.completedAt ?? '',
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

function notificationToRaw(
  notification: Omit<Notification, 'id'>,
  userId: string,
  taskId: string
): Record<string, unknown> {
  return {
    userId,
    taskId,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    read: notification.read ? 1 : 0,
    createdAt: notification.createdAt ?? new Date().toISOString(),
  };
}

async function queryDocuments(
  collection: string,
  query: Record<string, unknown>,
  options?: QueryOptions
): Promise<DomoDocument[]> {
  const docs = await DomoApi.QueryDocument(collection, query, options ?? {});
  return Array.isArray(docs) ? (docs as DomoDocument[]) : [];
}

export const TaskService = {
  async getAll(): Promise<Task[]> {
    const docs = await DomoApi.ListDocuments(COLLECTIONS.TASKS);
    return Array.isArray(docs) ? (docs as DomoDocument[]).map(mapDocToTask) : [];
  },

  async getById(id: string): Promise<Task> {
    const doc = (await DomoApi.GetDocument(COLLECTIONS.TASKS, id)) as DomoDocument;
    return mapDocToTask(doc);
  },

  async getByStatus(status: Task['status']): Promise<Task[]> {
    const docs = await queryDocuments(COLLECTIONS.TASKS, {
      'content.status': { $eq: status },
    });
    return docs.map(mapDocToTask);
  },

  async getByAssignee(userId: string): Promise<Task[]> {
    const docs = await queryDocuments(COLLECTIONS.TASKS, {
      'content.assigned_to': { $eq: userId },
    });
    return docs.map(mapDocToTask);
  },

  async getByCreator(userId: string): Promise<Task[]> {
    const docs = await queryDocuments(COLLECTIONS.TASKS, {
      'content.created_by': { $eq: userId },
    });
    return docs.map(mapDocToTask);
  },

  async create(task: Omit<Task, 'id'>): Promise<Task> {
    const doc = (await DomoApi.CreateDocument(
      COLLECTIONS.TASKS,
      taskToRaw(task)
    )) as DomoDocument;
    return mapDocToTask(doc);
  },

  async update(id: string, updates: Partial<Omit<Task, 'id'>>): Promise<Task> {
    const current = await TaskService.getById(id);
    const merged: Omit<Task, 'id'> = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const doc = (await DomoApi.UpdateDocument(
      COLLECTIONS.TASKS,
      id,
      taskToRaw(merged)
    )) as DomoDocument;

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
    await CommentService.deleteAllForTask(id);
  },

  async deleteMany(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    await DomoApi.BulkDeleteDocuments(COLLECTIONS.TASKS, ids.join(','));
  },
};

export const UserMetaService = {
  async getAll(): Promise<User[]> {
    const docs = await DomoApi.ListDocuments(COLLECTIONS.USERS_META);
    return Array.isArray(docs) ? (docs as DomoDocument[]).map(mapDocToUser) : [];
  },

  async getByUserId(userId: string): Promise<User | null> {
    const docs = await queryDocuments(COLLECTIONS.USERS_META, {
      'content.userId': { $eq: userId },
    });
    return docs[0] ? mapDocToUser(docs[0]) : null;
  },

  async getByEmail(email: string): Promise<User | null> {
    const docs = await queryDocuments(COLLECTIONS.USERS_META, {
      'content.email': { $eq: email },
    });
    return docs[0] ? mapDocToUser(docs[0]) : null;
  },

  async validatePassword(email: string, password: string): Promise<boolean> {
    const docs = await queryDocuments(COLLECTIONS.USERS_META, {
      'content.email': { $eq: email },
    });
    if (!docs[0]) return false;
    return str(docs[0].content?.password_hash) === simpleHash(password);
  },

  async create(user: User, password: string): Promise<User> {
    const doc = (await DomoApi.CreateDocument(COLLECTIONS.USERS_META, {
      userId: user.id,
      displayName: user.name,
      email: user.email,
      role: user.role,
      avatarKey: user.avatar ?? '',
      manager_id: user.manager_id ?? '',
      assigned_by: user.assigned_by ?? '',
      assigned_at: user.assigned_at ?? '',
      department: user.department ?? '',
      jobTitle: user.jobTitle ?? '',
      phone: user.phone ?? '',
      location: user.location ?? '',
      bio: user.bio ?? '',
      joinedAt: user.joinedAt ?? '',
      createdAt: user.createdAt,
      password_hash: simpleHash(password),
    })) as DomoDocument;

    return mapDocToUser(doc);
  },

  async upsert(user: User): Promise<User> {
    const docs = await queryDocuments(COLLECTIONS.USERS_META, {
      'content.userId': { $eq: user.id },
    });

    const raw: Record<string, unknown> = {
      userId: user.id,
      displayName: user.name,
      email: user.email,
      role: user.role,
      avatarKey: user.avatar ?? '',
      manager_id: user.manager_id ?? '',
      assigned_by: user.assigned_by ?? '',
      assigned_at: user.assigned_at ?? '',
      department: user.department ?? '',
      jobTitle: user.jobTitle ?? '',
      phone: user.phone ?? '',
      location: user.location ?? '',
      bio: user.bio ?? '',
      joinedAt: user.joinedAt ?? '',
      createdAt: user.createdAt,
    };

    if (docs[0]?.id) {
      const doc = (await DomoApi.UpdateDocument(COLLECTIONS.USERS_META, docs[0].id, {
        ...raw,
        password_hash: str(docs[0].content?.password_hash),
      })) as DomoDocument;

      return mapDocToUser(doc);
    }

    const doc = (await DomoApi.CreateDocument(COLLECTIONS.USERS_META, raw)) as DomoDocument;
    return mapDocToUser(doc);
  },

  async updateManager(employeeId: string, managerId: string, assignedBy: string): Promise<User> {
    const docs = await queryDocuments(COLLECTIONS.USERS_META, {
      'content.userId': { $eq: employeeId },
    });

    if (!docs[0]?.id) {
      throw new Error('User not found');
    }

    const current = docs[0].content ?? {};
    const doc = (await DomoApi.UpdateDocument(COLLECTIONS.USERS_META, docs[0].id, {
      ...current,
      manager_id: managerId,
      assigned_by: assignedBy,
      assigned_at: new Date().toISOString(),
    })) as DomoDocument;

    return mapDocToUser(doc);
  },

  async delete(docId: string): Promise<void> {
    await DomoApi.DeleteDocument(COLLECTIONS.USERS_META, docId);
  },
};

export const NotificationService = {
  async getByUser(userId: string): Promise<Notification[]> {
    const docs = await queryDocuments(
      COLLECTIONS.NOTIFICATIONS,
      { 'content.userId': { $eq: userId } },
      { orderby: 'content.createdAt desc', limit: 50 }
    );
    return docs.map(mapDocToNotification);
  },

  async getUnreadByUser(userId: string): Promise<Notification[]> {
    const docs = await queryDocuments(COLLECTIONS.NOTIFICATIONS, {
      $and: [
        { 'content.userId': { $eq: userId } },
        { 'content.read': { $eq: 0 } },
      ],
    });
    return docs.map(mapDocToNotification);
  },

  async create(
    notification: Omit<Notification, 'id'>,
    userId: string,
    taskId = ''
  ): Promise<Notification> {
    const doc = (await DomoApi.CreateDocument(
      COLLECTIONS.NOTIFICATIONS,
      notificationToRaw(notification, userId, taskId)
    )) as DomoDocument;
    return mapDocToNotification(doc);
  },

  async markRead(id: string): Promise<void> {
    const doc = (await DomoApi.GetDocument(COLLECTIONS.NOTIFICATIONS, id)) as DomoDocument;
    await DomoApi.UpdateDocument(COLLECTIONS.NOTIFICATIONS, id, {
      ...(doc.content ?? {}),
      read: 1,
    });
  },

  async markAllRead(userId: string): Promise<void> {
    const docs = await queryDocuments(COLLECTIONS.NOTIFICATIONS, {
      $and: [
        { 'content.userId': { $eq: userId } },
        { 'content.read': { $eq: 0 } },
      ],
    });

    await Promise.all(
      docs
        .filter((doc) => !!doc.id)
        .map((doc) =>
          DomoApi.UpdateDocument(COLLECTIONS.NOTIFICATIONS, doc.id as string, {
            ...(doc.content ?? {}),
            read: 1,
          })
        )
    );
  },

  async delete(id: string): Promise<void> {
    await DomoApi.DeleteDocument(COLLECTIONS.NOTIFICATIONS, id);
  },

  async deleteAllForUser(userId: string): Promise<void> {
    const docs = await queryDocuments(COLLECTIONS.NOTIFICATIONS, {
      'content.userId': { $eq: userId },
    });

    const ids = docs.map((doc) => str(doc.id)).filter(Boolean);
    if (ids.length > 0) {
      await DomoApi.BulkDeleteDocuments(COLLECTIONS.NOTIFICATIONS, ids.join(','));
    }
  },
};

export const CommentService = {
  async getByTask(taskId: string): Promise<Comment[]> {
    const docs = await queryDocuments(
      COLLECTIONS.COMMENTS,
      { 'content.taskId': { $eq: taskId } },
      { orderby: 'content.createdAt asc' }
    );
    return docs.map(mapDocToComment);
  },

  async create(taskId: string, userId: string, text: string): Promise<Comment> {
    const doc = (await DomoApi.CreateDocument(COLLECTIONS.COMMENTS, {
      taskId,
      userId,
      text,
      createdAt: new Date().toISOString(),
    })) as DomoDocument;

    return mapDocToComment(doc);
  },

  async delete(id: string): Promise<void> {
    await DomoApi.DeleteDocument(COLLECTIONS.COMMENTS, id);
  },

  async deleteAllForTask(taskId: string): Promise<void> {
    const docs = await queryDocuments(COLLECTIONS.COMMENTS, {
      'content.taskId': { $eq: taskId },
    });

    const ids = docs.map((doc) => str(doc.id)).filter(Boolean);
    if (ids.length > 0) {
      await DomoApi.BulkDeleteDocuments(COLLECTIONS.COMMENTS, ids.join(','));
    }
  },
};

export default {
  TaskService,
  UserMetaService,
  NotificationService,
  CommentService,
};
