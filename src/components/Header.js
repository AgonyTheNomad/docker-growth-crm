import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header style={{ /* styles */ }}>
      <div style={{ /* styles */ }}>Growth</div>
      <nav>
        <Link to="/" style={{ /* styles */ }}>Dashboard</Link>
        <Link to="/clients" style={{ /* styles */ }}>Clients</Link>
        <Link to="/database" style={{ /* styles */ }}>Database</Link>
        <Link to="/growth-tracker" style={{ /* styles */ }}>Growth Tracker</Link>
        {/* Add other navigation links as needed */}
      </nav>
      <div>

      </div>
    </header>
  );
};

export default Header;