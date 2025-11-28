import { configureStore } from '@reduxjs/toolkit';
import configReducer from '../features/config/configSlice';
import sessionReducer from '../features/session/sessionSlice';
import playersReducer from '../features/players/playerSlice';
import districtsReducer from '../features/districts/districtSlice';
import leaderboardReducer from '../features/leaderboard/leaderboardSlice';
import partiesReducer from '../features/parties/partySlice';
import friendsReducer from '../features/friends/friendSlice';

export const store = configureStore({
  reducer: {
    config: configReducer,
    session: sessionReducer,
    players: playersReducer,
    districts: districtsReducer,
    leaderboard: leaderboardReducer,
    parties: partiesReducer,
    friends: friendsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
