import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UIState, Notification } from '../../types';
import { MOCK_NOTIFICATIONS } from '../../utils/mockData';

const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;

const initialState: UIState = {
  theme: savedTheme || 'dark',
  sidebarOpen: true,
  activeModal: null,
  notifications: MOCK_NOTIFICATIONS,
};

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
    addNotification(state, action: PayloadAction<Omit<Notification, 'id' | 'createdAt'>>) {
      state.notifications.unshift({
        ...action.payload,
        id: Math.random().toString(36).slice(2),
        createdAt: new Date().toISOString(),
      });
    },
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
});

export const {
  toggleTheme, setTheme, toggleSidebar, openModal, closeModal,
  addNotification, markNotificationRead, markAllRead, clearNotifications,
} = uiSlice.actions;
export default uiSlice.reducer;
