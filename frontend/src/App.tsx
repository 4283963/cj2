import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import FleetTracking from './pages/FleetTracking'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="fleet/tracking" element={<FleetTracking />} />
      </Route>
    </Routes>
  )
}

export default App
