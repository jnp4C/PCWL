import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiClient, apiEndpoints, normaliseError } from '../api/client';

const initialState = {
  current: null,
  invites: [],
  joinRequests: [],
  profile: null,
  status: 'idle',
  error: null
};

export const fetchParty = createAsyncThunk('party/fetch', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(apiEndpoints.party.root);
    return response.data || {};
  } catch (error) {
    return rejectWithValue(normaliseError(error));
  }
});

export const createParty = createAsyncThunk('party/create', async (payload, { rejectWithValue }) => {
  try {
    const response = await apiClient.post(apiEndpoints.party.root, payload);
    return response.data || {};
  } catch (error) {
    return rejectWithValue(normaliseError(error));
  }
});

export const leaveParty = createAsyncThunk('party/leave', async (_, { rejectWithValue }) => {
  try {
    await apiClient.delete(apiEndpoints.party.root);
    return true;
  } catch (error) {
    return rejectWithValue(normaliseError(error));
  }
});

export const setPartyNamePreference = createAsyncThunk(
  'party/namePreference',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(apiEndpoints.party.namePreference, payload);
      return response.data || {};
    } catch (error) {
      return rejectWithValue(normaliseError(error));
    }
  }
);

export const invitePlayer = createAsyncThunk('party/invite', async (payload, { rejectWithValue }) => {
  try {
    const response = await apiClient.post(apiEndpoints.party.invite, payload);
    return response.data || {};
  } catch (error) {
    return rejectWithValue(normaliseError(error));
  }
});

export const respondInvitation = createAsyncThunk(
  'party/respondInvitation',
  async ({ id, action }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(apiEndpoints.party.invitationDetail(id), { action });
      return response.data || {};
    } catch (error) {
      return rejectWithValue(normaliseError(error));
    }
  }
);

export const requestJoinParty = createAsyncThunk('party/join', async (payload, { rejectWithValue }) => {
  try {
    const response = await apiClient.post(apiEndpoints.party.join, payload);
    return response.data || {};
  } catch (error) {
    return rejectWithValue(normaliseError(error));
  }
});

export const respondJoinRequest = createAsyncThunk(
  'party/respondJoinRequest',
  async ({ id, action }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(apiEndpoints.party.joinRequestDetail(id), { action });
      return response.data || {};
    } catch (error) {
      return rejectWithValue(normaliseError(error));
    }
  }
);

export const fetchPartyProfile = createAsyncThunk(
  'party/profile',
  async (code, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(apiEndpoints.party.profile(code));
      return response.data || {};
    } catch (error) {
      return rejectWithValue(normaliseError(error));
    }
  }
);

const partySlice = createSlice({
  name: 'party',
  initialState,
  reducers: {
    clearPartyError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchParty.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchParty.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.current = action.payload?.party || null;
        state.invites = action.payload?.invitations || [];
        state.joinRequests = action.payload?.join_requests || [];
      })
      .addCase(fetchParty.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error;
      })
      .addCase(createParty.fulfilled, (state, action) => {
        state.current = action.payload?.party || null;
      })
      .addCase(leaveParty.fulfilled, (state) => {
        state.current = null;
        state.invites = [];
        state.joinRequests = [];
      })
      .addCase(setPartyNamePreference.fulfilled, (state, action) => {
        if (state.current && action.payload?.party) {
          state.current = action.payload.party;
        }
      })
      .addCase(invitePlayer.fulfilled, (state, action) => {
        if (action.payload?.party) {
          state.current = action.payload.party;
        }
      })
      .addCase(respondInvitation.fulfilled, (state, action) => {
        if (action.payload?.party) {
          state.current = action.payload.party;
        }
      })
      .addCase(requestJoinParty.fulfilled, (state, action) => {
        if (action.payload?.party) {
          state.current = action.payload.party;
        }
      })
      .addCase(respondJoinRequest.fulfilled, (state, action) => {
        if (state.current && action.payload?.join_requests) {
          state.joinRequests = action.payload.join_requests;
        }
      })
      .addCase(fetchPartyProfile.fulfilled, (state, action) => {
        state.profile = action.payload?.party || null;
      })
      .addMatcher(
        (action) =>
          action.type.startsWith('party/') &&
          action.type.endsWith('/rejected'),
        (state, action) => {
          state.error = action.payload || action.error;
        }
      );
  }
});

export const { clearPartyError } = partySlice.actions;
export default partySlice.reducer;
