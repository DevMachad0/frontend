import React, { createContext, useCallback, useContext, useState } from 'react';
import './Confirm.css';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [queue, setQueue] = useState([]);

  const confirm = useCallback((opts) => {
    return new Promise((resolve) => {
      const id = Date.now() + Math.random();
      const item = { id, opts, resolve, leaving: false };
      setQueue((q) => [...q, item]);
    });
  }, []);

  const handleCloseImmediate = useCallback((id, result) => {
    setQueue((q) => q.filter((i) => i.id !== id));
    const item = queue.find((i) => i.id === id);
    if (item) item.resolve(result);
  }, [queue]);

  const startClose = useCallback((id, result) => {
    setQueue((q) => q.map((i) => (i.id === id ? { ...i, leaving: true } : i)));
    setTimeout(() => handleCloseImmediate(id, result), 300);
  }, [handleCloseImmediate]);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {queue.map((item) => (
        <div key={item.id} className={`confirm-overlay ${item.leaving ? 'leaving' : 'show'}`}>
          <div className={`confirm-modal ${item.leaving ? 'leaving' : 'show'}`}>
            <div className="confirm-message">{item.opts.message}</div>
            <div className="confirm-actions">
              <button className="btn" onClick={() => startClose(item.id, false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={() => startClose(item.id, true)}>Confirmar</button>
            </div>
          </div>
        </div>
      ))}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx.confirm;
}

export default ConfirmProvider;
