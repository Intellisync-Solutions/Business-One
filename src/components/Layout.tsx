import { Outlet } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  FileText, 
  Calculator, 
  
  Target,
  PiggyBank,
  LineChart,
  Building,
  BarChart4
} from 'lucide-react'
import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

const Layout = () => {
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])

  const menuItems = [
    { 
      path: '/', 
      icon: LayoutDashboard, 
      label: 'Dashboard' 
    },
    { 
      path: '/business-plan', 
      icon: FileText, 
      label: 'Business Plan' 
    },
    {
      path: '/calculators',
      icon: Calculator,
      label: 'Financial Tools',
      subItems: [
        {
          path: '/calculators/startup-cost-estimator',
          icon: PiggyBank,
          label: 'Startup Costs'
        },
        { 
          path: '/calculators/break-even-analysis',
          icon: Calculator,
          label: 'Break-Even Analysis'
        },
        {
          path: '/calculators/scenario-planner',
          icon: Target,
          label: 'Scenario Planner'
        },
        {
          path: '/calculators/pricing-strategy',
          icon: LineChart,
          label: 'Pricing Strategy'
        },
        { 
          path: '/calculators/financial-ratios',
          icon: BarChart4,
          label: 'Financial Ratios',
         
        },
        {
          path: '/calculators/business-valuation',
          icon: Building,
          label: 'Business Valuation'
        }
      ]
    },
  ]

  const toggleMenu = (path: string) => {
    setExpandedMenus(prev => 
      prev.includes(path) 
        ? prev.filter(p => p !== path)
        : [...prev, path]
    )
  }

  const renderMenuItem = (item: any, level = 0) => {
    const hasSubItems = item.subItems && item.subItems.length > 0
    const isExpanded = expandedMenus.includes(item.path)

    return (
      <div key={item.path}>
        <NavLink
          to={hasSubItems ? '#' : item.path}
          onClick={hasSubItems ? () => toggleMenu(item.path) : undefined}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 my-1 rounded-lg transition-colors ${
              isActive
                ? 'bg-secondary text-primary'
                : 'text-muted-foreground hover:bg-secondary/50'
            }`
          }
          style={{ paddingLeft: `${level * 12 + 12}px` }}
        >
          <item.icon className="w-5 h-5" />
          <span className="flex-1">{item.label}</span>
          {hasSubItems && (
            isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          )}
        </NavLink>
        
        {hasSubItems && isExpanded && (
          <div className="ml-4">
            {item.subItems.map((subItem: any) => renderMenuItem(subItem, level + 1))}
          </div>
        )}
      </div>
    )
  }

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
            {menuItems.map(item => renderMenuItem(item))}
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
