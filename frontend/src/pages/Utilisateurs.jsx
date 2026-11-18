import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { errMsg } from '../lib/api';
import './AppelsOffres.css';

const ROLES = ['ADMINISTRATEUR', 'GESTIONNAIRE', 'COMMISSION', 'SOUMISSIONNAIRE'];
const empty = { name: '', email: '', password: '', role: 'GESTIONNAIRE' };

const Utilisateurs = () => {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  const load = () => api.get('/users').then((r) => setUsers(r.data)).catch((e) => setError(errMsg(e)));
  useEffect(() => { load(); }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/users', form);
      setForm(empty); setShowForm(false); load();
    } catch (err) { setError(errMsg(err)); }
  };

  const changeRole = async (u, role) => {
    setError('');
    try { await api.put(`/users/${u.id}`, { name: u.name, email: u.email, role }); load(); }
    catch (err) { setError(errMsg(err)); }
  };

  const remove = async (u) => {
    if (!window.confirm(`Supprimer ${u.email} ?`)) return;
    setError('');
    try { await api.delete(`/users/${u.id}`); load(); } catch (err) { setError(errMsg(err)); }
  };

  return (
    <div className="appels-container">
      <div className="appels-header">
        <h1>Gestion des utilisateurs</h1>
        <button className="btn-add" onClick={() => setShowForm(!showForm)}>{showForm ? 'Annuler' : '+ Nouvel utilisateur'}</button>
      </div>
      {error && <div className="alert-error">{error}</div>}

      {showForm && (
        <div className="form-card">
          <form onSubmit={submit} className="appel-form">
            <input type="text" name="name" placeholder="Nom" value={form.name} onChange={change} required />
            <input type="email" name="email" placeholder="Email" value={form.email} onChange={change} required />
            <input type="password" name="password" placeholder="Mot de passe" value={form.password} onChange={change} required />
            <select name="role" value={form.role} onChange={change}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select>
            <button type="submit" className="btn-submit">Créer</button>
          </form>
        </div>
      )}

      <div className="table-container">
        <table className="appels-table">
          <thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <select value={u.role} disabled={u.id === me.id} onChange={(e) => changeRole(u, e.target.value)}>
                    {ROLES.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </td>
                <td>{u.id !== me.id && <button className="btn-sm red" onClick={() => remove(u)}>Supprimer</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Utilisateurs;
