import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiClient, apiEndpoints, normaliseError } from '../api/client';

const initialState = {
  catalog: [],
  strategy: [],
  activity: {},
  status: 'idle',
  error: null
};

export const fetchDistrictCatalog = createAsyncThunk('districts/catalog', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(apiEndpoints.districts.catalog);
    return response.data?.districts || [];
  } catch (error) {
    return rejectWithValue(normaliseError(error));
  }
});

export const fetchDistrictStrategy = createAsyncThunk('districts/strategy', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(apiEndpoints.districts.strategy);
    return response.data?.strategy || [];
  } catch (error) {
    return rejectWithValue(normaliseError(error));
  }
});

export const fetchDistrictActivity = createAsyncThunk(
  'districts/activity',
  async (code, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(apiEndpoints.districts.activity(code));
      return { code, data: response.data || {} };
    } catch (error) {
      return rejectWithValue(normaliseError(error));
    }
  }
);

const districtsSlice = createSlice({
  name: 'districts',
  initialState,
  reducers: {
    clearDistrictError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDistrictCatalog.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDistrictCatalog.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.catalog = action.payload || [];
      })
      .addCase(fetchDistrictStrategy.fulfilled, (state, action) => {
        state.strategy = action.payload || [];
      })
      .addCase(fetchDistrictActivity.fulfilled, (state, action) => {
        const { code, data } = action.payload || {};
        if (code) {
          state.activity[code] = data;
        }
      })
      .addMatcher(
        (action) =>
          action.type.startsWith('districts/') &&
          action.type.endsWith('/rejected'),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload || action.error;
        }
      );
  }
});

export const { clearDistrictError } = districtsSlice.actions;
export default districtsSlice.reducer;
