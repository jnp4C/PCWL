import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiClient } from '../../api/client';
import { LeaderboardPayload } from '../../types';

interface LeaderboardState extends LeaderboardPayload {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error?: string | null;
}

const initialState: LeaderboardState = {
  players: [],
  districts: [],
  status: 'idle',
  error: null,
};

export const fetchLeaderboard = createAsyncThunk('leaderboard/fetch', async () => {
  return apiClient.request<LeaderboardPayload>('/api/leaderboard/');
});

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaderboard.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.players = action.payload.players;
        state.districts = action.payload.districts;
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to load leaderboard';
      });
  },
});

export default leaderboardSlice.reducer;
