import React from 'react';
import { useAppSelector } from '../app/hooks';

export const Footer: React.FC = () => {
  const version = useAppSelector((state) => state.config.appVersion) || 'dev';
  return (
    <footer style={{ marginTop: '2rem', padding: '1rem 0', borderTop: '1px solid #e5e7eb', color: '#475569' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <span>PCWL</span>
        <span style={{ fontFamily: 'monospace' }}>Version: {version}</span>
      </div>
    </footer>
  );
};

export default Footer;
