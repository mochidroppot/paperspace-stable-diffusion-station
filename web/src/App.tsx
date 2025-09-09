import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import ResourceInstaller from './components/ResourceInstaller'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/installer" element={<ResourceInstaller />} />
      </Routes>
    </Router>
  )
}

export default App
