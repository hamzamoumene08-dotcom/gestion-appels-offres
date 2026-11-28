import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useListTools } from '../components/ListTools';
import StatusBadge from '../components/StatusBadge';
import useFetch from '../hooks/useFetch';
import useAction from '../hooks/useAction';
import api from '../lib/api';
import { formatDate, formatMAD } from '../lib/format';
import { ROLES } from '../lib/roles';
import './AppelsOffres.css';

const titulaire = (m) => m.offre?.soumissionnaire?.raison_sociale || m.offre?.soumissionnaire?.user?.name || 'Soumissionnaire';

const Marches = () => {
  const { user } = useAuth();
  const gest = user.role === ROLES.GESTIONNAIRE;
  const marches = useFetch('/marches');
  const aAttribuer = useFetch('/appels-offres', { params: { statut: 'EVALUE' }, enabled: gest });
  const [editing, setEditing] = useState(null); // { id, value }
  const reloadAll = () => Promise.all([marches.reload(), aAttribuer.reload()]);
  const { run, busy, error: actionError } = useAction({ onDone: reloadAll });
  const { visibleRows, toolbar } = useListTools(marches.data, { filename: 'marches-publics.csv' });
  const error = actionError || marches.error;

  const saveTaux = async (e) => {
    e.preventDefault();
    const taux = Number.parseInt(editing.value, 10);
    if (Number.isNaN(taux) || taux < 0 || taux > 100) return;
    const ok = await run(() => api.patch(`/marches/${editing.id}/avancement`, { taux_avancement: taux }), "L'avancement du marché a été mis à jour.");
    if (ok) setEditing(null);
  };

  return <div className="appels-container">
    <div className="appels-header"><h1>Suivi des marchés</h1></div>
    {error && <div className="alert-error" role="alert">{error}</div>}
    {gest && aAttribuer.data.length > 0 && <><h2 className="section-title">Appels évalués — prêts à être attribués</h2><div className="table-container"><table className="appels-table"><thead><tr><th>Référence</th><th>Titre</th><th>Action</th></tr></thead><tbody>{aAttribuer.data.map((a) => <tr key={a.id}><td>{a.reference}</td><td>{a.titre}</td><td><button className="btn-sm green" disabled={busy} onClick={() => run(() => api.post(`/appels-offres/${a.id}/attribuer`), 'Le marché a été attribué.')}>Attribuer à l'offre classée 1re</button></td></tr>)}</tbody></table></div></>}
    <h2 className="section-title">Marchés publics</h2>{toolbar}
    <div className="table-container"><table className="appels-table"><thead><tr><th>Appel d'offres</th><th>Titulaire</th><th>Montant final (MAD)</th><th>Début</th><th>Avancement</th><th>Statut</th>{gest && <th>Action</th>}</tr></thead>
      <tbody>{visibleRows.map((m) => <tr key={m.id}><td>{m.appel_offre?.reference} — {m.appel_offre?.titre}</td><td>{titulaire(m)}</td><td>{formatMAD(m.montant_final)}</td><td>{formatDate(m.date_debut)}</td><td><div className="progress" role="progressbar" aria-valuenow={m.taux_avancement} aria-valuemin={0} aria-valuemax={100}><div style={{ width: `${m.taux_avancement}%` }} /></div> {m.taux_avancement}%</td><td><StatusBadge statut={m.statut} /></td>{gest && <td>{editing?.id === m.id
        ? <form className="row-actions" onSubmit={saveTaux}><input type="number" min="0" max="100" aria-label="Taux d'avancement (%)" className="taux-input" value={editing.value} onChange={(e) => setEditing({ id: m.id, value: e.target.value })} autoFocus required /><button type="submit" className="btn-sm green" disabled={busy}>OK</button><button type="button" className="btn-sm gray" onClick={() => setEditing(null)}>Annuler</button></form>
        : <button className="btn-sm" onClick={() => setEditing({ id: m.id, value: String(m.taux_avancement ?? 0) })}>Mettre à jour</button>}</td>}</tr>)}</tbody>
    </table>{marches.loading ? <p className="empty-msg" role="status">Chargement…</p> : visibleRows.length === 0 && <p className="empty-msg">Aucun marché pour ces critères.</p>}</div>
  </div>;
};
export default Marches;
