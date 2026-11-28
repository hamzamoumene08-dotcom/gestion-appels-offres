import { Fragment, useState } from 'react';
import { useListTools } from '../components/ListTools';
import useFetch from '../hooks/useFetch';
import useAction from '../hooks/useAction';
import api from '../lib/api';
import { formatDateTime, formatMAD } from '../lib/format';
import './AppelsOffres.css';

const MAX_FILE_MB = 10;

const AppelsDispo = () => {
  const { data: appels, loading, error: loadError, reload } = useFetch('/appels-offres');
  const [openId, setOpenId] = useState(null);
  const [montant, setMontant] = useState('');
  const [fichier, setFichier] = useState(null);
  const [fileError, setFileError] = useState('');
  const { run, busy, error: actionError } = useAction({ onDone: reload });
  const { visibleRows, toolbar } = useListTools(appels, { filename: 'appels-disponibles.csv' });
  const error = fileError || actionError || loadError;

  const pickFile = (e) => {
    const file = e.target.files[0] || null;
    if (file && file.size > MAX_FILE_MB * 1024 * 1024) {
      setFileError(`Le fichier dépasse ${MAX_FILE_MB} Mo.`); e.target.value = ''; setFichier(null); return;
    }
    setFileError(''); setFichier(file);
  };

  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('appel_offre_id', openId); fd.append('montant', montant);
    if (fichier) fd.append('fichier', fichier);
    const ok = await run(() => api.post('/offres', fd), 'Votre offre a été déposée.');
    if (ok) { setOpenId(null); setMontant(''); setFichier(null); }
  };

  return <div className="appels-container">
    <div className="appels-header"><h1>Appels d'offres ouverts</h1></div>
    {error && <div className="alert-error" role="alert">{error}</div>}
    {toolbar}
    <div className="table-container"><table className="appels-table"><thead><tr><th>Référence</th><th>Titre</th><th>Description</th><th>Budget (MAD)</th><th>Date limite</th><th>Action</th></tr></thead>
      <tbody>{visibleRows.map((a) => <Fragment key={a.id}>
        <tr><td>{a.reference}</td><td>{a.titre}</td><td>{a.description}</td><td>{formatMAD(a.budget_estime)}</td><td>{formatDateTime(a.date_limite)}</td><td>{a.deja_depose ? <span className="status conforme">Offre déposée</span> : <button className="btn-sm" aria-expanded={openId === a.id} onClick={() => setOpenId(openId === a.id ? null : a.id)}>Déposer une offre</button>}</td></tr>
        {openId === a.id && <tr><td colSpan={6}><form onSubmit={submit} className="appel-form"><input type="number" min="0" step="0.01" aria-label="Montant de l'offre" placeholder="Montant de l'offre (MAD)" value={montant} onChange={(e) => setMontant(e.target.value)} required /><input type="file" aria-label="Dossier de l'offre" accept=".pdf,.doc,.docx,.zip" onChange={pickFile} /><button type="submit" className="btn-submit" disabled={busy}>{busy ? 'Envoi…' : "Envoyer l'offre"}</button></form></td></tr>}
      </Fragment>)}</tbody>
    </table>{loading ? <p className="empty-msg" role="status">Chargement…</p> : visibleRows.length === 0 && <p className="empty-msg">Aucun appel d'offres ouvert pour ces critères.</p>}</div>
  </div>;
};
export default AppelsDispo;
