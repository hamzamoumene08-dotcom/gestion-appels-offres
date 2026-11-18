import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/stats').then((r) => setStats(r.data)).catch(() => setStats(null));
  }, []);

  return (
    <div>
      <h1 className="dashboard-title">Bienvenue, {user?.name}</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h2>Appels d'offres actifs</h2>
          <p className="stat-number blue">{stats?.appels_actifs ?? '–'}</p>
        </div>
        <div className="stat-card">
          <h2>{user?.role === 'SOUMISSIONNAIRE' ? 'Mes offres' : 'Offres reçues'}</h2>
          <p className="stat-number green">{stats?.offres ?? '–'}</p>
        </div>
        <div className="stat-card">
          <h2>Marchés en cours</h2>
          <p className="stat-number orange">{stats?.marches_en_cours ?? '–'}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
