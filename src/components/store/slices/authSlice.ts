/**
 * authSlice.ts  (Domo collections version)
 * ─────────────────────────────────────────────────────────────────────────────
 * - registerUser: saves user data to users_meta Domo collection
 * - loginUser: validates email+password against users_meta collection
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AuthState, LoginCredentials, RegisterCredentials, User } from '../../types';
import { UserMetaService } from '@/services/domoDataService';

// Synchronously hydrate user from localStorage so the first render
// already has user/role — prevents flash of wrong route or missing role.
function loadUserSync(): User | null {
  try {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

const _storedUser = loadUserSync();

const initialState: AuthState = {
  user:            _storedUser,
  users:           [],
  token:           localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token') && _storedUser !== null,
  isLoading:       false,
  error:           null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

/**
 * loginUser
 * Validates email + password against the users_meta Domo collection.
 * Password is stored as a hashed field (password_hash) on the document.
 * For simplicity we store a bcrypt-style hash; here we do a plain comparison
 * since Domo runs client-side. Replace with a proper hash check if needed.
 */
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      // Query users_meta for matching email
      const allUsers = await UserMetaService.getAll();
      const match = allUsers.find((u) => u.email === credentials.email);

      if (!match) {
        return rejectWithValue('No account found with that email.');
      }

      // Validate password — UserMetaService stores password_hash in the raw doc.
      // We call the raw query to check it without exposing it in the typed User model.
      const isValid = await UserMetaService.validatePassword(
        credentials.email,
        credentials.password
      );

      if (!isValid) {
        return rejectWithValue('Incorrect password.');
      }

      const token = `domo-session-${match.id}-${Date.now()}`;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(match));

      return { user: match, token };
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Login failed');
    }
  }
);

/**
 * registerUser
 * Saves a new user into the users_meta Domo collection.
 * Checks for duplicate email first.
 */
export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: RegisterCredentials, { rejectWithValue }) => {
    try {
      // Check for existing account
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

      // Persist to Domo users_meta collection (with password)
      await UserMetaService.create(newUser, data.password);

      const token = `domo-session-${newUser.id}-${Date.now()}`;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));

      return { user: newUser, token };
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Registration failed');
    }
  }
);

/** Re-hydrate from localStorage on hard refresh */
export const loadUserFromStorage = createAsyncThunk('auth/loadUser', async () => {
  const raw = localStorage.getItem('user');
  if (!raw) throw new Error('No user in storage');
  return JSON.parse(raw) as User;
});

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
  async (data: { employee_id: string; manager_id: string; assigned_by: string }, { rejectWithValue }) => {
    try {
      // In a real app, this would call an API
      // For now, we'll simulate the assignment by updating the user data
      // This would typically be handled by a backend service

      // Mock implementation - in real app, call UserMetaService.updateManager(employee_id, manager_id, assigned_by)
      const assignment = {
        id: `ma_${Date.now()}`,
        employee_id: data.employee_id,
        manager_id: data.manager_id,
        assigned_by: data.assigned_by,
        assigned_at: new Date().toISOString(),
      };

      // Here you would call your API service
      // await UserMetaService.assignManager(data);

      return assignment;
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed to assign manager');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user            = null;
      state.token           = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending,   (s) => { s.isLoading = true;  s.error = null; })
      .addCase(loginUser.fulfilled, (s, a) => {
        s.isLoading = false; s.user = a.payload.user;
        s.token = a.payload.token; s.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (s, a) => {
        s.isLoading = false; s.error = a.payload as string;
      });

    builder
      .addCase(registerUser.pending,   (s) => { s.isLoading = true;  s.error = null; })
      .addCase(registerUser.fulfilled, (s, a) => {
        s.isLoading = false; s.user = a.payload.user;
        s.token = a.payload.token; s.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (s, a) => {
        s.isLoading = false; s.error = a.payload as string;
      });

    builder
      .addCase(loadUserFromStorage.fulfilled, (s, a) => {
        s.user = a.payload; s.isAuthenticated = true;
      })
      .addCase(loadUserFromStorage.rejected, (s) => {
        s.isAuthenticated = false;
      });

    builder
      .addCase(fetchAllUsers.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchAllUsers.fulfilled, (s, a) => {
        s.isLoading = false; s.users = a.payload;
      })
      .addCase(fetchAllUsers.rejected, (s, a) => {
        s.isLoading = false; s.error = a.payload as string;
      });

    builder
      .addCase(assignManager.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(assignManager.fulfilled, (s, a) => {
        s.isLoading = false;
        // Update the user in the users array
        const index = s.users.findIndex(u => u.id === a.payload.employee_id);
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
        s.isLoading = false; s.error = a.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
