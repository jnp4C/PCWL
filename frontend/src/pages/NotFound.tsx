import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => (
  <div>
    <h2>Page not found</h2>
    <p>
      <Link to="/">Go home</Link>
    </p>
  </div>
);

export default NotFound;
