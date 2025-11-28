import { createCrudSlice } from './createCrudSlice';
import { apiEndpoints } from '../api/client';

const { reducer, actions, adapter, thunks } = createCrudSlice({
  name: 'players',
  endpoint: apiEndpoints.players,
  selectId: (player) => player.id || player.username
});

export const playersAdapter = adapter;
export const playersSelectors = adapter.getSelectors((state) => state.players);
export const playersThunks = thunks;
export const { clearError: clearPlayersError } = actions;

export default reducer;
