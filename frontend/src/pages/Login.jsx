import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import C from '../theme';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function Login() {
  const [username, setUsername]   = useState('');
  const [password, setPassword]   = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/login/', { username, password });
      localStorage.setItem('access', res.data.access);
      localStorage.setItem('refresh', res.data.refresh);
      navigate('/');
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: C.font,
      padding: C.space.lg,
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: C.space.xl }}>
          <div style={{ fontSize: 44, marginBottom: C.space.sm }}>🧠</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.t1, margin: 0 }}>Second Brain</h1>
          <p style={{ fontSize: 13, color: C.t3, marginTop: C.space.xs }}>Your personal knowledge system</p>
        </div>

        {/* Card */}
        <div style={{
          background: C.card,
          border: `1px solid ${C.sep}`,
          borderRadius: C.radius + 4,
          padding: C.space.xl,
          backdropFilter: 'blur(12px)',
        }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: C.t1, margin: `0 0 ${C.space.lg}px` }}>Sign in</h2>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: C.space.md }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.t3, marginBottom: C.space.xs, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Username
              </label>
              <Input
                type="text"
                placeholder="your username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.t3, marginBottom: C.space.xs, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(255,69,58,0.12)',
                border: `1px solid rgba(255,69,58,0.3)`,
                borderRadius: C.radius,
                padding: `${C.space.sm}px ${C.space.md}px`,
                fontSize: 13,
                color: C.danger,
              }}>
                {error}
              </div>
            )}

            <Button type="submit" style={{ width: '100%', marginTop: C.space.xs }} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: C.space.lg, fontSize: 13, color: C.t3 }}>
          No account?{' '}
          <Link to="/register" style={{ color: C.accent, textDecoration: 'none', fontWeight: 600 }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
