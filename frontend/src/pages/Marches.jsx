import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { errMsg } from '../lib/api';
import './AppelsOffres.css';

const Marches = () => {
  const { user } = useAuth();
  const gest = user.role === 'GESTIONNAIRE';
  const [marches, setMarches] = useState([]);
  const [aAttribuer, setAAttribuer] = useState([]);
  const [error, setError] = useState('');

  const load = () => {
    api.get('/marches').then((r) => setMarches(r.data)).catch((e) => setError(errMsg(e)));
    api.get('/appels-offres', { params: { statut: 'EVALUE' } }).then((r) => setAAttribuer(r.data)).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const run = async (fn) => {
    setError('');
    try { await fn(); load(); } catch (err) { setError(errMsg(err)); }
  };

  const setTaux = (m) => {
    const v = window.prompt("Nouveau taux d'avancement (0-100) :", m.taux_avancement);
    if (v !== null && v !== '') run(() => api.patch(`/marches/${m.id}/avancement`, { taux_avancement: parseInt(v, 10) }));
  };

  return (
    <div className="appels-container">
      <div className="appels-header"><h1>Suivi des marchés</h1></div>
      {error && <div className="alert-error">{error}</div>}

      {gest && aAttribuer.length > 0 && (
        <>
          <h2 className="section-title">Appels évalués — prêts à être attribués</h2>
          <div className="table-container">
            <table className="appels-table">
              <thead><tr><th>Référence</th><th>Titre</th><th>Action</th></tr></thead>
              <tbody>
                {aAttribuer.map((a) => (
                  <tr key={a.id}>
                    <td>{a.reference}</td><td>{a.titre}</td>
                    <td><button className="btn-sm green" onClick={() => run(() => api.post(`/appels-offres/${a.id}/attribuer`))}>Attribuer à l'offre classée 1re</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h2 className="section-title">Marchés publics</h2>
      <div className="table-container">
        <table className="appels-table">
          <thead>
            <tr><th>Appel d'offres</th><th>Titulaire</th><th>Montant final (MAD)</th><th>Début</th><th>Avancement</th><th>Statut</th>{gest && <th>Action</th>}</tr>
          </thead>
          <tbody>
            {marches.map((m) => (
              <tr key={m.id}>
                <td>{m.appel_offre.reference} — {m.appel_offre.titre}</td>
                <td>{m.offre.soumissionnaire.raison_sociale}</td>
                <td>{m.montant_final.toLocaleString()}</td>
                <td>{m.date_debut}</td>
                <td><div className="progress"><div style={{ width: `${m.taux_avancement}%` }} /></div> {m.taux_avancement}%</td>
                <td><span className={`status ${m.statut.toLowerCase()}`}>{m.statut}</span></td>
                {gest && <td><button className="btn-sm" onClick={() => setTaux(m)}>Mettre à jour</button></td>}
              </tr>
            ))}
          </tbody>
        </table>
        {marches.length === 0 && <p className="empty-msg">Aucun marché attribué.</p>}
      </div>
    </div>
  );
};

export default Marches;
