import { useState } from 'react';
import AIPreview from './AIPreview';
import { extractAI } from '../api';

export default function AIImport({ onClose, onRefresh }) {
  const [text, setText] = useState('');
  const [actions, setActions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await extractAI(text);
      setActions(result.actions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplied = () => {
    onRefresh();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">✦ Importar con IA</h3>

        {!actions ? (
          <>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 'var(--gap-md)' }}>
              Pegá el texto de tu daily, reunión o resumen. La IA detectará tareas y cambios de estado.
            </p>
            <textarea
              className="ai-textarea"
              placeholder="Hoy Juan terminó el login, Ana empezó con el dashboard pero está bloqueada por la API de pagos..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              autoFocus
            />
            {error && (
              <p style={{ color: 'var(--red)', fontSize: '0.8rem', marginTop: 'var(--gap-sm)', fontFamily: 'var(--font-mono)' }}>
                {error}
              </p>
            )}
            <div className="modal-actions">
              <button className="btn" onClick={onClose}>Cancelar</button>
              <button
                className="btn btn-primary btn-lg"
                onClick={handleAnalyze}
                disabled={loading || !text.trim()}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                    Analizando...
                  </span>
                ) : (
                  'Analizar'
                )}
              </button>
            </div>
          </>
        ) : (
          <AIPreview
            actions={actions}
            onApplied={handleApplied}
            onBack={() => setActions(null)}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}
