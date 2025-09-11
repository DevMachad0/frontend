import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import './Notifications.css';

const NotificationsContext = createContext(null);

let idCounter = 1;

export function NotificationProvider({ children }) {
  const [list, setList] = useState([]);
  const timers = useRef(new Map());

  const removeImmediate = useCallback((id) => {
    setList((s) => s.filter((x) => x.id !== id));
    const t = timers.current.get(id);
    if (t) {
      clearTimeout(t);
      timers.current.delete(id);
    }
  }, []);

  const startRemove = useCallback((id) => {
    // mark as leaving -> trigger CSS exit
    setList((s) => s.map((it) => (it.id === id ? { ...it, leaving: true } : it)));
    // after animation, remove for real
    const t = setTimeout(() => removeImmediate(id), 360);
    timers.current.set(id, t);
  }, [removeImmediate]);

  const push = useCallback((type, message, opts = {}) => {
    const id = idCounter++;
    const timeout = opts.timeout ?? 4000;
    const item = { id, type, message, timeout, leaving: false };
    setList((s) => [item, ...s]);
    if (timeout > 0) {
      const t = setTimeout(() => startRemove(id), timeout);
      timers.current.set(id, t);
    }
    return id;
  }, [startRemove]);

  const success = useCallback((msg, opts) => push('success', msg, opts), [push]);
  const error = useCallback((msg, opts) => push('error', msg, opts), [push]);
  const info = useCallback((msg, opts) => push('info', msg, opts), [push]);

  const remove = useCallback((id) => startRemove(id), [startRemove]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      timers.current.forEach((t) => clearTimeout(t));
      timers.current.clear();
    };
  }, []);

  return (
    <NotificationsContext.Provider value={{ success, error, info, push, remove }}>
      {children}
      <div className="notification-wrapper" aria-live="polite">
        {list.map((n) => (
          <div key={n.id} className={`notification ${n.type} ${n.leaving ? 'leaving' : 'show'}`}>
            <div className="notification-message">{n.message}</div>
            <button className="notification-close" aria-label="Fechar" onClick={() => remove(n.id)}>×</button>
          </div>
        ))}
      </div>
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}

export default NotificationProvider;
