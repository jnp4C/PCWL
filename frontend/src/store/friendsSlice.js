import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { apiClient, apiEndpoints, normaliseError } from '../api/client';

const adapter = createEntityAdapter({
  selectId: (friend) => friend.username || friend.id
});

const initialState = adapter.getInitialState({
  status: 'idle',
  error: null
});

export const fetchFriends = createAsyncThunk('friends/list', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(apiEndpoints.friends);
    return response.data?.friends || [];
  } catch (error) {
    return rejectWithValue(normaliseError(error));
  }
});

export const addFriend = createAsyncThunk('friends/add', async (username, { rejectWithValue }) => {
  try {
    const response = await apiClient.post(apiEndpoints.friends, { username });
    return response.data?.friend || null;
  } catch (error) {
    return rejectWithValue(normaliseError(error));
  }
});

export const updateFriend = createAsyncThunk(
  'friends/update',
  async ({ username, is_favorite }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(`${apiEndpoints.friends}${encodeURIComponent(username)}/`, {
        is_favorite
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(normaliseError(error));
    }
  }
);

export const removeFriend = createAsyncThunk('friends/remove', async (username, { rejectWithValue }) => {
  try {
    await apiClient.delete(`${apiEndpoints.friends}${encodeURIComponent(username)}/`);
    return username;
  } catch (error) {
    return rejectWithValue(normaliseError(error));
  }
});

const friendsSlice = createSlice({
  name: 'friends',
  initialState,
  reducers: {
    clearFriendsError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFriends.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchFriends.fulfilled, (state, action) => {
        state.status = 'succeeded';
        adapter.setAll(state, action.payload || []);
      })
      .addCase(fetchFriends.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error;
      })
      .addCase(addFriend.fulfilled, (state, action) => {
        if (action.payload) {
          adapter.upsertOne(state, action.payload);
        }
      })
      .addCase(updateFriend.fulfilled, (state, action) => {
        if (action.payload) {
          adapter.upsertOne(state, action.payload);
        }
      })
      .addCase(removeFriend.fulfilled, (state, action) => {
        adapter.removeOne(state, action.payload);
      })
      .addCase(addFriend.rejected, (state, action) => {
        state.error = action.payload || action.error;
      })
      .addCase(updateFriend.rejected, (state, action) => {
        state.error = action.payload || action.error;
      })
      .addCase(removeFriend.rejected, (state, action) => {
        state.error = action.payload || action.error;
      });
  }
});

export const friendsSelectors = adapter.getSelectors((state) => state.friends);
export const { clearFriendsError } = friendsSlice.actions;
export default friendsSlice.reducer;
