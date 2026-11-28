import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../lib/api';
import './LoginPage.css';

const empty = { name: '', email: '', password: '', adresse: '', telephone: '' };

const FIELDS = [
  { name: 'name', label: 'Nom du représentant', required: true, autoComplete: 'name' },
  { name: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'email' },
  { name: 'password', label: 'Mot de passe (6 caractères min.)', type: 'password', required: true, minLength: 6, autoComplete: 'new-password' },
  { name: 'adresse', label: 'Adresse', autoComplete: 'street-address' },
  { name: 'telephone', label: 'Téléphone', type: 'tel', autoComplete: 'tel' },
];

const RegisterPage = () => {
  const [f, setF] = useState(empty);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const set = (e) => setF((current) => ({ ...current, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(f);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(errMsg(err));
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Inscription soumissionnaire</h2>
        {error && <div className="alert-error" role="alert">{error}</div>}
        <form onSubmit={submit} className="login-form">
          {FIELDS.map(({ name, label, type = 'text', ...rest }) => (
            <div className="form-group" key={name}>
              <label htmlFor={`reg-${name}`}>{label}</label>
              <input id={`reg-${name}`} type={type} name={name} value={f[name]} onChange={set} {...rest} />
            </div>
          ))}
          <button type="submit" className="btn-login" disabled={loading}>{loading ? 'Inscription…' : "S'inscrire"}</button>
        </form>
        <Link to="/" className="login-link">Déjà un compte ? Se connecter</Link>
      </div>
    </div>
  );
};

export default RegisterPage;
