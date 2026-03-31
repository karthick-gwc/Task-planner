// // ─── User & Auth ──────────────────────────────────────────────────────────────

// export type UserRole = 'admin' | 'manager' | 'employee';

// export interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: UserRole;
//   avatar?: string;
//   manager_id?: string; 
//   assigned_by?: string; 
//   assigned_at?: string; 
//   createdAt: string;
// }

// export interface AuthState {
//   user: User | null;
//   users: User[];
//   token: string | null;
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   error: string | null;
// }

// export interface LoginCredentials {
//   email: string;
//   password: string;
// }

// export interface RegisterCredentials {
//   name: string;
//   email: string;
//   password: string;
//   role?: UserRole;
// }

// // ─── Manager Assignment ───────────────────────────────────────────────────────

// export interface AssignManagerDto {
//   employee_id: string;
//   manager_id: string;
//   assigned_by: string;
// }

// export interface ManagerAssignment {
//   id: string;
//   employee_id: string;
//   manager_id: string;
//   assigned_by: string;
//   assigned_at: string;
// }

// // ─── Task ─────────────────────────────────────────────────────────────────────

// export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
// export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';
// export type TaskCategory = 'work' | 'personal' | 'study' | 'other';
// export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

// export interface Task {
//   id: string;
//   title: string;
//   description?: string;
//   priority: TaskPriority;
//   status: TaskStatus;
//   category: TaskCategory;
//   due_date: string;
//   assigned_to?: string;
//   created_by: string;
//   recurrence: RecurrenceType;
//   dependencies?: string[];
//   tags?: string[];
//   progress?: number; // 0-100
//   productivity_score?: number;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface CreateTaskDto {
//   title: string;
//   description?: string;
//   priority: TaskPriority;
//   status: TaskStatus;
//   category: TaskCategory;
//   due_date: string;
//   assigned_to?: string;
//   recurrence?: RecurrenceType;
//   dependencies?: string[];
//   tags?: string[];
// }

// export interface TaskState {
//   tasks: Task[];
//   filteredTasks: Task[];
//   selectedTask: Task | null;
//   isLoading: boolean;
//   error: string | null;
//   filters: TaskFilters;
// }

// export interface TaskFilters {
//   status?: TaskStatus | 'all';
//   priority?: TaskPriority | 'all';
//   category?: TaskCategory | 'all';
//   search?: string;
//   assignee?: string;
// }

// // // ─── Kanban ───────────────────────────────────────────────────────────────────

// // export interface KanbanColumn {
// //   id: TaskStatus;
// //   title: string;
// //   color: string;
// //   tasks: Task[];
// // }

// // ─── Analytics ────────────────────────────────────────────────────────────────

// export interface AnalyticsData {
//   totalTasks: number;
//   completedTasks: number;
//   pendingTasks: number;
//   overdueTasks: number;
//   inProgressTasks: number;
//   productivityScore: number;
//   completionRate: number;
//   tasksByCategory: { name: string; value: number }[];
//   tasksByPriority: { name: string; value: number }[];
//   weeklyCompletion: { day: string; completed: number; created: number }[];
// }

// // ─── Notification ─────────────────────────────────────────────────────────────

// export interface Notification {
//   id: string;
//   userId?: string;   
//   taskId?: string;  
//   title: string;
//   message: string;
//   type: 'info' | 'success' | 'warning' | 'error';
//   read: boolean;
//   createdAt: string;
// }

// // ─── UI State ─────────────────────────────────────────────────────────────────

// export interface UIState {
//   theme: 'light' | 'dark';
//   sidebarOpen: boolean;
//   activeModal: string | null;
//   notifications: Notification[];
// }


// ─── User & Auth ──────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'manager' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  manager_id?: string;
  assigned_by?: string;
  assigned_at?: string;
  department?: string;
  jobTitle?: string;
  phone?: string;
  location?: string;
  bio?: string;
  joinedAt?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  users: User[];
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials  { email: string; password: string; }
export interface RegisterCredentials { name: string; email: string; password: string; role?: UserRole; }

export interface AssignManagerDto  { employee_id: string; manager_id: string; assigned_by: string; }
export interface ManagerAssignment { id: string; employee_id: string; manager_id: string; assigned_by: string; assigned_at: string; }

// ─── Task ─────────────────────────────────────────────────────────────────────

export type TaskPriority  = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus    = 'pending' | 'in_progress' | 'completed' | 'overdue';
export type TaskCategory  = 'work' | 'personal' | 'study' | 'other';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

// ─── NEW: History & Activity ──────────────────────────────────────────────────

export type HistoryEventType =
  | 'created'
  | 'status_changed'
  | 'priority_changed'
  | 'assigned'
  | 'due_date_changed'
  | 'progress_updated'
  | 'comment_added'
  | 'subtask_completed'
  | 'tag_added'
  | 'tag_removed'
  | 'title_changed'
  | 'description_changed';

export interface TaskHistoryEvent {
  id: string;
  type: HistoryEventType;
  userId: string;
  userName: string;
  timestamp: string;
  from?: string;    // previous value
  to?: string;      // new value
  meta?: string;    // any extra detail (comment text, tag name, etc.)
}

// ─── NEW: Subtasks ────────────────────────────────────────────────────────────

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  assignedTo?: string;
}

// ─── NEW: Time Tracking ───────────────────────────────────────────────────────

export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  startedAt: string;
  endedAt?: string;      // null = currently running
  durationMinutes?: number;
  note?: string;
}

// ─── NEW: Sprint ──────────────────────────────────────────────────────────────

export interface Sprint {
  id: string;
  name: string;
  goal?: string;
  startDate: string;
  endDate: string;
  status: 'planned' | 'active' | 'completed';
  taskIds: string[];
  createdBy: string;
  createdAt: string;
}

// ─── Task (extended) ──────────────────────────────────────────────────────────

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
  progress?: number;        // 0-100
  productivity_score?: number;
  storyPoints?: number;     // NEW: Jira-like story points
  sprintId?: string;        // NEW: sprint association
  subtasks?: Subtask[];     // NEW: checklist
  history?: TaskHistoryEvent[]; // NEW: change log
  timeEntries?: TimeEntry[];    // NEW: time tracking
  watchers?: string[];          // NEW: user IDs watching this task
  attachments?: number;         // NEW: attachment count
  estimatedHours?: number;      // NEW: estimate
  loggedHours?: number;         // NEW: actual time
  completedAt?: string;         // NEW: when completed
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
  storyPoints?: number;
  sprintId?: string;
  estimatedHours?: number;
}

export interface TaskState {
  tasks: Task[];
  filteredTasks: Task[];
  selectedTask: Task | null;
  isLoading: boolean;
  error: string | null;
  filters: TaskFilters;
  viewMode: 'grid' | 'list' | 'kanban'; // NEW
  activeSprint: Sprint | null;           // NEW
  sprints: Sprint[];                     // NEW
}

export interface TaskFilters {
  status?: TaskStatus | 'all';
  priority?: TaskPriority | 'all';
  category?: TaskCategory | 'all';
  search?: string;
  assignee?: string;
  sprintId?: string;         // NEW
  tags?: string[];           // NEW
}

// ─── Kanban ───────────────────────────────────────────────────────────────────

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  color: string;
  tasks: Task[];
  limit?: number;   // WIP limit like Jira
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
  avgCompletionDays?: number;  // NEW
  burndownData?: { date: string; remaining: number; ideal: number }[]; // NEW
}

// ─── Notification ─────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  userId?: string;
  taskId?: string;
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
  density: 'comfortable' | 'compact';
  surfaceStyle: 'flat' | 'tint';
}
