import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../lib/api';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Connexion</h2>
        {error && <div className="alert-error">{error}</div>}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@test.com" required />
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" required />
          </div>
          <button type="submit" className="btn-login">Se connecter</button>
        </form>
        <Link to="/inscription" className="login-link">Soumissionnaire ? Créer un compte</Link>
        <p className="login-hint">Test : admin@test.com / gest@test.com / comm@test.com / soum@test.com — mot de passe : password</p>
      </div>
    </div>
  );
};

export default LoginPage;
