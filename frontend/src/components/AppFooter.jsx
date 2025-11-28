import React from 'react';
import { useSelector } from 'react-redux';

function resolveVersion(config) {
  if (config?.app?.git_tag) {
    return config.app.git_tag;
  }
  if (config?.app?.version) {
    return config.app.version;
  }
  if (config?.app?.snapshot) {
    return config.app.snapshot;
  }
  return 'dev';
}

export default function AppFooter() {
  const config = useSelector((state) => state.config.data);
  const version = resolveVersion(config);
  return (
    <footer className="app-footer">
      <span className="footer-copy">Prague Explorer</span>
      <span className="footer-version" aria-label="App version">
        Version {version}
      </span>
    </footer>
  );
}
