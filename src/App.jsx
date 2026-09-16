import React from 'react';
import { Routes, Route, Link } from 'react_router_dom';
import Admin from './pages/Admin';
import MyCourse from './pages/MyCourse';

export default function App() {
  return (
    <div style={{ backgroundColor: '#121212', minHeight: '100vh', color: '#fff' }}>
      <nav style={{ padding: '15px', borderBottom: '1px solid #333', display: 'flex', gap: '20px' }}>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Bosh sahifa</Link>
        <Link to="/my-course" style={{ color: '#fff', textDecoration: 'none' }}>Kursim</Link>
        <Link to="/admin" style={{ color: '#fff', textDecoration: 'none' }}>Admin panel</Link>
      </nav>

      <Routes>
        <Route path="/" element={<MyCourse />} />
        <Route path="/my-course" element={<MyCourse />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
}
