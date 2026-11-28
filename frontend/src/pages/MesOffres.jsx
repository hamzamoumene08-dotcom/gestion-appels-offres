import { useEffect, useState } from 'react';
import { useListTools } from '../components/ListTools';
import { notify } from '../lib/notifications';
import api, { errMsg } from '../lib/api';
import './AppelsOffres.css';

const MesOffres = () => {
  const [offres, setOffres] = useState([]);
  const [error, setError] = useState('');
  const { visibleRows, toolbar } = useListTools(offres, { filename: 'mes-offres.csv' });
  useEffect(() => { api.get('/offres').then((r) => setOffres(r.data)).catch((e) => setError(errMsg(e))); }, []);
  return <div className="appels-container">
    <div className="appels-header"><h1>Mes offres</h1></div>
    {error && <div className="alert-error" role="alert">{error}</div>}
    {toolbar}
    <div className="table-container"><table className="appels-table"><thead><tr><th>Appel d'offres</th><th>Montant (MAD)</th><th>Date de dépôt</th><th>Statut</th><th>Note</th><th>Rang</th></tr></thead>
      <tbody>{visibleRows.map((o) => <tr key={o.id}><td>{o.appel_offre?.reference} — {o.appel_offre?.titre}</td><td>{Number(o.montant).toLocaleString()}</td><td>{new Date(o.date_depot).toLocaleDateString('fr-FR')}</td><td><span className={`status ${o.statut.toLowerCase()}`}>{o.statut}</span></td><td>{o.note_finale ?? '–'}</td><td>{o.rang ?? '–'}</td></tr>)}</tbody>
    </table>{visibleRows.length === 0 && <p className="empty-msg">Aucune offre ne correspond à ces critères.</p>}</div>
  </div>;
};
export default MesOffres;
