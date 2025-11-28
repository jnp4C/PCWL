import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiClient, apiEndpoints, normaliseError } from '../api/client';

export const login = createAsyncThunk('session/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await apiClient.post(apiEndpoints.session.login, credentials);
    return response.data?.player || null;
  } catch (error) {
    return rejectWithValue(normaliseError(error));
  }
});

export const logout = createAsyncThunk('session/logout', async (_, { rejectWithValue }) => {
  try {
    await apiClient.post(apiEndpoints.session.logout);
    return true;
  } catch (error) {
    return rejectWithValue(normaliseError(error));
  }
});

export const fetchSession = createAsyncThunk('session/fetch', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(apiEndpoints.session.current);
    return response.data;
  } catch (error) {
    return rejectWithValue(normaliseError(error));
  }
});

const initialState = {
  player: null,
  authenticated: false,
  status: 'idle',
  error: null
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    clearSessionError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.authenticated = true;
        state.player = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error;
        state.authenticated = false;
        state.player = null;
      })
      .addCase(fetchSession.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSession.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.authenticated = Boolean(action.payload?.authenticated);
        state.player = action.payload?.player || null;
      })
      .addCase(fetchSession.rejected, (state, action) => {
        state.status = 'failed';
        state.authenticated = false;
        state.player = null;
        state.error = action.payload || action.error;
      })
      .addCase(logout.fulfilled, (state) => {
        state.authenticated = false;
        state.player = null;
        state.status = 'idle';
      });
  }
});

export const { clearSessionError } = sessionSlice.actions;
export default sessionSlice.reducer;
