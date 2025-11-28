import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { apiClient, normaliseError } from '../api/client';

export function buildCrudThunks({ name, endpoint, selectId }) {
  const list = createAsyncThunk(`${name}/list`, async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      return rejectWithValue(normaliseError(error));
    }
  });

  const create = createAsyncThunk(`${name}/create`, async (payload, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(endpoint, payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(normaliseError(error));
    }
  });

  const update = createAsyncThunk(`${name}/update`, async ({ id, changes }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(`${endpoint}${id}/`, changes);
      return response.data;
    } catch (error) {
      return rejectWithValue(normaliseError(error));
    }
  });

  const remove = createAsyncThunk(`${name}/remove`, async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`${endpoint}${id}/`);
      return id;
    } catch (error) {
      return rejectWithValue(normaliseError(error));
    }
  });

  return { list, create, update, remove, selectId };
}

export function createCrudSlice({ name, endpoint, selectId = (item) => item.id }) {
  const adapter = createEntityAdapter({ selectId });
  const initialState = adapter.getInitialState({
    status: 'idle',
    error: null
  });

  const thunks = buildCrudThunks({ name, endpoint, selectId });

  const slice = createSlice({
    name,
    initialState,
    reducers: {
      clearError(state) {
        state.error = null;
      }
    },
    extraReducers: (builder) => {
      builder
        .addCase(thunks.list.pending, (state) => {
          state.status = 'loading';
          state.error = null;
        })
        .addCase(thunks.list.fulfilled, (state, action) => {
          state.status = 'succeeded';
          adapter.setAll(state, action.payload || []);
        })
        .addCase(thunks.list.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.payload || action.error;
        })
        .addCase(thunks.create.fulfilled, (state, action) => {
          if (action.payload) {
            adapter.upsertOne(state, action.payload);
          }
        })
        .addCase(thunks.update.fulfilled, (state, action) => {
          if (action.payload) {
            adapter.upsertOne(state, action.payload);
          }
        })
        .addCase(thunks.remove.fulfilled, (state, action) => {
          if (action.payload) {
            adapter.removeOne(state, action.payload);
          }
        })
        .addCase(thunks.create.rejected, (state, action) => {
          state.error = action.payload || action.error;
        })
        .addCase(thunks.update.rejected, (state, action) => {
          state.error = action.payload || action.error;
        })
        .addCase(thunks.remove.rejected, (state, action) => {
          state.error = action.payload || action.error;
        });
    }
  });

  return {
    reducer: slice.reducer,
    actions: slice.actions,
    adapter,
    thunks
  };
}
