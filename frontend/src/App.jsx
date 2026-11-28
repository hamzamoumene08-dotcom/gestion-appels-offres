import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { ROLES } from './lib/roles'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const AppelsOffres = lazy(() => import('./pages/AppelsOffres'))
const AppelsDispo = lazy(() => import('./pages/AppelsDispo'))
const MesOffres = lazy(() => import('./pages/MesOffres'))
const Evaluations = lazy(() => import('./pages/Evaluations'))
const Marches = lazy(() => import('./pages/Marches'))
const Utilisateurs = lazy(() => import('./pages/Utilisateurs'))

const { ADMIN, GESTIONNAIRE, COMMISSION, SOUMISSIONNAIRE } = ROLES

const Protected = ({ roles, children }) => {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/" replace state={{ from: location.pathname }} />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return children
}

const PublicOnly = ({ children }) => {
  const { user } = useAuth()
  return user ? <Navigate to="/dashboard" replace /> : children
}

const guard = (roles, element) => <Protected roles={roles}>{element}</Protected>

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="page-fallback" role="status">Chargement…</div>}>
        <Routes>
          <Route path="/" element={<PublicOnly><LoginPage /></PublicOnly>} />
          <Route path="/inscription" element={<PublicOnly><RegisterPage /></PublicOnly>} />
          <Route element={<Protected><Layout /></Protected>}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="appels-offres" element={guard([GESTIONNAIRE, ADMIN], <AppelsOffres />)} />
            <Route path="marches" element={guard([GESTIONNAIRE, ADMIN], <Marches />)} />
            <Route path="appels-offres-dispo" element={guard([SOUMISSIONNAIRE], <AppelsDispo />)} />
            <Route path="mes-offres" element={guard([SOUMISSIONNAIRE], <MesOffres />)} />
            <Route path="evaluations" element={guard([COMMISSION], <Evaluations />)} />
            <Route path="utilisateurs" element={guard([ADMIN], <Utilisateurs />)} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}
