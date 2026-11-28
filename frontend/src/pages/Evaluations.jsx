import { useState } from 'react';
import { useListTools } from '../components/ListTools';
import StatusBadge from '../components/StatusBadge';
import useFetch from '../hooks/useFetch';
import useAction from '../hooks/useAction';
import api, { fileUrl } from '../lib/api';
import { formatMAD } from '../lib/format';
import './AppelsOffres.css';

const OffreEval = ({ offre, onDone }) => {
  const [conforme, setConforme] = useState(offre.conforme_administrativement ?? true);
  const [note, setNote] = useState(offre.note_finale ?? '');
  const [commentaire, setCommentaire] = useState('');
  const { run, busy, error } = useAction({ onDone });

  const submit = (e) => {
    e.preventDefault();
    run(() => api.post(`/offres/${offre.id}/evaluation`, { conforme, note_technique: conforme ? note : null, commentaire }), 'L’évaluation de l’offre a été enregistrée.');
  };

  return <div className="eval-box"><strong>{offre.soumissionnaire?.raison_sociale || offre.soumissionnaire?.user?.name || 'Soumissionnaire'}</strong> — {formatMAD(offre.montant)} MAD <StatusBadge statut={offre.statut} />{offre.rang && <> · rang <strong>{offre.rang}</strong></>}
    {offre.fichier_path && <> · <a href={fileUrl(offre.fichier_path)} target="_blank" rel="noreferrer">Document</a></>}
    <form onSubmit={submit}><label><input type="checkbox" checked={conforme} onChange={(e) => setConforme(e.target.checked)} /> Conforme administrativement</label>{conforme && <input type="number" min="0" max="20" step="0.25" aria-label="Note sur 20" placeholder="Note /20" value={note} onChange={(e) => setNote(e.target.value)} required />}<input type="text" aria-label="Commentaire" placeholder="Commentaire" value={commentaire} onChange={(e) => setCommentaire(e.target.value)} /><button type="submit" className="btn-sm" disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer'}</button></form>
    {error && <div className="alert-error" role="alert">{error}</div>}
  </div>;
};

const Evaluations = () => {
  const [appelId, setAppelId] = useState('');
  const appels = useFetch('/appels-offres', { params: { statut: 'CLOTURE,EVALUE' } });
  const offres = useFetch('/offres', { params: { appel_offre_id: appelId }, enabled: !!appelId });
  const { run, busy, error: actionError } = useAction({ onDone: offres.reload });
  const { visibleRows, toolbar } = useListTools(offres.data, { filename: 'evaluations-offres.csv' });
  const error = actionError || appels.error || offres.error;

  return <div className="appels-container">
    <div className="appels-header"><h1>Évaluation des offres</h1></div>
    {error && <div className="alert-error" role="alert">{error}</div>}
    <div className="form-card"><select aria-label="Appel d'offres clôturé" value={appelId} onChange={(e) => setAppelId(e.target.value)} style={{ padding: 10, width: '100%' }}><option value="">— Choisir un appel d'offres clôturé —</option>{appels.data.map((a) => <option key={a.id} value={a.id}>{a.reference} — {a.titre} ({a.statut})</option>)}</select></div>
    {appelId && <>{toolbar}{visibleRows.map((offre) => <OffreEval key={offre.id} offre={offre} onDone={offres.reload} />)}{!offres.loading && visibleRows.length === 0 && <p className="empty-msg">Aucune offre ne correspond à ces critères.</p>}{offres.data.length > 0 && <button className="btn-add" disabled={busy} onClick={() => run(() => api.post(`/appels-offres/${appelId}/classer`), 'Les offres ont été classées.')}>Classer les offres</button>}</>}
  </div>;
};
export default Evaluations;
