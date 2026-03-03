import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";
import { loginWithEmail, logoutCurrentUser, registerWithEmail } from "../../services/authService";
import type { AuthUser } from "../../types/auth";
import type { AppConfig } from "../../types/product";

type AuthPayload = {
  email: string;
  password: string;
  config: AppConfig;
};

type LogoutPayload = {
  config: AppConfig;
};

type AuthState = {
  user: AuthUser | null;
  status: "idle" | "loading" | "failed";
  initializing: boolean;
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  status: "idle",
  initializing: true,
  error: null,
};

const normalizeAuthError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return "Authentication failed.";
  }
  return error.message.replace("Firebase: ", "").replace(/\(auth\/|[).]/g, "");
};

export const registerUser = createAsyncThunk<
  void,
  AuthPayload,
  { rejectValue: string }
>("auth/registerUser", async ({ email, password, config }, thunkApi) => {
  try {
    await registerWithEmail(email.trim(), password, config.firebase);
  } catch (error) {
    return thunkApi.rejectWithValue(normalizeAuthError(error));
  }
});

export const loginUser = createAsyncThunk<
  void,
  AuthPayload,
  { rejectValue: string }
>("auth/loginUser", async ({ email, password, config }, thunkApi) => {
  try {
    await loginWithEmail(email.trim(), password, config.firebase);
  } catch (error) {
    return thunkApi.rejectWithValue(normalizeAuthError(error));
  }
});

export const logoutUser = createAsyncThunk<
  void,
  LogoutPayload,
  { rejectValue: string }
>("auth/logoutUser", async ({ config }, thunkApi) => {
  try {
    await logoutCurrentUser(config.firebase);
  } catch (error) {
    return thunkApi.rejectWithValue(normalizeAuthError(error));
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
      state.initializing = false;
    },
    setAuthInitializing: (state, action: PayloadAction<boolean>) => {
      state.initializing = action.payload;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = "idle";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Registration failed.";
      })
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state) => {
        state.status = "idle";
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Login failed.";
      })
      .addCase(logoutUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.status = "idle";
        state.user = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Logout failed.";
      });
  },
});

export const { setAuthUser, setAuthInitializing, clearAuthError } = authSlice.actions;

export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthInitializing = (state: RootState) => state.auth.initializing;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectIsAuthenticated = (state: RootState) => !!state.auth.user;

export default authSlice.reducer;
