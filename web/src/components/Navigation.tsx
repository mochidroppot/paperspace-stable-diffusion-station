import i18n from 'i18next'
import {
  Download,
  Globe,
  LayoutDashboard,
  Menu,
  Sparkles,
  X
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { t } = useTranslation()

  const navigationItems = [
    { name: t('navigation.dashboard'), icon: LayoutDashboard, href: '/dashboard' },
    { name: t('navigation.resourceInstaller'), icon: Download, href: '/installer' },
  ]

  return (
    <>
      {/* Mobile menu button - only visible on mobile */}
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white bg-primary border border-primary shadow-sm"
        >
          {isMobileMenuOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-card backdrop-blur-md border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center px-6 py-6 border-b border-border">
            <div className="relative group">
              {/* Main logo container with gradient background */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-purple-500/25 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-purple-500/40 group-hover:scale-105">
                <Sparkles className="h-7 w-7 text-white drop-shadow-sm" />
              </div>
              {/* Subtle glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 opacity-20 blur-md -z-10"></div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive
                    ? 'bg-primary/20 text-foreground border border-primary/50'
                    : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground hover:border hover:border-accent/30'
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className={`h-5 w-5 mr-3 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Bottom Section */}
          <div className="px-4 py-4 border-t border-border space-y-4">

            {/* Language Switcher */}
            <div className="flex items-center">
              <Select value={i18n.language} onValueChange={(value) => i18n.changeLanguage(value)}>
                <SelectTrigger className="w-full h-9 bg-muted border-border text-foreground">
                  <SelectValue>
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <span className="text-sm">
                        {i18n.language === 'en' ? 'English' : '日本語'}
                      </span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-purple-500/30">
                  <SelectItem value="en" className="text-white hover:bg-purple-600/20">
                    <span>English</span>
                  </SelectItem>
                  <SelectItem value="ja" className="text-white hover:bg-purple-600/20">
                    <span>日本語</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}

export default Navigation