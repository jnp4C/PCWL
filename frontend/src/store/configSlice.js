import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiClient, apiEndpoints, normaliseError, setApiBaseUrl } from '../api/client';

export const fetchConfig = createAsyncThunk('config/fetch', async (page = 'home', { rejectWithValue }) => {
  try {
    const endpoint = page === 'leaderboard' ? apiEndpoints.configLeaderboard : apiEndpoints.configHome;
    const response = await apiClient.get(endpoint);
    return { page, data: response.data };
  } catch (error) {
    return rejectWithValue(normaliseError(error));
  }
});

const initialState = {
  status: 'idle',
  error: null,
  page: 'home',
  data: {}
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchConfig.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchConfig.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.page = action.payload.page;
        state.data = action.payload.data || {};
        const apiBase = state.data?.api?.base_url || state.data?.apiBaseUrl;
        if (apiBase) {
          setApiBaseUrl(apiBase);
        }
      })
      .addCase(fetchConfig.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error;
      });
  }
});

export default configSlice.reducer;
