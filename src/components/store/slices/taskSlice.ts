// import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// import type { Task, TaskState, CreateTaskDto, TaskFilters } from '../../types';
// import { MOCK_TASKS } from '../../utils/mockData';
// import { generateId } from '../../utils';

// const initialState: TaskState = {
//   tasks: MOCK_TASKS,
//   filteredTasks: MOCK_TASKS,
//   selectedTask: null,
//   isLoading: false,
//   error: null,
//   filters: { status: 'all', priority: 'all', category: 'all', search: '' },
// };

// export const fetchTasks = createAsyncThunk('tasks/fetchAll', async () => {
//   await new Promise((res) => setTimeout(res, 600));
//   return MOCK_TASKS;
// });

// export const createTask = createAsyncThunk(
//   'tasks/create',
//   async (dto: CreateTaskDto & { created_by: string }, { rejectWithValue }) => {
//     try {
//       await new Promise((res) => setTimeout(res, 400));
//       const task: Task = {
//         id: generateId(),
//         ...dto,
//         recurrence: dto.recurrence || 'none',
//         progress: 0,
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//       };
//       return task;
//     } catch (err: any) {
//       return rejectWithValue(err.message);
//     }
//   }
// );

// export const updateTask = createAsyncThunk(
//   'tasks/update',
//   async ({ id, updates }: { id: string; updates: Partial<Task> }, { rejectWithValue }) => {
//     try {
//       await new Promise((res) => setTimeout(res, 300));
//       return { id, updates: { ...updates, updatedAt: new Date().toISOString() } };
//     } catch (err: any) {
//       return rejectWithValue(err.message);
//     }
//   }
// );

// export const deleteTask = createAsyncThunk('tasks/delete', async (id: string) => {
//   await new Promise((res) => setTimeout(res, 300));
//   return id;
// });

// function applyFilters(tasks: Task[], filters: TaskFilters): Task[] {
//   return tasks.filter((t) => {
//     if (filters.status && filters.status !== 'all' && t.status !== filters.status) return false;
//     if (filters.priority && filters.priority !== 'all' && t.priority !== filters.priority) return false;
//     if (filters.category && filters.category !== 'all' && t.category !== filters.category) return false;
//     if (filters.search) {
//       const q = filters.search.toLowerCase();
//       if (!t.title.toLowerCase().includes(q) && !t.description?.toLowerCase().includes(q)) return false;
//     }
//     return true;
//   });
// }

// const taskSlice = createSlice({
//   name: 'tasks',
//   initialState,
//   reducers: {
//     setFilters(state, action: PayloadAction<Partial<TaskFilters>>) {
//       state.filters = { ...state.filters, ...action.payload };
//       state.filteredTasks = applyFilters(state.tasks, state.filters);
//     },
//     clearFilters(state) {
//       state.filters = { status: 'all', priority: 'all', category: 'all', search: '' };
//       state.filteredTasks = state.tasks;
//     },
//     selectTask(state, action: PayloadAction<Task | null>) {
//       state.selectedTask = action.payload;
//     },
//     moveTask(state, action: PayloadAction<{ taskId: string; newStatus: Task['status'] }>) {
//       const { taskId, newStatus } = action.payload;
//       const task = state.tasks.find((t) => t.id === taskId);
//       if (task) {
//         task.status = newStatus;
//         task.updatedAt = new Date().toISOString();
//       }
//       state.filteredTasks = applyFilters(state.tasks, state.filters);
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchTasks.pending, (s) => { s.isLoading = true; })
//       .addCase(fetchTasks.fulfilled, (s, a) => {
//         s.isLoading = false;
//         s.tasks = a.payload;
//         s.filteredTasks = applyFilters(a.payload, s.filters);
//       })
//       .addCase(createTask.fulfilled, (s, a) => {
//         s.tasks.unshift(a.payload);
//         s.filteredTasks = applyFilters(s.tasks, s.filters);
//       })
//       .addCase(updateTask.fulfilled, (s, a) => {
//         const { id, updates } = a.payload;
//         const idx = s.tasks.findIndex((t) => t.id === id);
//         if (idx !== -1) s.tasks[idx] = { ...s.tasks[idx], ...updates };
//         s.filteredTasks = applyFilters(s.tasks, s.filters);
//       })
//       .addCase(deleteTask.fulfilled, (s, a) => {
//         s.tasks = s.tasks.filter((t) => t.id !== a.payload);
//         s.filteredTasks = applyFilters(s.tasks, s.filters);
//       });
//   },
// });

// export const { setFilters, clearFilters, selectTask, moveTask } = taskSlice.actions;
// export default taskSlice.reducer;




/**
 * taskSlice.ts  (Domo-connected version)
 * ─────────────────────────────────────────────────────────────────────────────
 * Replaces all mock timeouts with real TaskService calls.
 * The slice shape, action names, and selectors are unchanged so no other
 * file needs to be updated.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Task, TaskState, CreateTaskDto, TaskFilters } from '../../types';
import { generateId } from '../../utils';
import { TaskService } from '@/services/domoDataService';

const initialState: TaskState = {
  tasks:         [],
  filteredTasks: [],
  selectedTask:  null,
  isLoading:     false,
  error:         null,
  filters: {
    status:   'all',
    priority: 'all',
    category: 'all',
    search:   '',
  },
};

// ─── Async thunks ─────────────────────────────────────────────────────────────

/** Load all tasks from Domo AppDB (tasks collection) */
export const fetchTasks = createAsyncThunk(
  'tasks/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await TaskService.getAll();
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed to fetch tasks');
    }
  }
);

/** Fetch tasks assigned to the current user */
export const fetchMyTasks = createAsyncThunk(
  'tasks/fetchMine',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await TaskService.getByAssignee(userId);
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed to fetch your tasks');
    }
  }
);

/** Create a new task in Domo */
export const createTask = createAsyncThunk(
  'tasks/create',
  async (
    dto: CreateTaskDto & { created_by: string },
    { rejectWithValue }
  ) => {
    try {
      const now = new Date().toISOString();
      const newTask: Omit<Task, 'id'> = {
        ...dto,
        recurrence: dto.recurrence ?? 'none',
        progress:   0,
        createdAt:  now,
        updatedAt:  now,
      };
      // TaskService.create returns the task with its Domo-generated id
      return await TaskService.create(newTask);
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed to create task');
    }
  }
);

/** Update an existing task in Domo */
export const updateTask = createAsyncThunk(
  'tasks/update',
  async (
    { id, updates }: { id: string; updates: Partial<Task> },
    { rejectWithValue }
  ) => {
    try {
      const updatedTask = await TaskService.update(id, updates);
      return updatedTask;
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed to update task');
    }
  }
);

/** Move a task to a new status column (Kanban) */
export const moveTaskRemote = createAsyncThunk(
  'tasks/move',
  async (
    { taskId, newStatus }: { taskId: string; newStatus: Task['status'] },
    { rejectWithValue }
  ) => {
    try {
      return await TaskService.updateStatus(taskId, newStatus);
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed to move task');
    }
  }
);

/** Delete a task from Domo (also cleans up comments) */
export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await TaskService.delete(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed to delete task');
    }
  }
);

/** Delete multiple tasks at once */
export const deleteTasksBulk = createAsyncThunk(
  'tasks/deleteBulk',
  async (ids: string[], { rejectWithValue }) => {
    try {
      await TaskService.deleteMany(ids);
      return ids;
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed to delete tasks');
    }
  }
);

/** Update task progress */
export const updateTaskProgress = createAsyncThunk(
  'tasks/updateProgress',
  async (
    { id, progress }: { id: string; progress: number },
    { rejectWithValue }
  ) => {
    try {
      return await TaskService.updateProgress(id, progress);
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed to update progress');
    }
  }
);

// ─── Filter helper ────────────────────────────────────────────────────────────

function applyFilters(tasks: Task[], filters: TaskFilters): Task[] {
  return tasks.filter((t) => {
    if (filters.status   && filters.status   !== 'all' && t.status   !== filters.status)   return false;
    if (filters.priority && filters.priority !== 'all' && t.priority !== filters.priority) return false;
    if (filters.category && filters.category !== 'all' && t.category !== filters.category) return false;
    if (filters.assignee && t.assigned_to !== filters.assignee) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        !t.title.toLowerCase().includes(q) &&
        !t.description?.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });
}

// ─── Slice ────────────────────────────────────────────────────────────────────

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<TaskFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
      state.filteredTasks = applyFilters(state.tasks, state.filters);
    },
    clearFilters(state) {
      state.filters = { status: 'all', priority: 'all', category: 'all', search: '' };
      state.filteredTasks = state.tasks;
    },
    selectTask(state, action: PayloadAction<Task | null>) {
      state.selectedTask = action.payload;
    },
    /**
     * Optimistic local move — immediately reflects in UI while
     * moveTaskRemote runs in the background.
     */
    moveTask(
      state,
      action: PayloadAction<{ taskId: string; newStatus: Task['status'] }>
    ) {
      const { taskId, newStatus } = action.payload;
      const task = state.tasks.find((t) => t.id === taskId);
      if (task) {
        task.status    = newStatus;
        task.updatedAt = new Date().toISOString();
      }
      state.filteredTasks = applyFilters(state.tasks, state.filters);
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── fetchTasks ──────────────────────────────────────────────────────────
    builder
      .addCase(fetchTasks.pending,   (s) => { s.isLoading = true;  s.error = null; })
      .addCase(fetchTasks.fulfilled, (s, a) => {
        s.isLoading     = false;
        s.tasks         = a.payload;
        s.filteredTasks = applyFilters(a.payload, s.filters);
      })
      .addCase(fetchTasks.rejected,  (s, a) => {
        s.isLoading = false;
        s.error     = a.payload as string;
      });

    // ── fetchMyTasks ────────────────────────────────────────────────────────
    builder
      .addCase(fetchMyTasks.pending,   (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchMyTasks.fulfilled, (s, a) => {
        s.isLoading     = false;
        s.tasks         = a.payload;
        s.filteredTasks = applyFilters(a.payload, s.filters);
      })
      .addCase(fetchMyTasks.rejected,  (s, a) => {
        s.isLoading = false;
        s.error     = a.payload as string;
      });

    // ── createTask ──────────────────────────────────────────────────────────
    builder
      .addCase(createTask.pending,   (s) => { s.isLoading = true; s.error = null; })
      .addCase(createTask.fulfilled, (s, a) => {
        s.isLoading = false;
        s.tasks.unshift(a.payload);
        s.filteredTasks = applyFilters(s.tasks, s.filters);
      })
      .addCase(createTask.rejected,  (s, a) => {
        s.isLoading = false;
        s.error     = a.payload as string;
      });

    // ── updateTask ──────────────────────────────────────────────────────────
    builder
      .addCase(updateTask.pending,   (s) => { s.isLoading = true; s.error = null; })
      .addCase(updateTask.fulfilled, (s, a) => {
        s.isLoading = false;
        const idx = s.tasks.findIndex((t) => t.id === a.payload.id);
        if (idx !== -1) s.tasks[idx] = a.payload;
        s.filteredTasks = applyFilters(s.tasks, s.filters);
      })
      .addCase(updateTask.rejected,  (s, a) => {
        s.isLoading = false;
        s.error     = a.payload as string;
      });

    // ── moveTaskRemote ──────────────────────────────────────────────────────
    builder
      .addCase(moveTaskRemote.fulfilled, (s, a) => {
        const idx = s.tasks.findIndex((t) => t.id === a.payload.id);
        if (idx !== -1) s.tasks[idx] = a.payload;
        s.filteredTasks = applyFilters(s.tasks, s.filters);
      })
      .addCase(moveTaskRemote.rejected, (s, a) => {
        s.error = a.payload as string;
      });

    // ── deleteTask ──────────────────────────────────────────────────────────
    builder
      .addCase(deleteTask.pending,   (s) => { s.isLoading = true; s.error = null; })
      .addCase(deleteTask.fulfilled, (s, a) => {
        s.isLoading     = false;
        s.tasks         = s.tasks.filter((t) => t.id !== a.payload);
        s.filteredTasks = applyFilters(s.tasks, s.filters);
        if (s.selectedTask?.id === a.payload) s.selectedTask = null;
      })
      .addCase(deleteTask.rejected,  (s, a) => {
        s.isLoading = false;
        s.error     = a.payload as string;
      });

    // ── deleteTasksBulk ─────────────────────────────────────────────────────
    builder
      .addCase(deleteTasksBulk.fulfilled, (s, a) => {
        const ids = new Set(a.payload);
        s.tasks         = s.tasks.filter((t) => !ids.has(t.id));
        s.filteredTasks = applyFilters(s.tasks, s.filters);
      })
      .addCase(deleteTasksBulk.rejected, (s, a) => {
        s.error = a.payload as string;
      });

    // ── updateTaskProgress ──────────────────────────────────────────────────
    builder
      .addCase(updateTaskProgress.fulfilled, (s, a) => {
        const idx = s.tasks.findIndex((t) => t.id === a.payload.id);
        if (idx !== -1) s.tasks[idx] = a.payload;
        s.filteredTasks = applyFilters(s.tasks, s.filters);
      });
  },
});

export const {
  setFilters, clearFilters, selectTask, moveTask, clearError,
} = taskSlice.actions;
export default taskSlice.reducer;