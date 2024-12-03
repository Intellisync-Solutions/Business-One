import { Outlet } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, FileText, Calculator, TrendingUp } from 'lucide-react'

const Layout = () => {
  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/business-plan', icon: FileText, label: 'Business Plan' },
    { path: '/financial-calculators', icon: Calculator, label: 'Financial Tools' },
    { path: '/cashflow-analysis', icon: TrendingUp, label: 'Cashflow' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <motion.nav 
          className="w-64 border-r border-border bg-card"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-6">
            <h1 className="text-xl font-bold text-primary">Intellisync Suite</h1>
          </div>
          <div className="px-3">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-secondary text-primary'
                      : 'text-muted-foreground hover:bg-secondary/50'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </motion.nav>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
