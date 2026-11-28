import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useFetch from '../hooks/useFetch';
import { navFor, ROLE_LABELS, ROLES } from '../lib/roles';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const { data: stats, loading, error: hasError } = useFetch('/stats', { initial: null });

  const cards = [
    { label: 'Appels d’offres actifs', value: stats?.appels_actifs, detail: 'Procédures actuellement ouvertes', icon: '↗', tone: 'blue' },
    { label: user?.role === 'SOUMISSIONNAIRE' ? 'Mes offres' : 'Offres reçues', value: stats?.offres, detail: 'Candidatures enregistrées', icon: '▤', tone: 'green' },
    { label: 'Marchés en cours', value: stats?.marches_en_cours, detail: 'Contrats en phase d’exécution', icon: '◷', tone: 'orange' },
  ];
  const shortcuts = navFor(user?.role).filter((item) => item.to !== '/marches' || user?.role !== ROLES.ADMIN).slice(0, 2);
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">ESPACE DE TRAVAIL</p>
          <h1 className="dashboard-title">Bonjour{user?.name ? `, ${user.name}` : ''} 👋</h1>
          <p className="dashboard-subtitle">Retrouvez un aperçu de votre activité et vos accès rapides.</p>
        </div>
        {user?.role && <span className="dashboard-role">{ROLE_LABELS[user.role] || user.role}</span>}
      </header>
      {!!hasError && <div className="dashboard-alert" role="status">Les indicateurs sont momentanément indisponibles. Vous pouvez toujours utiliser les accès rapides.</div>}
      <section aria-labelledby="dashboard-stats-title">
        <div className="dashboard-section-heading"><div><h2 id="dashboard-stats-title">Vue d’ensemble</h2><p>Les indicateurs clés de votre espace</p></div></div>
        <div className="stats-grid">
          {cards.map((card) => <article className="stat-card" key={card.label}>
            <div className="stat-card-topline"><span className="stat-label">{card.label}</span><span className={`stat-icon stat-icon-${card.tone}`} aria-hidden="true">{card.icon}</span></div>
            <p className="stat-number" aria-live="polite">{loading ? <span className="stat-skeleton" aria-label="Chargement">&nbsp;</span> : (card.value ?? '—')}</p>
            <p className="stat-detail">{card.detail}</p>
          </article>)}
        </div>
      </section>
      <section className="dashboard-shortcuts" aria-labelledby="dashboard-shortcuts-title">
        <div className="dashboard-section-heading"><div><h2 id="dashboard-shortcuts-title">Accès rapides</h2><p>Continuez votre travail en quelques clics</p></div></div>
        <div className="shortcut-grid">{shortcuts.map((shortcut) => <Link className="shortcut-card" to={shortcut.to} key={shortcut.to}>
          <span className="shortcut-arrow" aria-hidden="true">↗</span><span className="shortcut-title">{shortcut.label}</span><span className="shortcut-description">{shortcut.description}</span>
        </Link>)}</div>
      </section>
    </div>
  );
};

export default Dashboard;
