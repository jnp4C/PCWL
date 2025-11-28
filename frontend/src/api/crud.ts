import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { apiClient, ApiClient } from './client';

export interface CrudState<T extends { id?: string | number }> {
  byId: Record<string, T>;
  allIds: Array<string | number>;
  loading: boolean;
  error?: string | null;
}

export interface CrudEndpoints {
  list: string;
  retrieve: (id: string | number) => string;
  create: string;
  update: (id: string | number) => string;
  destroy: (id: string | number) => string;
}

export interface CrudConfig<T extends { id?: string | number }> {
  name: string;
  endpoints: CrudEndpoints;
  selectId?: (item: T) => string | number | null | undefined;
  client?: ApiClient;
}

const defaultSelectId = <T extends { id?: string | number }>(item: T) => item.id ?? null;

export function makeCrudThunks<T extends { id?: string | number }>(config: CrudConfig<T>) {
  const selectId = config.selectId || defaultSelectId;
  const client = config.client || apiClient;
  const base = config.name;

  const fetchAll = createAsyncThunk(`${base}/fetchAll`, async () => {
    return client.request<T[]>(config.endpoints.list);
  });

  const fetchOne = createAsyncThunk(`${base}/fetchOne`, async (id: string | number) => {
    return client.request<T>(config.endpoints.retrieve(id));
  });

  const createItem = createAsyncThunk(`${base}/create`, async (body: Partial<T>) => {
    return client.request<T>(config.endpoints.create, { method: 'POST', json: body });
  });

  const updateItem = createAsyncThunk(
    `${base}/update`,
    async ({ id, body }: { id: string | number; body: Partial<T> }) => {
      return client.request<T>(config.endpoints.update(id), { method: 'PATCH', json: body });
    },
  );

  const deleteItem = createAsyncThunk(`${base}/delete`, async (id: string | number) => {
    await client.request<void>(config.endpoints.destroy(id), { method: 'DELETE' });
    return id;
  });

  return { fetchAll, fetchOne, createItem, updateItem, deleteItem, selectId };
}

export function makeCrudSlice<T extends { id?: string | number }>(
  config: CrudConfig<T>,
  thunks = makeCrudThunks<T>(config),
) {
  const selectId = thunks.selectId || config.selectId || defaultSelectId;
  const initialState: CrudState<T> = {
    byId: {},
    allIds: [],
    loading: false,
    error: null,
  };

  const slice = createSlice({
    name: config.name,
    initialState,
    reducers: {
      upsertMany(state, action: PayloadAction<T[]>) {
        action.payload.forEach((item) => {
          const id = selectId(item);
          if (id === null || id === undefined) return;
          state.byId[id.toString()] = item;
          if (!state.allIds.includes(id)) {
            state.allIds.push(id);
          }
        });
      },
      clear(state) {
        state.byId = {};
        state.allIds = [];
        state.error = null;
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(thunks.fetchAll.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(thunks.fetchAll.fulfilled, (state, action) => {
          state.loading = false;
          state.error = null;
          state.byId = {};
          state.allIds = [];
          action.payload.forEach((item) => {
            const id = selectId(item);
            if (id === null || id === undefined) return;
            state.byId[id.toString()] = item;
            state.allIds.push(id);
          });
        })
        .addCase(thunks.fetchAll.rejected, (state, action) => {
          state.loading = false;
          state.error = action.error.message || 'Failed to load';
        })
        .addCase(thunks.fetchOne.fulfilled, (state, action) => {
          const id = selectId(action.payload);
          if (id === null || id === undefined) return;
          state.byId[id.toString()] = action.payload;
          if (!state.allIds.includes(id)) {
            state.allIds.push(id);
          }
        })
        .addCase(thunks.createItem.fulfilled, (state, action) => {
          const id = selectId(action.payload);
          if (id === null || id === undefined) return;
          state.byId[id.toString()] = action.payload;
          if (!state.allIds.includes(id)) {
            state.allIds.push(id);
          }
        })
        .addCase(thunks.updateItem.fulfilled, (state, action) => {
          const id = selectId(action.payload);
          if (id === null || id === undefined) return;
          state.byId[id.toString()] = action.payload;
          if (!state.allIds.includes(id)) {
            state.allIds.push(id);
          }
        })
        .addCase(thunks.deleteItem.fulfilled, (state, action) => {
          const id = action.payload;
          if (id === null || id === undefined) return;
          delete state.byId[id.toString()];
          state.allIds = state.allIds.filter((existing) => existing !== id);
        });
    },
  });

  return { slice, thunks };
}
