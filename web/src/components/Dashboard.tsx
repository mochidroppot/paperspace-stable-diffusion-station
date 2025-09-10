import { LayoutDashboard } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Navigation from './Navigation'

const Dashboard = () => {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <Navigation />
      <div className="lg:ml-64 p-6 pt-12 lg:pt-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <LayoutDashboard className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-2xl font-normal text-white tracking-wide">
                {t('dashboard.title')}
              </h1>
            </div>
            <p className="text-muted-foreground text-xs ml-8 leading-relaxed">システムの概要と管理</p>
          </div>

          {/* Empty State */}
          <div className="gaming-card no-hover p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Dashboard Coming Soon</h2>
            <p className="text-purple-300 text-lg">This dashboard will be populated with system information and controls.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard