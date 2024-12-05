import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  BarChart,
  Calculator,
  DollarSign,
  LineChart,
  PieChart,
  TrendingUp,
  Lightbulb,
  Target,
  ArrowRight
} from "lucide-react"

interface Feature {
  title: string
  description: string
  icon: JSX.Element
  details: {
    overview: string
    benefits: string[]
    keyFeatures: string[]
  }
}

const features: Feature[] = [
  {
    title: "Break-Even Analysis",
    description: "Calculate your break-even point and make informed pricing decisions",
    icon: <Calculator className="h-6 w-6" />,
    details: {
      overview: "Our advanced break-even calculator helps you determine the exact point where your business becomes profitable.",
      benefits: [
        "Understand your cost structure",
        "Make informed pricing decisions",
        "Plan for profitability",
        "Optimize your business model"
      ],
      keyFeatures: [
        "Dynamic break-even point calculation",
        "Multiple pricing scenario analysis",
        "Visual profit charts",
        "Cost structure breakdown"
      ]
    }
  },
  {
    title: "Financial Ratios",
    description: "Analyze key financial metrics and track business performance",
    icon: <BarChart className="h-6 w-6" />,
    details: {
      overview: "Comprehensive financial ratio analysis to evaluate your business's health and performance.",
      benefits: [
        "Track financial health",
        "Identify improvement areas",
        "Compare industry benchmarks",
        "Make data-driven decisions"
      ],
      keyFeatures: [
        "Liquidity ratio analysis",
        "Profitability metrics",
        "Efficiency indicators",
        "Trend analysis"
      ]
    }
  },
  {
    title: "Pricing Strategy",
    description: "Develop optimal pricing strategies for maximum profitability",
    icon: <DollarSign className="h-6 w-6" />,
    details: {
      overview: "Strategic pricing tools to help you maximize revenue while staying competitive.",
      benefits: [
        "Optimize profit margins",
        "Stay competitive",
        "Understand market positioning",
        "Increase revenue"
      ],
      keyFeatures: [
        "Cost-plus pricing calculator",
        "Value-based pricing tools",
        "Competitor analysis",
        "Price elasticity simulator"
      ]
    }
  },
  {
    title: "Scenario Planning",
    description: "Model different business scenarios and prepare for the future",
    icon: <LineChart className="h-6 w-6" />,
    details: {
      overview: "Powerful scenario planning tools to help you prepare for different business outcomes.",
      benefits: [
        "Reduce uncertainty",
        "Improve decision making",
        "Identify opportunities",
        "Mitigate risks"
      ],
      keyFeatures: [
        "Multiple scenario modeling",
        "Sensitivity analysis",
        "Risk assessment",
        "Impact analysis"
      ]
    }
  },
  {
    title: "Business Valuation",
    description: "Calculate and track your business's value over time",
    icon: <TrendingUp className="h-6 w-6" />,
    details: {
      overview: "Professional business valuation tools to help you understand and grow your company's value.",
      benefits: [
        "Track business value",
        "Support fundraising",
        "Plan exit strategy",
        "Identify value drivers"
      ],
      keyFeatures: [
        "Multiple valuation methods",
        "Industry comparisons",
        "Growth projections",
        "Value driver analysis"
      ]
    }
  },
  {
    title: "Startup Costs",
    description: "Plan and estimate your startup costs accurately",
    icon: <PieChart className="h-6 w-6" />,
    details: {
      overview: "Comprehensive startup cost calculator to help you plan your business launch.",
      benefits: [
        "Accurate cost planning",
        "Avoid surprises",
        "Secure funding",
        "Launch confidently"
      ],
      keyFeatures: [
        "Industry-specific templates",
        "Cost categorization",
        "Funding requirement calculator",
        "Timeline planning"
      ]
    }
  }
]

export const FeaturesSection = () => {
  const [currentFeature, setCurrentFeature] = useState(0)

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-4">Our Features</h2>
            <p className="text-muted-foreground">Powerful tools to grow your business</p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Dialog>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        {feature.icon}
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="ghost" className="group">
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{feature.title}</DialogTitle>
                    <DialogDescription>{feature.description}</DialogDescription>
                  </DialogHeader>
                  <div className="mt-6">
                    <h4 className="font-semibold mb-2">Overview</h4>
                    <p>{feature.details.overview}</p>

                    <h4 className="font-semibold mt-4 mb-2">Benefits</h4>
                    <ul className="list-disc pl-5">
                      {feature.details.benefits.map((benefit, idx) => (
                        <li key={idx}>{benefit}</li>
                      ))}
                    </ul>

                    <h4 className="font-semibold mt-4 mb-2">Key Features</h4>
                    <ul className="list-disc pl-5">
                      {feature.details.keyFeatures.map((keyFeature, idx) => (
                        <li key={idx}>{keyFeature}</li>
                      ))}
                    </ul>
                  </div>
                </DialogContent>
              </Dialog>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
