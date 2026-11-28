import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../lib/api';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      setError(errMsg(err));
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Connexion</h2>
        {error && <div className="alert-error" role="alert">{error}</div>}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@test.com" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" required />
          </div>
          <button type="submit" className="btn-login" disabled={loading}>{loading ? 'Connexion…' : 'Se connecter'}</button>
        </form>
        <Link to="/inscription" className="login-link">Soumissionnaire ? Créer un compte</Link>
        {import.meta.env.DEV && <p className="login-hint">Test : admin@test.com / gest@test.com / comm@test.com / soum@test.com — mot de passe : password</p>}
      </div>
    </div>
  );
};

export default LoginPage;
