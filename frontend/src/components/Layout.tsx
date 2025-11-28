import React from 'react';
import { Link } from 'react-router-dom';
import Footer from './Footer';
import { useAppSelector } from '../app/hooks';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const config = useAppSelector((state) => state.config);
  const links = config.links || {};
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '1rem 0', borderBottom: '1px solid #e5e7eb', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" style={{ fontWeight: 700, textDecoration: 'none', color: '#111827' }}>
            PCWL
          </Link>
          <nav style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/" style={{ color: '#2563eb' }}>
              Home
            </Link>
            <Link to="/leaderboard" style={{ color: '#2563eb' }}>
              Leaderboard
            </Link>
            <a href={links?.create_account || '/create-account'} style={{ color: '#2563eb' }}>
              Create account
            </a>
          </nav>
          <div style={{ marginLeft: 'auto', color: '#475569', fontSize: '0.9rem' }}>
            API: {config.apiBaseUrl || '/api'}
          </div>
        </div>
      </header>
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
