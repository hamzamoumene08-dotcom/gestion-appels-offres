import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          Marchés Publics
        </div>
        
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-link">Tableau de bord</Link>

          {(user?.role === 'GESTIONNAIRE' || user?.role === 'ADMINISTRATEUR') && (
            <>
              <Link to="/appels-offres" className="nav-link">Gérer les Appels d'Offres</Link>
              <Link to="/marches" className="nav-link">Suivi des Marchés</Link>
            </>
          )}

          {user?.role === 'ADMINISTRATEUR' && (
            <Link to="/utilisateurs" className="nav-link">Gérer les utilisateurs</Link>
          )}

          {user?.role === 'SOUMISSIONNAIRE' && (
            <>
              <Link to="/appels-offres-dispo" className="nav-link">Consulter les Appels d'Offres</Link>
              <Link to="/mes-offres" className="nav-link">Mes Offres</Link>
            </>
          )}

          {user?.role === 'COMMISSION' && (
            <Link to="/evaluations" className="nav-link">Évaluer les Offres</Link>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            Connecté en tant que : <br/>
            <span className="user-role">{user?.role}</span>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet /> 
      </main>
    </div>
  );
};

export default Layout;
