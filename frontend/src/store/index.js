import { configureStore } from '@reduxjs/toolkit';
import configReducer from './configSlice';
import sessionReducer from './sessionSlice';
import playersReducer from './playersSlice';
import friendsReducer from './friendsSlice';
import friendRequestsReducer from './friendRequestsSlice';
import partyReducer from './partySlice';
import districtsReducer from './districtsSlice';
import checkinsReducer from './checkinsSlice';
import leaderboardReducer from './leaderboardSlice';

export const store = configureStore({
  reducer: {
    config: configReducer,
    session: sessionReducer,
    players: playersReducer,
    friends: friendsReducer,
    friendRequests: friendRequestsReducer,
    party: partyReducer,
    districts: districtsReducer,
    checkins: checkinsReducer,
    leaderboard: leaderboardReducer
  }
});
