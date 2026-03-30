/**
 * - registerUser: saves user data to users_meta Domo collection
 * - loginUser: validates email+password against users_meta collection
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AuthState, LoginCredentials, RegisterCredentials, User } from '../../types';
import { UserMetaService } from '@/services/domoDataService';

const initialState: AuthState = {
  user:            null,
  users:           [],
  token:           null,
  isAuthenticated: false,
  isLoading:       false,
  error:           null,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const allUsers = await UserMetaService.getAll();
      const match = allUsers.find((u) => u.email === credentials.email);

      if (!match) {
        return rejectWithValue('No account found with that email.');
      }

      const isValid = await UserMetaService.validatePassword(
        credentials.email,
        credentials.password
      );

      if (!isValid) {
        return rejectWithValue('Incorrect password.');
      }

      return {
        user: match,
        token: `domo-session-${match.id}-${Date.now()}`,
      };
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: RegisterCredentials, { rejectWithValue }) => {
    try {
      const existing = await UserMetaService.getByEmail(data.email);
      if (existing) {
        return rejectWithValue('An account with this email already exists.');
      }

      const newUser: User = {
        id:        `u_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        name:      data.name,
        email:     data.email,
        role:      data.role ?? 'employee',
        avatar:    '',
        createdAt: new Date().toISOString(),
      };

      await UserMetaService.create(newUser, data.password);

      return {
        user: newUser,
        token: `domo-session-${newUser.id}-${Date.now()}`,
      };
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Registration failed');
    }
  }
);

export const fetchAllUsers = createAsyncThunk(
  'auth/fetchAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      return await UserMetaService.getAll();
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed to fetch users');
    }
  }
);

export const assignManager = createAsyncThunk(
  'auth/assignManager',
  async (
    data: { employee_id: string; manager_id: string; assigned_by: string },
    { rejectWithValue }
  ) => {
    try {
      const updatedUser = await UserMetaService.updateManager(
        data.employee_id,
        data.manager_id,
        data.assigned_by
      );

      return {
        employee_id: data.employee_id,
        manager_id: data.manager_id,
        assigned_by: data.assigned_by,
        assigned_at: updatedUser.assigned_at!,
      };
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed to assign manager');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user            = null;
      state.token           = null;
      state.isAuthenticated = false;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending,   (s) => { s.isLoading = true; s.error = null; })
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

    builder
      .addCase(registerUser.pending,   (s) => { s.isLoading = true; s.error = null; })
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

    builder
      .addCase(fetchAllUsers.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchAllUsers.fulfilled, (s, a) => {
        s.isLoading = false;
        s.users = a.payload;
      })
      .addCase(fetchAllUsers.rejected, (s, a) => {
        s.isLoading = false;
        s.error = a.payload as string;
      });

    builder
      .addCase(assignManager.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(assignManager.fulfilled, (s, a) => {
        s.isLoading = false;
        const index = s.users.findIndex((u) => u.id === a.payload.employee_id);
        if (index !== -1) {
          s.users[index] = {
            ...s.users[index],
            manager_id: a.payload.manager_id,
            assigned_by: a.payload.assigned_by,
            assigned_at: a.payload.assigned_at,
          };
        }
      })
      .addCase(assignManager.rejected, (s, a) => {
        s.isLoading = false;
        s.error = a.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
