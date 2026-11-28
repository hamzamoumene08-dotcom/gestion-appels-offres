import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useListTools } from '../components/ListTools';
import useFetch from '../hooks/useFetch';
import useAction from '../hooks/useAction';
import api from '../lib/api';
import { ROLES } from '../lib/roles';
import './AppelsOffres.css';

const ROLE_LIST = Object.values(ROLES);
const empty = { name: '', email: '', password: '', role: ROLES.GESTIONNAIRE };

const Utilisateurs = () => {
  const { user: me } = useAuth();
  const { data: users, loading, error: loadError, reload } = useFetch('/users');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const { run, busy, error: actionError } = useAction({ onDone: reload });
  const { visibleRows, toolbar } = useListTools(users, { filterKey: 'role', filterLabel: 'Rôle', filename: 'utilisateurs.csv' });
  const error = actionError || loadError;

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    if (await run(() => api.post('/users', form), 'Le compte utilisateur a été créé.')) { setForm(empty); setShowForm(false); }
  };
  const changeRole = (u, role) => run(() => api.put(`/users/${u.id}`, { name: u.name, email: u.email, role }), 'Le rôle a été mis à jour.');
  const remove = (u) => window.confirm(`Supprimer ${u.email} ?`) && run(() => api.delete(`/users/${u.id}`), 'Le compte utilisateur a été supprimé.');

  return <div className="appels-container">
    <div className="appels-header"><h1>Gestion des utilisateurs</h1><button className="btn-add" onClick={() => setShowForm((v) => !v)}>{showForm ? 'Annuler' : '+ Nouvel utilisateur'}</button></div>
    {error && <div className="alert-error" role="alert">{error}</div>}
    {showForm && <div className="form-card"><form onSubmit={submit} className="appel-form"><input type="text" name="name" aria-label="Nom" placeholder="Nom" value={form.name} onChange={change} required /><input type="email" name="email" aria-label="Email" placeholder="Email" value={form.email} onChange={change} required /><input type="password" name="password" aria-label="Mot de passe" autoComplete="new-password" minLength={6} placeholder="Mot de passe" value={form.password} onChange={change} required /><select name="role" aria-label="Rôle" value={form.role} onChange={change}>{ROLE_LIST.map((role) => <option key={role}>{role}</option>)}</select><button type="submit" className="btn-submit" disabled={busy}>{busy ? 'Création…' : 'Créer'}</button></form></div>}
    {toolbar}
    <div className="table-container"><table className="appels-table"><thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Actions</th></tr></thead>
      <tbody>{visibleRows.map((u) => <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td><select aria-label={`Rôle de ${u.email}`} value={u.role} disabled={busy || u.id === me.id} onChange={(e) => changeRole(u, e.target.value)}>{ROLE_LIST.map((role) => <option key={role}>{role}</option>)}</select></td><td>{u.id !== me.id && <button className="btn-sm red" disabled={busy} onClick={() => remove(u)}>Supprimer</button>}</td></tr>)}</tbody>
    </table>{loading ? <p className="empty-msg" role="status">Chargement…</p> : visibleRows.length === 0 && <p className="empty-msg">Aucun utilisateur pour ces critères.</p>}</div>
  </div>;
};
export default Utilisateurs;
