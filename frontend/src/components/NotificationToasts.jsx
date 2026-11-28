import { useEffect, useState } from 'react';
import './NotificationToasts.css';

const NotificationToasts = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const onNotification = (event) => {
      const id = `${Date.now()}-${Math.random()}`;
      setItems((current) => [...current, { id, ...event.detail }]);
      window.setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), 4500);
    };
    window.addEventListener('app-notification', onNotification);
    return () => window.removeEventListener('app-notification', onNotification);
  }, []);

  return (
    <div className="notification-stack" aria-live="polite" aria-relevant="additions">
      {items.map((item) => (
        <div className={`notification-toast notification-${item.type}`} role="status" key={item.id}>
          <span>{item.message}</span>
          <button type="button" onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))} aria-label="Fermer la notification">×</button>
        </div>
      ))}
    </div>
  );
};

export default NotificationToasts;
