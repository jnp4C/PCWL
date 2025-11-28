import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store } from './store';
import ThemeToggle from './components/ThemeToggle';
import AppFooter from './components/AppFooter';
import HomePage from './pages/HomePage';
import LeaderboardPage from './pages/LeaderboardPage';
import CreateAccountPage from './pages/CreateAccountPage';
import { fetchConfig } from './store/configSlice';
import { fetchSession } from './store/sessionSlice';
import { fetchLeaderboard } from './store/leaderboardSlice';

function PageRouter({ page }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchConfig(page));
  }, [dispatch, page]);

  useEffect(() => {
    dispatch(fetchSession());
  }, [dispatch]);

  useEffect(() => {
    if (page === 'leaderboard') {
      dispatch(fetchLeaderboard());
    }
  }, [dispatch, page]);

  switch (page) {
    case 'leaderboard':
      return (
        <>
          <ThemeToggle />
          <LeaderboardPage />
          <AppFooter />
        </>
      );
    case 'create-account':
      return (
        <>
          <ThemeToggle />
          <CreateAccountPage />
          <AppFooter />
        </>
      );
    case 'home':
    default:
      return (
        <>
          <ThemeToggle />
          <HomePage />
          <AppFooter />
        </>
      );
  }
}

export default function App({ page = 'home' }) {
  return (
    <Provider store={store}>
      <PageRouter page={page} />
    </Provider>
  );
}
