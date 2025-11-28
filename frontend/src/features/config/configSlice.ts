import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../api/client';
import { ApiConfig } from '../../types';

export interface ConfigState extends ApiConfig {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error?: string | null;
}

const initialState: ConfigState = {
  appVersion: (globalThis as any).__APP_VERSION__ || 'dev',
  appSnapshot: '',
  apiBaseUrl: '/api',
  staticUrl: '/',
  links: {},
  status: 'idle',
  error: null,
};

export const fetchConfig = createAsyncThunk('config/fetch', async () => {
  const payload = await apiClient.request<ApiConfig>('/api/pages/home/');
  if (payload.apiBaseUrl) {
    apiClient.setBaseUrl(payload.apiBaseUrl);
  }
  return payload;
});

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setConfig(state, action: PayloadAction<Partial<ApiConfig>>) {
      Object.assign(state, action.payload);
      if (action.payload.apiBaseUrl) {
        apiClient.setBaseUrl(action.payload.apiBaseUrl);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConfig.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchConfig.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        Object.assign(state, action.payload);
      })
      .addCase(fetchConfig.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to load config';
      });
  },
});

export const { setConfig } = configSlice.actions;

export default configSlice.reducer;
