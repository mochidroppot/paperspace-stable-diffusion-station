import { ThemeProvider } from 'next-themes'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import './App.css'
import Dashboard from './components/pages/Dashboard'
import ResourceInstaller from './components/pages/ResourceInstaller'
import { Toaster } from './components/ui/toast'

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/installer" element={<ResourceInstaller />} />
        </Routes>
        <Toaster />
      </Router>
    </ThemeProvider>
  )
}

export default App
