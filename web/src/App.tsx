import { ThemeProvider } from 'next-themes'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import './App.css'
import Dashboard from './components/pages/Dashboard'
import ResourceInstaller from './components/pages/ResourceInstaller'
import { Toaster } from './components/ui/toast'

// グローバル変数からBaseURLを取得
declare global {
  interface Window {
    REACT_ROUTER_BASENAME?: string;
  }
}

function App() {
  // 実行時にBaseURLを取得（ビルド時には未定義）
  const basename = window.REACT_ROUTER_BASENAME || '';

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <Router basename={basename}>
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
