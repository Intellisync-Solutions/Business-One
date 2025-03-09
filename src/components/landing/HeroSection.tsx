import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart2, Calculator, PieChart, TrendingUp, DollarSign, LineChart, Briefcase } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function HeroSection() {
  const navigate = useNavigate()

  const handleGetStarted = () => {
    navigate('/business-plan', { replace: true }) 
  }

  const handleGoToDashboard = () => {
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="relative min-h-[80vh] bg-gradient-to-br from-primary/10 via-primary/20 to-secondary/30 overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />
      </motion.div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Intellisync Business Suite
            </h1>
            <p className="mt-6 text-xl text-muted-foreground">
              Transform your business decisions with powerful financial tools and intelligent analytics
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" className="group" onClick={handleGetStarted}>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline" onClick={handleGoToDashboard}>
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </motion.div>

          {/* Animated graphics */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="relative aspect-square max-w-md mx-auto">
              <motion.div
                className="absolute inset-0 grid place-items-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-full h-full border-2 border-primary/20 rounded-full" />
              </motion.div>
              
              {/* Calculator icon */}
              <motion.div
                className="absolute top-[15%] left-[15%] p-4 bg-white/90 rounded-2xl shadow-xl border border-primary/20"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Calculator className="h-8 w-8 text-slate-900" />
              </motion.div>
              
              {/* Bar Chart icon */}
              <motion.div
                className="absolute top-1/2 right-[15%] p-4 bg-white/90 rounded-2xl shadow-xl border border-secondary/20"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <BarChart2 className="h-8 w-8 text-slate-900" />
              </motion.div>
              
              {/* Pie Chart icon */}
              <motion.div
                className="absolute bottom-[25%] left-1/2 -translate-x-1/2 p-4 bg-white/90 rounded-2xl shadow-xl border border-primary/20 z-10"
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <PieChart className="h-8 w-8 text-slate-900" />
              </motion.div>

              {/* Trending Up icon */}
              <motion.div
                className="absolute top-[20%] right-[25%] p-4 bg-white/90 rounded-2xl shadow-xl border border-secondary/20 z-10"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
              >
                <TrendingUp className="h-8 w-8 text-slate-900" />
              </motion.div>

              {/* Dollar Sign icon */}
              <motion.div
                className="absolute bottom-[30%] left-[20%] p-4 bg-white/90 rounded-2xl shadow-xl border border-primary/20"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
              >
                <DollarSign className="h-8 w-8 text-slate-900" />
              </motion.div>

              {/* Line Chart icon */}
              <motion.div
                className="absolute top-[40%] left-[30%] p-4 bg-white/90 rounded-2xl shadow-xl border border-secondary/20 z-10"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
              >
                <LineChart className="h-8 w-8 text-slate-900" />
              </motion.div>

              {/* Briefcase icon */}
              <motion.div
                className="absolute bottom-[45%] right-[20%] p-4 bg-white/90 rounded-2xl shadow-xl border border-primary/20 z-10"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 2.3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              >
                <Briefcase className="h-8 w-8 text-slate-900" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
