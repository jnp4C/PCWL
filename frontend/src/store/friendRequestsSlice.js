import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiClient, apiEndpoints, normaliseError } from '../api/client';

const initialState = {
  incoming: [],
  outgoing: [],
  status: 'idle',
  error: null
};

export const fetchFriendRequests = createAsyncThunk(
  'friendRequests/list',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(apiEndpoints.friendRequests);
      return response.data || { incoming: [], outgoing: [] };
    } catch (error) {
      return rejectWithValue(normaliseError(error));
    }
  }
);

export const updateFriendRequest = createAsyncThunk(
  'friendRequests/update',
  async ({ id, action }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(`${apiEndpoints.friendRequests}${id}/`, { action });
      return response.data?.friend_request || null;
    } catch (error) {
      return rejectWithValue(normaliseError(error));
    }
  }
);

const friendRequestsSlice = createSlice({
  name: 'friendRequests',
  initialState,
  reducers: {
    clearFriendRequestError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFriendRequests.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchFriendRequests.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.incoming = action.payload?.incoming || [];
        state.outgoing = action.payload?.outgoing || [];
      })
      .addCase(fetchFriendRequests.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error;
      })
      .addCase(updateFriendRequest.fulfilled, (state, action) => {
        const updated = action.payload;
        if (!updated) {
          return;
        }
        state.incoming = state.incoming.filter((req) => req.id !== updated.id);
        state.outgoing = state.outgoing.filter((req) => req.id !== updated.id);
      })
      .addCase(updateFriendRequest.rejected, (state, action) => {
        state.error = action.payload || action.error;
      });
  }
});

export const { clearFriendRequestError } = friendRequestsSlice.actions;
export default friendRequestsSlice.reducer;
