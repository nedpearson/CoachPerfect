// ═══════════════════════════════════════════════════
// SHARED API HOOK — loading / error / data pattern
// ═══════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react';

/**
 * useApi(apiFn, deps?)
 * Runs apiFn() on mount (and when deps change).
 * Returns { data, loading, error, refresh }.
 */
export function useApi(apiFn, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn();
      setData(result);
    } catch (err) {
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { refresh(); }, [refresh]);

  return { data, loading, error, refresh };
}

/** Minimal loading spinner */
export function Spinner({ size = 20 }) {
  return (
    <div style={{
      width: size, height: size, margin: '0 auto',
      border: '3px solid #e8e8ef',
      borderTopColor: '#1e3a5f',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );
}

/** Empty state placeholder */
export function Empty({ icon = '📭', message = 'Nothing here yet', sub = '' }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8b8ba0' }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#1e3a5f', marginBottom: 4 }}>{message}</div>
      {sub && <div style={{ fontSize: 12 }}>{sub}</div>}
    </div>
  );
}

/** Error box */
export function ApiError({ message, onRetry }) {
  return (
    <div style={{
      padding: '14px 16px',
      borderRadius: 8,
      background: '#fff0f0',
      border: '1px solid #ffcdd2',
      color: '#b71c1c',
      fontSize: 13,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <span>⚠ {message}</span>
      {onRetry && (
        <button onClick={onRetry} style={{ background: 'none', border: 'none', color: '#1e3a5f', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>
          Retry
        </button>
      )}
    </div>
  );
}
