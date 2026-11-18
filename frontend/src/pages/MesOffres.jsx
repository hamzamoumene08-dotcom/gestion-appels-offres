import { useEffect, useState } from 'react';
import api, { errMsg } from '../lib/api';
import './AppelsOffres.css';

const MesOffres = () => {
  const [offres, setOffres] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/offres').then((r) => setOffres(r.data)).catch((e) => setError(errMsg(e)));
  }, []);

  return (
    <div className="appels-container">
      <div className="appels-header"><h1>Mes offres</h1></div>
      {error && <div className="alert-error">{error}</div>}
      <div className="table-container">
        <table className="appels-table">
          <thead>
            <tr><th>Appel d'offres</th><th>Montant (MAD)</th><th>Date de dépôt</th><th>Statut</th><th>Note</th><th>Rang</th></tr>
          </thead>
          <tbody>
            {offres.map((o) => (
              <tr key={o.id}>
                <td>{o.appel_offre.reference} — {o.appel_offre.titre}</td>
                <td>{o.montant.toLocaleString()}</td>
                <td>{new Date(o.date_depot).toLocaleDateString('fr-FR')}</td>
                <td><span className={`status ${o.statut.toLowerCase()}`}>{o.statut}</span></td>
                <td>{o.note_finale ?? '–'}</td>
                <td>{o.rang ?? '–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {offres.length === 0 && <p className="empty-msg">Vous n'avez déposé aucune offre.</p>}
      </div>
    </div>
  );
};

export default MesOffres;
