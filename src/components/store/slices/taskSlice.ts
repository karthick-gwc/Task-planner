import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Task, TaskState, CreateTaskDto, TaskFilters } from '../../types';
import { MOCK_TASKS } from '../../utils/mockData';
import { generateId } from '../../utils';

const initialState: TaskState = {
  tasks: MOCK_TASKS,
  filteredTasks: MOCK_TASKS,
  selectedTask: null,
  isLoading: false,
  error: null,
  filters: { status: 'all', priority: 'all', category: 'all', search: '' },
};

export const fetchTasks = createAsyncThunk('tasks/fetchAll', async () => {
  await new Promise((res) => setTimeout(res, 600));
  return MOCK_TASKS;
});

export const createTask = createAsyncThunk(
  'tasks/create',
  async (dto: CreateTaskDto & { created_by: string }, { rejectWithValue }) => {
    try {
      await new Promise((res) => setTimeout(res, 400));
      const task: Task = {
        id: generateId(),
        ...dto,
        recurrence: dto.recurrence || 'none',
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return task;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ id, updates }: { id: string; updates: Partial<Task> }, { rejectWithValue }) => {
    try {
      await new Promise((res) => setTimeout(res, 300));
      return { id, updates: { ...updates, updatedAt: new Date().toISOString() } };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteTask = createAsyncThunk('tasks/delete', async (id: string) => {
  await new Promise((res) => setTimeout(res, 300));
  return id;
});

function applyFilters(tasks: Task[], filters: TaskFilters): Task[] {
  return tasks.filter((t) => {
    if (filters.status && filters.status !== 'all' && t.status !== filters.status) return false;
    if (filters.priority && filters.priority !== 'all' && t.priority !== filters.priority) return false;
    if (filters.category && filters.category !== 'all' && t.category !== filters.category) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!t.title.toLowerCase().includes(q) && !t.description?.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

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
    moveTask(state, action: PayloadAction<{ taskId: string; newStatus: Task['status'] }>) {
      const { taskId, newStatus } = action.payload;
      const task = state.tasks.find((t) => t.id === taskId);
      if (task) {
        task.status = newStatus;
        task.updatedAt = new Date().toISOString();
      }
      state.filteredTasks = applyFilters(state.tasks, state.filters);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (s) => { s.isLoading = true; })
      .addCase(fetchTasks.fulfilled, (s, a) => {
        s.isLoading = false;
        s.tasks = a.payload;
        s.filteredTasks = applyFilters(a.payload, s.filters);
      })
      .addCase(createTask.fulfilled, (s, a) => {
        s.tasks.unshift(a.payload);
        s.filteredTasks = applyFilters(s.tasks, s.filters);
      })
      .addCase(updateTask.fulfilled, (s, a) => {
        const { id, updates } = a.payload;
        const idx = s.tasks.findIndex((t) => t.id === id);
        if (idx !== -1) s.tasks[idx] = { ...s.tasks[idx], ...updates };
        s.filteredTasks = applyFilters(s.tasks, s.filters);
      })
      .addCase(deleteTask.fulfilled, (s, a) => {
        s.tasks = s.tasks.filter((t) => t.id !== a.payload);
        s.filteredTasks = applyFilters(s.tasks, s.filters);
      });
  },
});

export const { setFilters, clearFilters, selectTask, moveTask } = taskSlice.actions;
export default taskSlice.reducer;
