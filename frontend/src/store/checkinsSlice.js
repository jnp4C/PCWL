import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiClient, apiEndpoints, normaliseError } from '../api/client';

const initialState = {
  recent: [],
  last: null,
  status: 'idle',
  error: null
};

export const logCheckIn = createAsyncThunk('checkins/log', async (payload, { rejectWithValue }) => {
  try {
    const response = await apiClient.post(apiEndpoints.checkins, payload);
    return response.data || {};
  } catch (error) {
    return rejectWithValue(normaliseError(error));
  }
});

export const chargeAttack = createAsyncThunk('checkins/charge', async (payload, { rejectWithValue }) => {
  try {
    const response = await apiClient.post(apiEndpoints.charge, payload);
    return response.data || {};
  } catch (error) {
    return rejectWithValue(normaliseError(error));
  }
});

const checkinsSlice = createSlice({
  name: 'checkins',
  initialState,
  reducers: {
    clearCheckinError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(logCheckIn.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(logCheckIn.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload?.checkin) {
          state.last = action.payload.checkin;
          state.recent = [action.payload.checkin, ...state.recent].slice(0, 20);
        }
      })
      .addCase(chargeAttack.fulfilled, (state, action) => {
        if (action.payload?.checkin) {
          state.last = action.payload.checkin;
          state.recent = [action.payload.checkin, ...state.recent].slice(0, 20);
        }
      })
      .addMatcher(
        (action) =>
          action.type.startsWith('checkins/') &&
          action.type.endsWith('/rejected'),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload || action.error;
        }
      );
  }
});

export const { clearCheckinError } = checkinsSlice.actions;
export default checkinsSlice.reducer;
