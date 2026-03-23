// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import type { AuthState, LoginCredentials, RegisterCredentials, User } from '../../types';
// import { MOCK_USERS } from '../../utils';

// const initialState: AuthState = {
//   user: null,
//   token: localStorage.getItem('token'),
//   isAuthenticated: !!localStorage.getItem('token'),
//   isLoading: false,
//   error: null,
// };

// // Simulate API calls with mock data
// export const loginUser = createAsyncThunk(
//   'auth/login',
//   async (credentials: LoginCredentials, { rejectWithValue }) => {
//     try {
//       await new Promise((res) => setTimeout(res, 800));
//       const user = MOCK_USERS.find((u) => u.email === credentials.email);
//       if (!user || credentials.password !== 'password123') {
//         throw new Error('Invalid email or password');
//       }
//       const token = `mock-jwt-token-${user.id}-${Date.now()}`;
//       localStorage.setItem('token', token);
//       localStorage.setItem('user', JSON.stringify(user));
//       return { user: { ...user, createdAt: new Date().toISOString() } as User, token };
//     } catch (err: any) {
//       return rejectWithValue(err.message);
//     }
//   }
// );

// export const registerUser = createAsyncThunk(
//   'auth/register',
//   async (data: RegisterCredentials, { rejectWithValue }) => {
//     try {
//       await new Promise((res) => setTimeout(res, 1000));
//       const newUser: User = {
//         id: `u${Date.now()}`,
//         name: data.name,
//         email: data.email,
//         role: data.role || 'employee',
//         createdAt: new Date().toISOString(),
//       };
//       const token = `mock-jwt-token-${newUser.id}-${Date.now()}`;
//       localStorage.setItem('token', token);
//       localStorage.setItem('user', JSON.stringify(newUser));
//       return { user: newUser, token };
//     } catch (err: any) {
//       return rejectWithValue(err.message);
//     }
//   }
// );

// export const loadUserFromStorage = createAsyncThunk('auth/loadUser', async () => {
//   const raw = localStorage.getItem('user');
//   if (!raw) throw new Error('No user in storage');
//   return JSON.parse(raw) as User;
// });

// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     logout(state) {
//       state.user = null;
//       state.token = null;
//       state.isAuthenticated = false;
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//     },
//     clearError(state) {
//       state.error = null;
//     },
//   },
//   extraReducers: (builder) => {
//     // Login
//     builder
//       .addCase(loginUser.pending, (s) => { s.isLoading = true; s.error = null; })
//       .addCase(loginUser.fulfilled, (s, a) => {
//         s.isLoading = false;
//         s.user = a.payload.user;
//         s.token = a.payload.token;
//         s.isAuthenticated = true;
//       })
//       .addCase(loginUser.rejected, (s, a) => {
//         s.isLoading = false;
//         s.error = a.payload as string;
//       });
//     // Register
//     builder
//       .addCase(registerUser.pending, (s) => { s.isLoading = true; s.error = null; })
//       .addCase(registerUser.fulfilled, (s, a) => {
//         s.isLoading = false;
//         s.user = a.payload.user;
//         s.token = a.payload.token;
//         s.isAuthenticated = true;
//       })
//       .addCase(registerUser.rejected, (s, a) => {
//         s.isLoading = false;
//         s.error = a.payload as string;
//       });
//     // Load from storage
//     builder
//       .addCase(loadUserFromStorage.fulfilled, (s, a) => {
//         s.user = a.payload;
//         s.isAuthenticated = true;
//       })
//       .addCase(loadUserFromStorage.rejected, (s) => {
//         s.isAuthenticated = false;
//       });
//   },
// });

// export const { logout, clearError } = authSlice.actions;
// export default authSlice.reducer;


/**
 * authSlice.ts  (Domo-connected version)
 * ─────────────────────────────────────────────────────────────────────────────
 * Login reads the real Domo session user (no credentials needed inside Domo).
 * On first login it upserts the user into the users_meta collection so the
 * rest of the app can look up team members.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AuthState, LoginCredentials, RegisterCredentials, User } from '../../types';
import DomoApi from  '@/API/domoAPI';
import { UserMetaService } from '@/services/domoDataService';


const initialState: AuthState = {
  user:            null,
  token:           localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading:       false,
  error:           null,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Map the raw Domo /environment/v1 response to our User shape */
function domoEnvToUser(env: any): User {
  return {
    id:        String(env.userId      ?? env.id ?? ''),
    name:      env.displayName        ?? env.userName ?? 'Unknown',
    email:     env.emailAddress       ?? env.email    ?? '',
    // Domo doesn't expose a role field on the env endpoint — default to employee.
    // The real role is stored / fetched from users_meta.
    role:      env.role               ?? 'employee',
    avatar:    env.avatarKey          ?? `/domo/avatars/v2/USER/${env.userId}`,
    createdAt: new Date().toISOString(),
  };
}

// ─── Thunks ───────────────────────────────────────────────────────────────────

/**
 * loginUser
 * ─────────
 * Inside a Domo app the user is always already authenticated.
 * This thunk calls /domo/environment/v1 to get the session user,
 * then checks users_meta for their stored role, and upserts the record.
 *
 * The LoginPage still passes { email, password } for compatibility but they
 * are not used for auth — Domo handles that at the platform level.
 */
export const loginUser = createAsyncThunk(
  'auth/login',
  async (_credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      // 1. Get session user from Domo platform
      const env = await DomoApi.GetCurrentUser();
      const sessionUser = domoEnvToUser(env);

      // 2. Check if this user already has a meta record with a role
      const storedMeta = await UserMetaService.getByUserId(sessionUser.id);

      const user: User = storedMeta
        ? { ...sessionUser, role: storedMeta.role, avatar: storedMeta.avatar ?? sessionUser.avatar }
        : sessionUser;

      // 3. Upsert into users_meta so team listing works
      await UserMetaService.upsert(user);

      // 4. Persist locally (no real JWT inside Domo, use userId as token)
      const token = `domo-session-${user.id}`;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return { user, token };
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Login failed');
    }
  }
);

/**
 * registerUser
 * ────────────
 * In a Domo app users already exist in the platform — there's no sign-up.
 * This thunk creates the users_meta record for the current session user
 * with a chosen role and name.
 */
export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: RegisterCredentials, { rejectWithValue }) => {
    try {
      const env = await DomoApi.GetCurrentUser();
      const sessionUser = domoEnvToUser(env);

      const user: User = {
        ...sessionUser,
        name:  data.name  || sessionUser.name,
        email: data.email || sessionUser.email,
        role:  data.role  ?? 'employee',
      };

      await UserMetaService.upsert(user);

      const token = `domo-session-${user.id}`;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return { user, token };
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Registration failed');
    }
  }
);

/** Re-hydrate from localStorage (used on hard refresh) */
export const loadUserFromStorage = createAsyncThunk('auth/loadUser', async () => {
  const raw = localStorage.getItem('user');
  if (!raw) throw new Error('No user in storage');
  return JSON.parse(raw) as User;
});

/**
 * Fetch all users from users_meta (for assignment dropdowns, team page, etc.)
 */
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
    // ── loginUser ───────────────────────────────────────────────────────────
    builder
      .addCase(loginUser.pending,   (s) => { s.isLoading = true;  s.error = null; })
      .addCase(loginUser.fulfilled, (s, a) => {
        s.isLoading       = false;
        s.user            = a.payload.user;
        s.token           = a.payload.token;
        s.isAuthenticated = true;
      })
      .addCase(loginUser.rejected,  (s, a) => {
        s.isLoading = false;
        s.error     = a.payload as string;
      });

    // ── registerUser ────────────────────────────────────────────────────────
    builder
      .addCase(registerUser.pending,   (s) => { s.isLoading = true;  s.error = null; })
      .addCase(registerUser.fulfilled, (s, a) => {
        s.isLoading       = false;
        s.user            = a.payload.user;
        s.token           = a.payload.token;
        s.isAuthenticated = true;
      })
      .addCase(registerUser.rejected,  (s, a) => {
        s.isLoading = false;
        s.error     = a.payload as string;
      });

    // ── loadUserFromStorage ─────────────────────────────────────────────────
    builder
      .addCase(loadUserFromStorage.fulfilled, (s, a) => {
        s.user            = a.payload;
        s.isAuthenticated = true;
      })
      .addCase(loadUserFromStorage.rejected, (s) => {
        s.isAuthenticated = false;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;