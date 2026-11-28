import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;

    api.get('/stats')
      .then((response) => {
        if (active) setStats(response.data);
      })
      .catch(() => {
        if (active) setHasError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const cards = [
    {
      label: 'Appels d’offres actifs',
      value: stats?.appels_actifs,
      tone: 'blue',
      detail: 'Procédures actuellement ouvertes',
    },
    {
      label: user?.role === 'SOUMISSIONNAIRE' ? 'Mes offres' : 'Offres reçues',
      value: stats?.offres,
      tone: 'green',
      detail: user?.role === 'SOUMISSIONNAIRE' ? 'Offres déposées par vous' : 'Candidatures enregistrées',
    },
    {
      label: 'Marchés en cours',
      value: stats?.marches_en_cours,
      tone: 'orange',
      detail: 'Contrats en phase d’exécution',
    },
  ];

  const shortcuts = {
    GESTIONNAIRE: [
      { label: 'Gérer les appels d’offres', to: '/appels-offres', description: 'Consulter et piloter les procédures' },
      { label: 'Suivre les marchés', to: '/marches', description: 'Voir l’avancement des contrats' },
    ],
    ADMINISTRATEUR: [
      { label: 'Gérer les appels d’offres', to: '/appels-offres', description: 'Consulter et piloter les procédures' },
      { label: 'Gérer les utilisateurs', to: '/utilisateurs', description: 'Administrer les comptes et les accès' },
    ],
    SOUMISSIONNAIRE: [
      { label: 'Appels d’offres disponibles', to: '/appels-offres-dispo', description: 'Trouver une procédure à laquelle répondre' },
      { label: 'Mes offres', to: '/mes-offres', description: 'Suivre vos candidatures déposées' },
    ],
    COMMISSION: [
      { label: 'Évaluer les offres', to: '/evaluations', description: 'Accéder aux dossiers à évaluer' },
    ],
  };

  const roleLabels = {
    GESTIONNAIRE: 'Gestionnaire',
    ADMINISTRATEUR: 'Administrateur',
    SOUMISSIONNAIRE: 'Soumissionnaire',
    COMMISSION: 'Membre de la commission',
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">ESPACE DE TRAVAIL</p>
          <h1 className="dashboard-title">Bonjour{user?.name ? `, ${user.name}` : ''} 👋</h1>
          <p className="dashboard-subtitle">Retrouvez ici un aperçu de votre activité et vos accès rapides.</p>
        </div>
        {user?.role && (
          <span className="dashboard-role">{roleLabels[user.role] || user.role}</span>
        )}
      </header>

      {hasError && (
        <div className="dashboard-alert" role="status">
          Les indicateurs ne sont pas disponibles pour le moment. Vous pouvez continuer à utiliser les accès rapides.
        </div>
      )}

      <section aria-labelledby="dashboard-stats-title">
        <div className="dashboard-section-heading">
          <div>
            <h2 id="dashboard-stats-title">Vue d’ensemble</h2>
            <p>Les indicateurs clés de votre espace</p>
          </div>
        </div>
        <div className="stats-grid">
          {cards.map((card) => (
            <article className={`stat-card stat-card-${card.tone}`} key={card.label}>
              <div className="stat-card-topline">
                <span className="stat-label">{card.label}</span>
                <span className={`stat-icon stat-icon-${card.tone}`} aria-hidden="true">
                  {card.tone === 'blue' ? '↗' : card.tone === 'green' ? '▤' : '◷'}
                </span>
              </div>
              <p className="stat-number" aria-live="polite">
                {loading ? <span className="stat-skeleton" aria-label="Chargement">&nbsp;</span> : (card.value ?? '—')}
              </p>
              <p className="stat-detail">{card.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-shortcuts" aria-labelledby="dashboard-shortcuts-title">
        <div className="dashboard-section-heading">
          <div>
            <h2 id="dashboard-shortcuts-title">Accès rapides</h2>
            <p>Continuez votre travail en quelques clics</p>
          </div>
        </div>
        <div className="shortcut-grid">
          {(shortcuts[user?.role] || []).map((shortcut) => (
            <Link className="shortcut-card" to={shortcut.to} key={shortcut.to}>
              <span className="shortcut-arrow" aria-hidden="true">↗</span>
              <span className="shortcut-title">{shortcut.label}</span>
              <span className="shortcut-description">{shortcut.description}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
