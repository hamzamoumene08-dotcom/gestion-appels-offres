import { useEffect, useState } from 'react';
import api, { errMsg } from '../lib/api';
import './AppelsOffres.css';

const AppelsDispo = () => {
  const [appels, setAppels] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [montant, setMontant] = useState('');
  const [fichier, setFichier] = useState(null);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const load = () => api.get('/appels-offres').then((r) => setAppels(r.data)).catch((e) => setError(errMsg(e)));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setOk('');
    const fd = new FormData();
    fd.append('appel_offre_id', openId);
    fd.append('montant', montant);
    if (fichier) fd.append('fichier', fichier);
    try {
      await api.post('/offres', fd);
      setOk('Offre déposée avec succès.');
      setOpenId(null); setMontant(''); setFichier(null);
      load();
    } catch (err) { setError(errMsg(err)); }
  };

  return (
    <div className="appels-container">
      <div className="appels-header"><h1>Appels d'offres ouverts</h1></div>
      {error && <div className="alert-error">{error}</div>}
      {ok && <div className="alert-ok">{ok}</div>}

      <div className="table-container">
        <table className="appels-table">
          <thead>
            <tr><th>Référence</th><th>Titre</th><th>Description</th><th>Budget (MAD)</th><th>Date limite</th><th>Action</th></tr>
          </thead>
          <tbody>
            {appels.map((a) => (
              <>
                <tr key={a.id}>
                  <td>{a.reference}</td>
                  <td>{a.titre}</td>
                  <td>{a.description}</td>
                  <td>{a.budget_estime.toLocaleString()}</td>
                  <td>{new Date(a.date_limite).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td>
                    {a.deja_depose
                      ? <span className="status conforme">Offre déposée</span>
                      : <button className="btn-sm" onClick={() => setOpenId(openId === a.id ? null : a.id)}>Déposer une offre</button>}
                  </td>
                </tr>
                {openId === a.id && (
                  <tr key={`f${a.id}`}>
                    <td colSpan={6}>
                      <form onSubmit={submit} className="appel-form">
                        <input type="number" placeholder="Montant de l'offre (MAD)" value={montant} onChange={(e) => setMontant(e.target.value)} required />
                        <input type="file" accept=".pdf,.doc,.docx,.zip" onChange={(e) => setFichier(e.target.files[0])} />
                        <button type="submit" className="btn-submit">Envoyer l'offre</button>
                      </form>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        {appels.length === 0 && <p className="empty-msg">Aucun appel d'offres ouvert.</p>}
      </div>
    </div>
  );
};

export default AppelsDispo;
