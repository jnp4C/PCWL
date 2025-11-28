import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Party } from '../../types';
import { apiClient } from '../../api/client';

interface PartyState {
  active: Party | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error?: string | null;
}

const initialState: PartyState = {
  active: null,
  status: 'idle',
  error: null,
};

export const fetchActiveParty = createAsyncThunk('party/fetchActive', async () => {
  const data = await apiClient.request<Party>('/api/party/');
  return data;
});

export const updateParty = createAsyncThunk(
  'party/update',
  async (payload: { code: string; body: Partial<Party> }) => {
    const data = await apiClient.request<Party>(`/api/party/${payload.code}/`, {
      method: 'PATCH',
      json: payload.body,
    });
    return data;
  },
);

const partySlice = createSlice({
  name: 'party',
  initialState,
  reducers: {
    clearParty(state) {
      state.active = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveParty.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchActiveParty.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.active = action.payload;
      })
      .addCase(fetchActiveParty.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to load party';
      })
      .addCase(updateParty.fulfilled, (state, action) => {
        state.active = action.payload;
      });
  },
});

export const { clearParty } = partySlice.actions;
export default partySlice.reducer;
