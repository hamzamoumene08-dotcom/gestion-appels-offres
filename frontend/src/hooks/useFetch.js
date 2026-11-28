import { useCallback, useEffect, useRef, useState } from 'react';
import api, { errMsg } from '../lib/api';

// Charge une ressource GET, ignore les réponses obsolètes et expose { data, loading, error, reload }.
export default function useFetch(url, { params, enabled = true, initial = [] } = {}) {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState('');
  const requestId = useRef(0);
  const paramsKey = JSON.stringify(params ?? null);

  const reload = useCallback(async () => {
    if (!enabled || !url) { setData(initial); setLoading(false); return; }
    const id = ++requestId.current;
    setLoading(true);
    try {
      const res = await api.get(url, { params: paramsKey === 'null' ? undefined : JSON.parse(paramsKey) });
      if (id === requestId.current) { setData(res.data); setError(''); }
    } catch (e) {
      if (id === requestId.current) setError(errMsg(e));
    } finally {
      if (id === requestId.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, paramsKey, enabled]);

  useEffect(() => { reload(); }, [reload]);

  return { data, loading, error, setError, reload };
}
