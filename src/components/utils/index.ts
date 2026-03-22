import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, isAfter, isBefore, parseISO, formatDistanceToNow } from 'date-fns';
import type { Task, TaskPriority, TaskStatus } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string, fmt = 'MMM d, yyyy') {
  try {
    return format(parseISO(date), fmt);
  } catch {
    return date;
  }
}

export function formatRelative(date: string) {
  try {
    return formatDistanceToNow(parseISO(date), { addSuffix: true });
  } catch {
    return date;
  }
}

export function isOverdue(due_date: string) {
  return isBefore(parseISO(due_date), new Date());
}

export function isDueSoon(due_date: string, days = 3) {
  const due = parseISO(due_date);
  const soon = new Date();
  soon.setDate(soon.getDate() + days);
  return isAfter(due, new Date()) && isBefore(due, soon);
}

export const priorityOrder: Record<TaskPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const priorityColors: Record<TaskPriority, string> = {
  urgent: 'badge-urgent',
  high: 'badge-high',
  medium: 'badge-medium',
  low: 'badge-low',
};

export const statusColors: Record<TaskStatus, string> = {
  pending: 'badge-pending',
  in_progress: 'badge-in-progress',
  completed: 'badge-completed',
  overdue: 'badge-overdue',
};

export const priorityLabel: Record<TaskPriority, string> = {
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const statusLabel: Record<TaskStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  overdue: 'Overdue',
};

export function getTaskProductivityScore(task: Task): number {
  let score = 100;
  if (task.status === 'overdue') score -= 40;
  if (task.status === 'completed') score += 20;
  if (task.priority === 'urgent' && task.status === 'completed') score += 30;
  return Math.min(150, Math.max(0, score));
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export const MOCK_USERS = [
  { id: 'u1', name: 'Alex Morgan', email: 'admin@taskplanner.io', role: 'admin' as const, avatar: '' },
  { id: 'u2', name: 'Jordan Lee', email: 'manager@taskplanner.io', role: 'manager' as const, avatar: '' },
  { id: 'u3', name: 'Sam Rivera', email: 'employee@taskplanner.io', role: 'employee' as const, avatar: '' },
];
