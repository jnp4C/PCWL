import { createSelector } from '@reduxjs/toolkit';
import { makeCrudSlice, makeCrudThunks } from '../../api/crud';
import { Player } from '../../types';
import { RootState } from '../../app/store';

const endpoints = {
  list: '/api/players/',
  retrieve: (id: string | number) => `/api/players/${id}/`,
  create: '/api/players/',
  update: (id: string | number) => `/api/players/${id}/`,
  destroy: (id: string | number) => `/api/players/${id}/`,
};

const { slice, thunks } = makeCrudSlice<Player>({ name: 'players', endpoints });

export const playerThunks = thunks;
export default slice.reducer;

export const selectPlayers = (state: RootState) =>
  slice.getInitialState().allIds.length === 0 && state.players.allIds.length === 0
    ? []
    : state.players.allIds.map((id) => state.players.byId[id.toString()]).filter(Boolean);

export const selectPlayerById = (id?: string | number) =>
  createSelector(
    (state: RootState) => state.players.byId,
    (byId) => (id !== undefined && id !== null ? byId[id.toString()] : undefined),
  );
