import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AuthState, LoginCredentials, RegisterCredentials, User } from '../../types';
import { MOCK_USERS } from '../../utils';

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
};

// Simulate API calls with mock data
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      await new Promise((res) => setTimeout(res, 800));
      const user = MOCK_USERS.find((u) => u.email === credentials.email);
      if (!user || credentials.password !== 'password123') {
        throw new Error('Invalid email or password');
      }
      const token = `mock-jwt-token-${user.id}-${Date.now()}`;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return { user: { ...user, createdAt: new Date().toISOString() } as User, token };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: RegisterCredentials, { rejectWithValue }) => {
    try {
      await new Promise((res) => setTimeout(res, 1000));
      const newUser: User = {
        id: `u${Date.now()}`,
        name: data.name,
        email: data.email,
        role: data.role || 'employee',
        createdAt: new Date().toISOString(),
      };
      const token = `mock-jwt-token-${newUser.id}-${Date.now()}`;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      return { user: newUser, token };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const loadUserFromStorage = createAsyncThunk('auth/loadUser', async () => {
  const raw = localStorage.getItem('user');
  if (!raw) throw new Error('No user in storage');
  return JSON.parse(raw) as User;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(loginUser.fulfilled, (s, a) => {
        s.isLoading = false;
        s.user = a.payload.user;
        s.token = a.payload.token;
        s.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (s, a) => {
        s.isLoading = false;
        s.error = a.payload as string;
      });
    // Register
    builder
      .addCase(registerUser.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(registerUser.fulfilled, (s, a) => {
        s.isLoading = false;
        s.user = a.payload.user;
        s.token = a.payload.token;
        s.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (s, a) => {
        s.isLoading = false;
        s.error = a.payload as string;
      });
    // Load from storage
    builder
      .addCase(loadUserFromStorage.fulfilled, (s, a) => {
        s.user = a.payload;
        s.isAuthenticated = true;
      })
      .addCase(loadUserFromStorage.rejected, (s) => {
        s.isAuthenticated = false;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
