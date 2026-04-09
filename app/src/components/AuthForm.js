import { useState } from 'react';
import styles from './AuthForm.module.css';

const AuthForm = ({ mode, onToggle }) => {
  const isLogin = mode === 'login';
  const [form, setForm] = useState({ email: '', password: '', age: '', address: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin
        ? { email: form.email, password: form.password }
        : { email: form.email, password: form.password, age: Number(form.age), address: form.address };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.errors
          ? data.errors.map((e) => e.msg).join(', ')
          : data.message || 'Something went wrong';
        throw new Error(msg);
      }
      localStorage.setItem('accessToken', data.accessToken);
      // TODO: redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>{isLogin ? 'Welcome back' : 'Create account'}</h2>
      <p className={styles.subtitle}>
        {isLogin ? 'Sign in to manage your bookings.' : 'Join GoClean and find trusted cleaners.'}
      </p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        {!isLogin && (
          <>
            <div className={styles.field}>
              <label>Age</label>
              <input
                type="number"
                name="age"
                placeholder="25"
                value={form.age}
                onChange={handleChange}
                min="18"
                max="120"
                required
              />
            </div>
            <div className={styles.field}>
              <label>Address</label>
              <input
                type="text"
                name="address"
                placeholder="123 Main St, City"
                value={form.address}
                onChange={handleChange}
                required
              />
            </div>
          </>
        )}

        <div className={styles.field}>
          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            minLength={8}
            required
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.submit} type="submit" disabled={loading}>
          {loading ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
        </button>
      </form>

      <p className={styles.toggle}>
        {isLogin ? "Don't have an account? " : 'Already have an account? '}
        <button className={styles.toggleBtn} onClick={onToggle}>
          {isLogin ? 'Sign up' : 'Sign in'}
        </button>
      </p>
    </div>
  );
};

export default AuthForm;
