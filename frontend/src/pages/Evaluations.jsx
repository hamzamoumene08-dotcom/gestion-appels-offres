import { useEffect, useState } from 'react';
import api, { errMsg } from '../lib/api';
import './AppelsOffres.css';

const OffreEval = ({ offre, onDone, onError }) => {
  const [conforme, setConforme] = useState(offre.conforme_administrativement ?? true);
  const [note, setNote] = useState(offre.note_finale ?? '');
  const [commentaire, setCommentaire] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/offres/${offre.id}/evaluation`, { conforme, note_technique: conforme ? note : null, commentaire });
      onDone();
    } catch (err) { onError(errMsg(err)); }
  };

  return (
    <div className="eval-box">
      <strong>{offre.soumissionnaire.raison_sociale}</strong> — {offre.montant.toLocaleString()} MAD{' '}
      <span className={`status ${offre.statut.toLowerCase()}`}>{offre.statut}</span>
      {offre.rang && <> · rang <strong>{offre.rang}</strong></>}
      {offre.fichier_path && <> · <a href={`${(import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '')}/storage/${offre.fichier_path}`} target="_blank" rel="noreferrer">dossier</a></>}
      <form onSubmit={submit}>
        <label><input type="checkbox" checked={conforme} onChange={(e) => setConforme(e.target.checked)} /> Conforme administrativement</label>
        {conforme && <input type="number" min="0" max="20" step="0.25" placeholder="Note /20" value={note} onChange={(e) => setNote(e.target.value)} required />}
        <input type="text" placeholder="Commentaire" value={commentaire} onChange={(e) => setCommentaire(e.target.value)} />
        <button type="submit" className="btn-sm">Enregistrer</button>
      </form>
    </div>
  );
};

const Evaluations = () => {
  const [appels, setAppels] = useState([]);
  const [appelId, setAppelId] = useState('');
  const [offres, setOffres] = useState([]);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  useEffect(() => {
    api.get('/appels-offres', { params: { statut: 'CLOTURE,EVALUE' } }).then((r) => setAppels(r.data)).catch((e) => setError(errMsg(e)));
  }, []);

  const loadOffres = (id = appelId) => {
    if (!id) return setOffres([]);
    api.get('/offres', { params: { appel_offre_id: id } }).then((r) => setOffres(r.data)).catch((e) => setError(errMsg(e)));
  };

  const classer = async () => {
    setError(''); setOk('');
    try {
      await api.post(`/appels-offres/${appelId}/classer`);
      setOk('Offres classées. Le gestionnaire peut maintenant attribuer le marché.');
      loadOffres();
    } catch (err) { setError(errMsg(err)); }
  };

  return (
    <div className="appels-container">
      <div className="appels-header"><h1>Évaluation des offres</h1></div>
      {error && <div className="alert-error">{error}</div>}
      {ok && <div className="alert-ok">{ok}</div>}

      <div className="form-card">
        <select value={appelId} onChange={(e) => { setAppelId(e.target.value); setOk(''); loadOffres(e.target.value); }} style={{ padding: 10, width: '100%' }}>
          <option value="">— Choisir un appel d'offres clôturé —</option>
          {appels.map((a) => <option key={a.id} value={a.id}>{a.reference} — {a.titre} ({a.statut})</option>)}
        </select>
      </div>

      {appelId && (
        <>
          {offres.map((o) => <OffreEval key={o.id} offre={o} onDone={() => { setError(''); loadOffres(); }} onError={setError} />)}
          {offres.length === 0 && <p className="empty-msg">Aucune offre reçue.</p>}
          {offres.length > 0 && <button className="btn-add" onClick={classer}>Classer les offres</button>}
        </>
      )}
    </div>
  );
};

export default Evaluations;
