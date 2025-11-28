import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiClient, apiEndpoints, normaliseError } from '../api/client';

const initialState = {
  players: [],
  districts: [],
  status: 'idle',
  error: null
};

export const fetchLeaderboard = createAsyncThunk(
  'leaderboard/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(apiEndpoints.leaderboard);
      return response.data || {};
    } catch (error) {
      return rejectWithValue(normaliseError(error));
    }
  }
);

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState,
  reducers: {
    hydrateLeaderboard(state, action) {
      const payload = action.payload || {};
      state.players = payload.players || state.players;
      state.districts = payload.districts || state.districts;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaderboard.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.players = action.payload?.players || [];
        state.districts = action.payload?.districts || [];
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error;
      });
  }
});

export const { hydrateLeaderboard } = leaderboardSlice.actions;
export default leaderboardSlice.reducer;
