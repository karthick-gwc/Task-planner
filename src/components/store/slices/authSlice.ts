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

const initialState: AuthState = {
  user:            null,
  token:           localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
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
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
