import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import AppelsOffres from './pages/AppelsOffres'
import AppelsDispo from './pages/AppelsDispo'
import MesOffres from './pages/MesOffres'
import Evaluations from './pages/Evaluations'
import Marches from './pages/Marches'
import Utilisateurs from './pages/Utilisateurs'

const Protected = ({ roles, children }) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/inscription" element={<RegisterPage />} />
      <Route element={<Protected><Layout /></Protected>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="appels-offres" element={<Protected roles={['GESTIONNAIRE', 'ADMINISTRATEUR']}><AppelsOffres /></Protected>} />
        <Route path="marches" element={<Protected roles={['GESTIONNAIRE', 'ADMINISTRATEUR']}><Marches /></Protected>} />
        <Route path="appels-offres-dispo" element={<Protected roles={['SOUMISSIONNAIRE']}><AppelsDispo /></Protected>} />
        <Route path="mes-offres" element={<Protected roles={['SOUMISSIONNAIRE']}><MesOffres /></Protected>} />
        <Route path="evaluations" element={<Protected roles={['COMMISSION']}><Evaluations /></Protected>} />
        <Route path="utilisateurs" element={<Protected roles={['ADMINISTRATEUR']}><Utilisateurs /></Protected>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
