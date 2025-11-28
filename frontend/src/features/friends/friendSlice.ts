import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiClient } from '../../api/client';

export interface FriendEntry {
  username: string;
  display_name?: string;
  home_district_code?: string;
  home_district_name?: string;
}

interface FriendState {
  items: FriendEntry[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error?: string | null;
}

const initialState: FriendState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchFriends = createAsyncThunk('friends/fetch', async () => {
  const data = await apiClient.request<{ friends: FriendEntry[] }>('/api/friends/');
  return data.friends || [];
});

const friendSlice = createSlice({
  name: 'friends',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFriends.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchFriends.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchFriends.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to load friends';
      });
  },
});

export default friendSlice.reducer;
