import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../lib/api';
import './LoginPage.css';

const empty = { name: '', email: '', password: '', adresse: '', telephone: '' };

const RegisterPage = () => {
  const [f, setF] = useState(empty);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();
  const set = (e) => setF({ ...f, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(f);
      navigate('/dashboard');
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const field = (name, label, type = 'text', required = false) => (
    <div className="form-group">
      <label>{label}</label>
      <input type={type} name={name} value={f[name]} onChange={set} required={required} />
    </div>
  );

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Inscription soumissionnaire</h2>
        {error && <div className="alert-error">{error}</div>}
        <form onSubmit={submit} className="login-form">
          {field('name', 'Nom du représentant', 'text', true)}
          {field('email', 'Email', 'email', true)}
          {field('password', 'Mot de passe (6 caractères min.)', 'password', true)}
          {field('adresse', 'Adresse')}
          {field('telephone', 'Téléphone')}
          <button type="submit" className="btn-login">S'inscrire</button>
        </form>
        <Link to="/" className="login-link">Déjà un compte ? Se connecter</Link>
      </div>
    </div>
  );
};

export default RegisterPage;
