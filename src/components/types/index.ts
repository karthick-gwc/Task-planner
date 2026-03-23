// ─── User & Auth ──────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'manager' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

// ─── Task ─────────────────────────────────────────────────────────────────────

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';
export type TaskCategory = 'work' | 'personal' | 'study' | 'other';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  category: TaskCategory;
  due_date: string;
  assigned_to?: string;
  created_by: string;
  recurrence: RecurrenceType;
  dependencies?: string[];
  tags?: string[];
  progress?: number; // 0-100
  productivity_score?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  category: TaskCategory;
  due_date: string;
  assigned_to?: string;
  recurrence?: RecurrenceType;
  dependencies?: string[];
  tags?: string[];
}

export interface TaskState {
  tasks: Task[];
  filteredTasks: Task[];
  selectedTask: Task | null;
  isLoading: boolean;
  error: string | null;
  filters: TaskFilters;
}

export interface TaskFilters {
  status?: TaskStatus | 'all';
  priority?: TaskPriority | 'all';
  category?: TaskCategory | 'all';
  search?: string;
  assignee?: string;
}

// ─── Kanban ───────────────────────────────────────────────────────────────────

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  color: string;
  tasks: Task[];
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface AnalyticsData {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  inProgressTasks: number;
  productivityScore: number;
  completionRate: number;
  tasksByCategory: { name: string; value: number }[];
  tasksByPriority: { name: string; value: number }[];
  weeklyCompletion: { day: string; completed: number; created: number }[];
}

// ─── Notification ─────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  userId?: string;   // owner — used to ensure only the right user sees it
  taskId?: string;   // linked task (optional)
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

// ─── UI State ─────────────────────────────────────────────────────────────────

export interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  activeModal: string | null;
  notifications: Notification[];
}
