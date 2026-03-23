// import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { UIState, Notification } from '../../types';
// import { MOCK_NOTIFICATIONS } from '../../utils/mockData';

// const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;

// const initialState: UIState = {
//   theme: savedTheme || 'dark',
//   sidebarOpen: true,
//   activeModal: null,
//   notifications: MOCK_NOTIFICATIONS,
// };

// const uiSlice = createSlice({
//   name: 'ui',
//   initialState,
//   reducers: {
//     toggleTheme(state) {
//       state.theme = state.theme === 'light' ? 'dark' : 'light';
//       localStorage.setItem('theme', state.theme);
//     },
//     setTheme(state, action: PayloadAction<'light' | 'dark'>) {
//       state.theme = action.payload;
//       localStorage.setItem('theme', action.payload);
//     },
//     toggleSidebar(state) {
//       state.sidebarOpen = !state.sidebarOpen;
//     },
//     openModal(state, action: PayloadAction<string>) {
//       state.activeModal = action.payload;
//     },
//     closeModal(state) {
//       state.activeModal = null;
//     },
//     addNotification(state, action: PayloadAction<Omit<Notification, 'id' | 'createdAt'>>) {
//       state.notifications.unshift({
//         ...action.payload,
//         id: Math.random().toString(36).slice(2),
//         createdAt: new Date().toISOString(),
//       });
//     },
//     markNotificationRead(state, action: PayloadAction<string>) {
//       const n = state.notifications.find((n) => n.id === action.payload);
//       if (n) n.read = true;
//     },
//     markAllRead(state) {
//       state.notifications.forEach((n) => { n.read = true; });
//     },
//     clearNotifications(state) {
//       state.notifications = [];
//     },
//   },
// });

// export const {
//   toggleTheme, setTheme, toggleSidebar, openModal, closeModal,
//   addNotification, markNotificationRead, markAllRead, clearNotifications,
// } = uiSlice.actions;
// export default uiSlice.reducer;



/**
 * uiSlice.ts  (Domo-connected version)
 * ─────────────────────────────────────────────────────────────────────────────
 * Notifications are loaded from / written to the Domo notifications collection.
 * All other UI state (theme, sidebar, modal) remains local.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UIState, Notification } from '../../types';
import { NotificationService } from '@/services/domoDataService';



const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;

const initialState: UIState = {
  theme:         savedTheme ?? 'dark',
  sidebarOpen:   true,
  activeModal:   null,
  notifications: [],
};

// ─── Async thunks ─────────────────────────────────────────────────────────────

/** Load notifications for the logged-in user from Domo */
export const fetchNotifications = createAsyncThunk(
  'ui/fetchNotifications',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await NotificationService.getByUser(userId);
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed to load notifications');
    }
  }
);

/** Create a notification in Domo and add it to local state */
export const createNotification = createAsyncThunk(
  'ui/createNotification',
  async (
    payload: {
      notification: Omit<Notification, 'id'>;
      userId: string;
      taskId?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      return await NotificationService.create(
        payload.notification,
        payload.userId,
        payload.taskId ?? ''
      );
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed to create notification');
    }
  }
);

/** Mark a single notification as read in Domo */
export const markNotificationReadRemote = createAsyncThunk(
  'ui/markNotificationRead',
  async (id: string, { rejectWithValue }) => {
    try {
      await NotificationService.markRead(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed to mark notification read');
    }
  }
);

/** Mark all notifications read in Domo */
export const markAllReadRemote = createAsyncThunk(
  'ui/markAllRead',
  async (userId: string, { rejectWithValue }) => {
    try {
      await NotificationService.markAllRead(userId);
      return userId;
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed to mark all read');
    }
  }
);

/** Clear all notifications for the user in Domo */
export const clearNotificationsRemote = createAsyncThunk(
  'ui/clearNotifications',
  async (userId: string, { rejectWithValue }) => {
    try {
      await NotificationService.deleteAllForUser(userId);
      return userId;
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed to clear notifications');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
    },
    setTheme(state, action: PayloadAction<'light' | 'dark'>) {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    openModal(state, action: PayloadAction<string>) {
      state.activeModal = action.payload;
    },
    closeModal(state) {
      state.activeModal = null;
    },
    /** Optimistic local-only add (before Domo write resolves) */
    addNotificationLocal(
      state,
      action: PayloadAction<Omit<Notification, 'id' | 'createdAt'>>
    ) {
      state.notifications.unshift({
        ...action.payload,
        id:        Math.random().toString(36).slice(2),
        createdAt: new Date().toISOString(),
      });
    },
    /** Optimistic local mark-read */
    markNotificationRead(state, action: PayloadAction<string>) {
      const n = state.notifications.find((n) => n.id === action.payload);
      if (n) n.read = true;
    },
    markAllRead(state) {
      state.notifications.forEach((n) => { n.read = true; });
    },
    clearNotifications(state) {
      state.notifications = [];
    },
  },
  extraReducers: (builder) => {
    // ── fetchNotifications ──────────────────────────────────────────────────
    builder
      .addCase(fetchNotifications.fulfilled, (s, a) => {
        s.notifications = a.payload;
      });

    // ── createNotification ──────────────────────────────────────────────────
    builder
      .addCase(createNotification.fulfilled, (s, a) => {
        s.notifications.unshift(a.payload);
      });

    // ── markNotificationReadRemote ──────────────────────────────────────────
    builder
      .addCase(markNotificationReadRemote.fulfilled, (s, a) => {
        const n = s.notifications.find((n) => n.id === a.payload);
        if (n) n.read = true;
      });

    // ── markAllReadRemote ───────────────────────────────────────────────────
    builder
      .addCase(markAllReadRemote.fulfilled, (s) => {
        s.notifications.forEach((n) => { n.read = true; });
      });

    // ── clearNotificationsRemote ────────────────────────────────────────────
    builder
      .addCase(clearNotificationsRemote.fulfilled, (s) => {
        s.notifications = [];
      });
  },
});

export const {
  toggleTheme, setTheme, toggleSidebar, openModal, closeModal,
  addNotificationLocal, markNotificationRead, markAllRead, clearNotifications,
} = uiSlice.actions;
export default uiSlice.reducer;