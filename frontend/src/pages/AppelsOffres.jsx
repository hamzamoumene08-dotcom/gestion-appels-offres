import { useEffect, useState } from 'react';
import { useListTools } from '../components/ListTools';
import { notify } from '../lib/notifications';
import api, { errMsg } from '../lib/api';
import './AppelsOffres.css';

const empty = { reference: '', titre: '', description: '', budget_estime: '', date_limite: '' };

const AppelsOffres = () => {
  const [appels, setAppels] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const { visibleRows, toolbar } = useListTools(appels, { filename: 'appels-offres.csv' });
  const load = () => api.get('/appels-offres').then((r) => setAppels(r.data)).catch((e) => setError(errMsg(e)));
  useEffect(() => { load(); }, []);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const reset = () => { setForm(empty); setEditId(null); setShowForm(false); };

  const submit = async (e) => {
    e.preventDefault(); setError('');
    try {
      if (editId) { await api.put(`/appels-offres/${editId}`, form); notify("L'appel d'offres a été modifié."); }
      else { await api.post('/appels-offres', form); notify("L'appel d'offres a été créé."); }
      reset(); load();
    } catch (err) { setError(errMsg(err)); }
  };
  const edit = (a) => {
    setForm({ reference: a.reference, titre: a.titre, description: a.description || '', budget_estime: a.budget_estime, date_limite: a.date_limite.slice(0, 16) });
    setEditId(a.id); setShowForm(true);
  };
  const action = async (fn, message) => {
    setError('');
    try { await fn(); notify(message); load(); } catch (err) { setError(errMsg(err)); }
  };
  const remove = (a) => window.confirm("Supprimer cet appel d'offres ?") && action(() => api.delete(`/appels-offres/${a.id}`), "L'appel d'offres a été supprimé.");

  return (
    <div className="appels-container">
      <div className="appels-header"><h1>Gestion des Appels d'Offres</h1><button className="btn-add" onClick={() => (showForm ? reset() : setShowForm(true))}>{showForm ? 'Annuler' : "+ Nouvel Appel d'Offres"}</button></div>
      {error && <div className="alert-error" role="alert">{error}</div>}
      {showForm && <div className="form-card"><h2>{editId ? "Modifier l'appel d'offres" : "Créer un appel d'offres"}</h2><form onSubmit={submit} className="appel-form">
        <input type="text" name="reference" placeholder="Référence (ex: AO-2026-003)" value={form.reference} onChange={change} required />
        <input type="text" name="titre" placeholder="Titre" value={form.titre} onChange={change} required />
        <textarea name="description" placeholder="Description" value={form.description} onChange={change} rows={3} />
        <input type="number" name="budget_estime" placeholder="Budget estimé (MAD)" value={form.budget_estime} onChange={change} required />
        <input type="datetime-local" name="date_limite" value={form.date_limite} onChange={change} required />
        <button type="submit" className="btn-submit">Enregistrer</button>
      </form></div>}
      {toolbar}
      <div className="table-container"><table className="appels-table"><thead><tr><th>Référence</th><th>Titre</th><th>Budget (MAD)</th><th>Date limite</th><th>Offres</th><th>Statut</th><th>Actions</th></tr></thead>
        <tbody>{visibleRows.map((a) => <tr key={a.id}><td>{a.reference}</td><td>{a.titre}</td><td>{Number(a.budget_estime).toLocaleString()}</td><td>{new Date(a.date_limite).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</td><td>{a.offres_count}</td><td><span className={`status ${a.statut.toLowerCase()}`}>{a.statut}</span></td><td><div className="row-actions">
          {a.statut === 'BROUILLON' && <button className="btn-sm green" onClick={() => action(() => api.post(`/appels-offres/${a.id}/publier`), "L'appel d'offres a été publié.")}>Publier</button>}
          {a.statut === 'PUBLIE' && <button className="btn-sm orange" onClick={() => action(() => api.post(`/appels-offres/${a.id}/cloturer`), "L'appel d'offres a été clôturé.")}>Clôturer</button>}
          {['BROUILLON', 'PUBLIE'].includes(a.statut) && <button className="btn-sm" onClick={() => edit(a)}>Modifier</button>}
          {a.statut === 'BROUILLON' && a.offres_count === 0 && <button className="btn-sm red" onClick={() => remove(a)}>Supprimer</button>}
        </div></td></tr>)}</tbody></table>{visibleRows.length === 0 && <p className="empty-msg">Aucun appel d'offres trouvé pour ces critères.</p>}</div>
    </div>
  );
};
export default AppelsOffres;
