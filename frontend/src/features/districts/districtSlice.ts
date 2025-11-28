import { createSelector } from '@reduxjs/toolkit';
import { makeCrudSlice } from '../../api/crud';
import { District } from '../../types';
import { RootState } from '../../app/store';

const endpoints = {
  list: '/api/districts/catalog/',
  retrieve: (code: string | number) => `/api/districts/${code}/`,
  create: '/api/districts/catalog/',
  update: (code: string | number) => `/api/districts/${code}/`,
  destroy: (code: string | number) => `/api/districts/${code}/`,
};

const { slice, thunks } = makeCrudSlice<District>({
  name: 'districts',
  endpoints,
  selectId: (d) => d.code,
});

export const districtThunks = thunks;
export default slice.reducer;

export const selectDistricts = (state: RootState) =>
  state.districts.allIds.map((id) => state.districts.byId[id.toString()]).filter(Boolean);

export const selectDistrictByCode = (code?: string) =>
  createSelector(
    (state: RootState) => state.districts.byId,
    (byId) => (code ? byId[code] : undefined),
  );
