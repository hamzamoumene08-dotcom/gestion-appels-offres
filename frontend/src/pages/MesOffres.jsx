import { useListTools } from '../components/ListTools';
import StatusBadge from '../components/StatusBadge';
import useFetch from '../hooks/useFetch';
import { formatDate, formatMAD } from '../lib/format';
import './AppelsOffres.css';

const MesOffres = () => {
  const { data: offres, loading, error } = useFetch('/offres');
  const { visibleRows, toolbar } = useListTools(offres, { filename: 'mes-offres.csv' });
  return <div className="appels-container">
    <div className="appels-header"><h1>Mes offres</h1></div>
    {error && <div className="alert-error" role="alert">{error}</div>}
    {toolbar}
    <div className="table-container"><table className="appels-table"><thead><tr><th>Appel d'offres</th><th>Montant (MAD)</th><th>Date de dépôt</th><th>Statut</th><th>Note</th><th>Rang</th></tr></thead>
      <tbody>{visibleRows.map((o) => <tr key={o.id}><td>{o.appel_offre?.reference} — {o.appel_offre?.titre}</td><td>{formatMAD(o.montant)}</td><td>{formatDate(o.date_depot)}</td><td><StatusBadge statut={o.statut} /></td><td>{o.note_finale ?? '–'}</td><td>{o.rang ?? '–'}</td></tr>)}</tbody>
    </table>{loading ? <p className="empty-msg" role="status">Chargement…</p> : visibleRows.length === 0 && <p className="empty-msg">Aucune offre ne correspond à ces critères.</p>}</div>
  </div>;
};
export default MesOffres;
