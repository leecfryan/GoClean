import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const [status, setStatus] = useState('checking'); // 'checking' | 'allowed' | 'denied'

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) { setStatus('denied'); return; }

    fetch('/api/auth/verify', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.valid && data.role === 'admin') setStatus('allowed');
        else { localStorage.removeItem('adminToken'); setStatus('denied'); }
      })
      .catch(() => setStatus('denied'));
  }, []);

  if (status === 'checking') return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text-muted)' }}>
      Verifying access…
    </div>
  );

  if (status === 'denied') return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
