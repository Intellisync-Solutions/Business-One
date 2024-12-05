import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, CheckCircle2, Sparkles, Star, Zap } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function CTASection() {
  const navigate = useNavigate()

  const plans = [
    {
      name: "Starter",
      price: "$49",
      description: "Perfect for small businesses and startups",
      features: [
        "All Financial Calculators",
        "Basic Reports",
        "Email Support",
        "Data Export",
      ],
    },
    {
      name: "Pro",
      price: "$99",
      description: "Ideal for growing businesses",
      features: [
        "Everything in Starter",
        "Advanced Analytics",
        "Priority Support",
        "Custom Reports",
        "Team Collaboration",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations",
      features: [
        "Everything in Pro",
        "Dedicated Support",
        "Custom Integration",
        "Advanced Security",
        "SLA Guarantee",
      ],
    },
  ]

  const handleGetStarted = () => {
    navigate('/business-plan')
  }

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </motion.div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium text-primary">Limited Time Offer</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Transform Your Business Today
          </h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of successful businesses making smarter financial decisions
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className={`relative p-6 h-full ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </div>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold mb-2">{plan.price}</div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full group ${plan.popular ? '' : 'variant-outline'}`}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={handleGetStarted}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-4 p-2 bg-secondary/10 rounded-full mb-8">
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            </div>
            <span className="text-sm font-medium">
              Trusted by 10,000+ businesses worldwide
            </span>
            <Zap className="h-4 w-4 text-yellow-500" />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="group" onClick={handleGetStarted}>
              Start 14-Day Free Trial
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" onClick={handleGetStarted}>
              Talk to Sales
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
