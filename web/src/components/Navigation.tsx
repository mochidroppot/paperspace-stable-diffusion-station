import i18n from 'i18next'
import {
  Bell,
  Download,
  LayoutDashboard,
  Menu,
  Settings,
  Users,
  X
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { t } = useTranslation()

  const navigationItems = [
    { name: t('navigation.dashboard'), icon: LayoutDashboard, href: '/dashboard' },
    { name: t('navigation.resourceInstaller'), icon: Download, href: '/installer' },
    { name: 'Users', icon: Users, href: '#', active: false },
    { name: 'Settings', icon: Settings, href: '#', active: false },
  ]

  return (
    <>
      {/* Mobile menu button - only visible on mobile */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="inline-flex items-center justify-center p-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">System Dashboard</h1>
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
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Bottom Section */}
          <div className="px-4 py-4 border-t border-gray-200 space-y-4">
            {/* Language Switcher */}
            <div className="flex items-center">
              <Select value={i18n.language} onValueChange={(value) => i18n.changeLanguage(value)}>
                <SelectTrigger className="w-full h-9">
                  <SelectValue>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">
                        {i18n.language === 'en' ? '🇺🇸' : '🇯🇵'}
                      </span>
                      <span className="text-sm">
                        {i18n.language === 'en' ? 'English' : '日本語'}
                      </span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🇺🇸</span>
                      <span>English</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="ja">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🇯🇵</span>
                      <span>日本語</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notifications */}
            <button className="relative w-full flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
              <Bell className="h-5 w-5 mr-3" />
              <span className="text-sm font-medium">Notifications</span>
              <Badge
                variant="destructive"
                className="ml-auto h-5 w-5 flex items-center justify-center text-xs"
              >
                3
              </Badge>
            </button>

            {/* User Menu */}
            <div className="flex items-center space-x-3 px-3 py-2">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-sm font-medium text-white">AU</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">Admin User</p>
                <p className="text-xs text-gray-500 truncate">admin@example.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}

export default Navigation