import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { navFor, ROLE_LABELS } from '../lib/roles';
import NotificationToasts from './NotificationToasts';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = navFor(user?.role);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const linkClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`;

  return (
    <div className="layout-container">
      <NotificationToasts />
      <aside className="sidebar">
        <div className="sidebar-header">Marchés Publics</div>
        <nav className="sidebar-nav" aria-label="Navigation principale">
          <NavLink to="/dashboard" className={linkClass}>Tableau de bord</NavLink>
          {links.map((item) => <NavLink key={item.to} to={item.to} className={linkClass}>{item.label}</NavLink>)}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">Connecté en tant que :<br /><span className="user-role">{ROLE_LABELS[user?.role] || user?.role}</span></div>
          <button onClick={handleLogout} className="btn-logout">Déconnexion</button>
        </div>
      </aside>
      <main className="main-content"><Outlet /></main>
    </div>
  );
};

export default Layout;
