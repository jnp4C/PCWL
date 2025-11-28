import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiClient } from '../../api/client';
import { Player } from '../../types';

interface SessionState {
  user: Player | null;
  authenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error?: string | null;
}

const initialState: SessionState = {
  user: null,
  authenticated: false,
  status: 'idle',
  error: null,
};

export const login = createAsyncThunk(
  'session/login',
  async (payload: { username: string; password: string }) => {
    const data = await apiClient.request<{ player: Player }>('/api/session/login/', {
      method: 'POST',
      json: payload,
    });
    return data.player;
  },
);

export const logout = createAsyncThunk('session/logout', async () => {
  await apiClient.request('/api/session/logout/', { method: 'POST' });
  return true;
});

export const fetchSession = createAsyncThunk('session/fetch', async () => {
  const data = await apiClient.request<{ authenticated: boolean; player?: Player }>('/api/session/');
  return data;
});

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.authenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Login failed';
      })
      .addCase(fetchSession.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSession.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.authenticated = Boolean(action.payload?.authenticated);
        state.user = action.payload.player || null;
      })
      .addCase(fetchSession.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Session fetch failed';
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.authenticated = false;
        state.status = 'idle';
        state.error = null;
      });
  },
});

export default sessionSlice.reducer;
