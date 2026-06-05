import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import C from '../theme';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function Register() {
  const [username, setUsername]         = useState('');
  const [password, setPassword]         = useState('');
  const [confirmPassword, setConfirm]   = useState('');
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!username.trim())            return 'Username is required.';
    if (username.trim().length < 3)  return 'Username must be at least 3 characters.';
    if (!password)                   return 'Password is required.';
    if (password.length < 6)         return 'Password must be at least 6 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError('');
    try {
      await api.post('/api/register/', { username: username.trim(), password });
      navigate('/login');
    } catch (err) {
      const data = err.response?.data;
      if (data?.username)  setError(data.username[0]);
      else if (data?.password) setError(data.password[0]);
      else setError('Registration failed. Try a different username.');
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
          <p style={{ fontSize: 13, color: C.t3, marginTop: C.space.xs }}>Set up your personal knowledge system</p>
        </div>

        {/* Card */}
        <div style={{
          background: C.card,
          border: `1px solid ${C.sep}`,
          borderRadius: C.radius + 4,
          padding: C.space.xl,
          backdropFilter: 'blur(12px)',
        }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: C.t1, margin: `0 0 ${C.space.lg}px` }}>Create account</h2>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: C.space.md }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.t3, marginBottom: C.space.xs, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Username
              </label>
              <Input
                type="text"
                placeholder="choose a username"
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
                placeholder="min. 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.t3, marginBottom: C.space.xs, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Confirm Password
              </label>
              <Input
                type="password"
                placeholder="repeat password"
                value={confirmPassword}
                onChange={e => setConfirm(e.target.value)}
                autoComplete="new-password"
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
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: C.space.lg, fontSize: 13, color: C.t3 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: C.accent, textDecoration: 'none', fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
