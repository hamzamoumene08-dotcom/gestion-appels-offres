import { useState } from 'react';
import { useListTools } from '../components/ListTools';
import StatusBadge from '../components/StatusBadge';
import useFetch from '../hooks/useFetch';
import useAction from '../hooks/useAction';
import api from '../lib/api';
import { formatDateTime, formatMAD } from '../lib/format';
import './AppelsOffres.css';

const empty = { reference: '', titre: '', description: '', budget_estime: '', date_limite: '' };

const AppelsOffres = () => {
  const { data: appels, loading, error: loadError, reload } = useFetch('/appels-offres');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(empty);
  const { run, busy, error: actionError, setError } = useAction({ onDone: reload });
  const { visibleRows, toolbar } = useListTools(appels, { filename: 'appels-offres.csv' });
  const error = actionError || loadError;

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const reset = () => { setForm(empty); setEditId(null); setShowForm(false); setError(''); };

  const submit = async (e) => {
    e.preventDefault();
    const ok = editId
      ? await run(() => api.put(`/appels-offres/${editId}`, form), "L'appel d'offres a été modifié.")
      : await run(() => api.post('/appels-offres', form), "L'appel d'offres a été créé.");
    if (ok) reset();
  };
  const edit = (a) => {
    setForm({ reference: a.reference, titre: a.titre, description: a.description || '', budget_estime: a.budget_estime, date_limite: a.date_limite.slice(0, 16) });
    setEditId(a.id); setShowForm(true);
  };
  const remove = (a) => window.confirm("Supprimer cet appel d'offres ?") && run(() => api.delete(`/appels-offres/${a.id}`), "L'appel d'offres a été supprimé.");

  return (
    <div className="appels-container">
      <div className="appels-header"><h1>Gestion des Appels d'Offres</h1><button className="btn-add" onClick={() => (showForm ? reset() : setShowForm(true))}>{showForm ? 'Annuler' : "+ Nouvel Appel d'Offres"}</button></div>
      {error && <div className="alert-error" role="alert">{error}</div>}
      {showForm && <div className="form-card"><h2>{editId ? "Modifier l'appel d'offres" : "Créer un appel d'offres"}</h2><form onSubmit={submit} className="appel-form">
        <input type="text" name="reference" aria-label="Référence" placeholder="Référence (ex: AO-2026-003)" value={form.reference} onChange={change} required />
        <input type="text" name="titre" aria-label="Titre" placeholder="Titre" value={form.titre} onChange={change} required />
        <textarea name="description" aria-label="Description" placeholder="Description" value={form.description} onChange={change} rows={3} />
        <input type="number" min="0" name="budget_estime" aria-label="Budget estimé" placeholder="Budget estimé (MAD)" value={form.budget_estime} onChange={change} required />
        <input type="datetime-local" name="date_limite" aria-label="Date limite" value={form.date_limite} onChange={change} required />
        <button type="submit" className="btn-submit" disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
      </form></div>}
      {toolbar}
      <div className="table-container"><table className="appels-table"><thead><tr><th>Référence</th><th>Titre</th><th>Budget (MAD)</th><th>Date limite</th><th>Offres</th><th>Statut</th><th>Actions</th></tr></thead>
        <tbody>{visibleRows.map((a) => <tr key={a.id}><td>{a.reference}</td><td>{a.titre}</td><td>{formatMAD(a.budget_estime)}</td><td>{formatDateTime(a.date_limite)}</td><td>{a.offres_count}</td><td><StatusBadge statut={a.statut} /></td><td><div className="row-actions">
          {a.statut === 'BROUILLON' && <button className="btn-sm green" disabled={busy} onClick={() => run(() => api.post(`/appels-offres/${a.id}/publier`), "L'appel d'offres a été publié.")}>Publier</button>}
          {a.statut === 'PUBLIE' && <button className="btn-sm orange" disabled={busy} onClick={() => run(() => api.post(`/appels-offres/${a.id}/cloturer`), "L'appel d'offres a été clôturé.")}>Clôturer</button>}
          {['BROUILLON', 'PUBLIE'].includes(a.statut) && <button className="btn-sm" onClick={() => edit(a)}>Modifier</button>}
          {a.statut === 'BROUILLON' && a.offres_count === 0 && <button className="btn-sm red" disabled={busy} onClick={() => remove(a)}>Supprimer</button>}
        </div></td></tr>)}</tbody></table>
        {loading ? <p className="empty-msg" role="status">Chargement…</p> : visibleRows.length === 0 && <p className="empty-msg">Aucun appel d'offres trouvé pour ces critères.</p>}</div>
    </div>
  );
};
export default AppelsOffres;
