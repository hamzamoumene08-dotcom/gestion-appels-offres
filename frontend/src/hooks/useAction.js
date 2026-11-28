import { useCallback, useState } from 'react';
import { errMsg } from '../lib/api';
import { notify } from '../lib/notifications';

// Exécute une action API avec état "en cours", message d'erreur et notification de succès.
export default function useAction({ onDone } = {}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const run = useCallback(async (fn, successMessage) => {
    setBusy(true); setError('');
    try {
      const result = await fn();
      if (successMessage) notify(successMessage);
      await onDone?.(result);
      return true;
    } catch (e) {
      setError(errMsg(e));
      return false;
    } finally {
      setBusy(false);
    }
  }, [onDone]);

  return { run, busy, error, setError };
}
