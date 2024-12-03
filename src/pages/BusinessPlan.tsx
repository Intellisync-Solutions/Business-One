import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BusinessPlanSection } from '@/components/business-plan/BusinessPlanSection'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"

const STORAGE_KEY = 'business-plan-data'

const SECTIONS = {
  executive: {
    title: 'Executive Summary',
    description: 'Provide a concise overview of your entire business plan, highlighting key points and capturing the attention of readers.',
    fields: [
      {
        name: 'businessName',
        label: 'Business Name',
        type: 'input' as const,
        placeholder: 'Enter your business name',
        tooltip: 'Choose a name that reflects your brand identity and is memorable for customers.'
      },
      {
        name: 'location',
        label: 'Location',
        type: 'input' as const,
        placeholder: 'Business location (physical or online)',
        tooltip: 'Your location can impact costs, market reach, and legal requirements. Consider accessibility and target market proximity.'
      },
      {
        name: 'missionStatement',
        label: 'Mission Statement',
        type: 'textarea' as const,
        placeholder: 'Define your business\'s purpose and core values',
        tooltip: 'A strong mission statement guides decision-making and communicates your purpose to stakeholders.'
      },
      {
        name: 'objectives',
        label: 'Business Objectives',
        type: 'textarea' as const,
        placeholder: 'List your clear, measurable business goals',
        tooltip: 'Set SMART goals: Specific, Measurable, Achievable, Relevant, and Time-bound objectives.'
      },
      {
        name: 'productsServices',
        label: 'Products or Services',
        type: 'textarea' as const,
        placeholder: 'Summarize what your business offers',
        tooltip: 'Clearly describe your offerings and their unique value proposition to customers.'
      },
      {
        name: 'marketOpportunity',
        label: 'Market Opportunity',
        type: 'textarea' as const,
        placeholder: 'Describe your target market and the problem your business solves',
        tooltip: 'Identify the gap in the market and explain how your business addresses it effectively.'
      },
      {
        name: 'financialHighlights',
        label: 'Financial Highlights',
        type: 'textarea' as const,
        placeholder: 'Key financial projections and funding requirements',
        tooltip: 'Include key metrics like projected revenue, profit margins, and funding needs to demonstrate viability.'
      },
      {
        name: 'ownershipStructure',
        label: 'Ownership Structure',
        type: 'textarea' as const,
        placeholder: 'Information about ownership and management team',
        tooltip: 'Detail the legal structure, ownership distribution, and key management roles.'
      }
    ]
  },
  company: {
    title: 'Company Description',
    description: 'Provide detailed information about your business, including its history, structure, and market needs it fulfills.',
    fields: [
      {
        name: 'businessOverview',
        label: 'Business Overview',
        type: 'textarea' as const,
        placeholder: 'Detailed information about your business history and nature',
        tooltip: 'Include your company\'s background, evolution, and key milestones that shaped its current form.'
      },
      {
        name: 'visionStatement',
        label: 'Vision Statement',
        type: 'textarea' as const,
        placeholder: 'Your long-term vision for the business',
        tooltip: 'Describe where you see your company in the future and what impact you aim to make.'
      },
      {
        name: 'legalStructure',
        label: 'Legal Structure',
        type: 'input' as const,
        placeholder: 'e.g., LLC, Corporation, Partnership',
        tooltip: 'Your legal structure affects taxes, liability, and operational flexibility. Choose carefully.'
      },
      {
        name: 'locationDetails',
        label: 'Location and Facilities',
        type: 'textarea' as const,
        placeholder: 'Describe your physical location and facilities',
        tooltip: 'Detail your facilities\' capabilities, strategic advantages, and how they support your operations.'
      }
    ]
  },
  market: {
    title: 'Market Analysis',
    description: 'Examine your industry, target market, and competitors to demonstrate your understanding of the market landscape.',
    fields: [
      {
        name: 'industryOverview',
        label: 'Industry Overview',
        type: 'textarea' as const,
        placeholder: 'Insights into industry size, growth rate, and trends',
        tooltip: 'Include current market size, growth trends, and key industry developments affecting your business.'
      },
      {
        name: 'targetMarket',
        label: 'Target Market',
        type: 'textarea' as const,
        placeholder: 'Detailed description of your ideal customers',
        tooltip: 'Define your customer segments, their demographics, behaviors, and pain points.'
      },
      {
        name: 'marketSize',
        label: 'Market Size and Growth',
        type: 'textarea' as const,
        placeholder: 'Current market size and projected growth',
        tooltip: 'Quantify your total addressable market (TAM) and serviceable obtainable market (SOM).'
      },
      {
        name: 'competitiveAnalysis',
        label: 'Competitive Analysis',
        type: 'textarea' as const,
        placeholder: 'Evaluation of main competitors and your competitive advantage',
        tooltip: 'Analyze direct and indirect competitors, their strengths/weaknesses, and your unique advantages.'
      },
      {
        name: 'regulations',
        label: 'Regulatory Environment',
        type: 'textarea' as const,
        placeholder: 'Overview of relevant laws and regulations',
        tooltip: 'Identify key regulations affecting your industry and how you\'ll ensure compliance.'
      }
    ]
  }
}

const BusinessPlan = () => {
  const [activeTab, setActiveTab] = useState('executive')
  const [formData, setFormData] = useState<Record<string, Record<string, string>>>({
    executive: {},
    company: {},
    market: {}
  })
  const { toast } = useToast()

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        setFormData(parsedData)
      } catch (error) {
        console.error('Error loading saved data:', error)
      }
    }
  }, [])

  const handleFieldChange = (section: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData))
      toast({
        title: "Success",
        description: "Business plan saved successfully",
      })
    } catch (error) {
      console.error('Error saving data:', error)
      toast({
        title: "Error",
        description: "Failed to save business plan",
        variant: "destructive",
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-6 max-w-4xl"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Business Plan Builder</h1>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Plan
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="executive">Executive Summary</TabsTrigger>
          <TabsTrigger value="company">Company Description</TabsTrigger>
          <TabsTrigger value="market">Market Analysis</TabsTrigger>
        </TabsList>

        {Object.entries(SECTIONS).map(([key, section]) => (
          <TabsContent key={key} value={key}>
            <BusinessPlanSection
              title={section.title}
              description={section.description}
              fields={section.fields}
              values={formData[key]}
              onChange={(field, value) => handleFieldChange(key, field, value)}
            />
          </TabsContent>
        ))}
      </Tabs>
    </motion.div>
  )
}

export default BusinessPlan
