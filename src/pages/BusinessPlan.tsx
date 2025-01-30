import { motion } from 'framer-motion'
import { useState} from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BusinessPlanSection } from '@/components/business-plan/BusinessPlanSection'
import { BusinessPlanDisplay } from '@/components/business-plan/BusinessPlanDisplay'
import { Button } from '@/components/ui/button'
import { FileText, Wand2 } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import axios from 'axios'
import { DataPersistence } from '@/components/common/DataPersistence'



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
  const [generatedBusinessPlan, setGeneratedBusinessPlan] = useState<string | null>(null)
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const handleFieldChange = (section: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleImportBusinessPlan = (importedData: Record<string, Record<string, string>>) => {
    setFormData(importedData)
  }

  const validateBusinessPlanFields = () => {
    const requiredFields: Record<string, string[]> = {
      executive: ['businessName', 'missionStatement', 'objectives', 'productsServices', 'marketOpportunity', 'financialHighlights', 'ownershipStructure'],
      company: ['businessOverview', 'visionStatement', 'legalStructure', 'locationDetails'],
      market: ['industryOverview', 'targetMarket', 'marketSize', 'competitiveAnalysis', 'regulations']
    }

    for (const [section, fields] of Object.entries(requiredFields)) {
      for (const field of fields) {
        if (!formData[section][field] || formData[section][field].trim() === '') {
          toast({
            title: "Incomplete Business Plan",
            description: `Please fill out all required fields in the ${section} section, including ${field}.`,
            variant: "destructive"
          })
          return false
        }
      }
    }
    return true
  }

  const handleGenerateFullBusinessPlan = async () => {
    // Validate all required fields before generating
    if (!validateBusinessPlanFields()) {
      return
    }

    // Combine all sections into a single context
    const fullContext = {
      ...formData.executive,
      ...formData.company,
      ...formData.market
    }

    // Ensure all values are strings
    Object.keys(fullContext).forEach(key => {
      if (fullContext[key] === undefined || fullContext[key] === null) {
        delete fullContext[key];
      } else {
        fullContext[key] = String(fullContext[key]);
      }
    });

    setIsGeneratingPlan(true)

    try {
      console.log('Full Context for Business Plan:', JSON.stringify(fullContext, null, 2));

      const response = await axios.post('/.netlify/functions/generate-business-plan', {
        section: 'fullBusinessPlan',
        content: JSON.stringify(fullContext),
        context: fullContext
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.data.businessPlan) {
        setGeneratedBusinessPlan(response.data.businessPlan)
        setIsDialogOpen(true)
        
        toast({
          title: "Business Plan Generated",
          description: "Your comprehensive business plan has been created.",
          variant: "default"
        })
      }
    } catch (error) {
      console.error('Full Business Plan Generation Error:', error)
      
      // Type guard to check if error is an object with a response property
      const isAxiosError = (err: unknown): err is { response?: { data?: { details?: string } } } => 
        typeof err === 'object' && err !== null && 'response' in err

      if (isAxiosError(error)) {
        toast({
          title: "Generation Failed",
          description: error.response?.data?.details || "Unable to generate full business plan. Please try again.",
          variant: "destructive"
        })
      } else {
        // Handle other types of errors
        const errorMessage = error instanceof Error ? error.message : String(error)
        toast({
          title: "Generation Failed",
          description: errorMessage,
          variant: "destructive"
        })
      }
    } finally {
      setIsGeneratingPlan(false)
    }
  }

  const handleDownloadBusinessPlan = () => {
    if (!generatedBusinessPlan) return

    const blob = new Blob([generatedBusinessPlan], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${formData.executive.businessName || 'business'}-plan.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl"
      >
        <div className="flex justify-between items-center mb-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="executive">Executive Summary</TabsTrigger>
              <TabsTrigger value="company">Company Description</TabsTrigger>
              <TabsTrigger value="market">Market Analysis</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              onClick={handleGenerateFullBusinessPlan}
              disabled={isGeneratingPlan}
            >
              {isGeneratingPlan ? 'Generating...' : 'Generate Business Plan'}
              <Wand2 className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {Object.entries(SECTIONS).map(([key, section]) => (
            <TabsContent key={key} value={key}>
              <BusinessPlanSection
                title={section.title}
                description={section.description}
                fields={section.fields}
                values={formData[key]}
                onChange={(field, value) => handleFieldChange(key, field, value)}
                onGenerateBusinessPlan={key === 'executive' ? handleGenerateFullBusinessPlan : undefined}
                businessName={formData.executive.businessName}
              />
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>

      <div className="mt-8">
        <DataPersistence 
          data={formData} 
          onDataImport={handleImportBusinessPlan} 
          dataType="Business Plan" 
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Your Generated Business Plan</DialogTitle>
            <DialogDescription>
              Review the comprehensive business plan generated for {formData.executive.businessName || 'your business'}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4">
            <BusinessPlanDisplay 
              businessPlan={generatedBusinessPlan || ''} 
              businessName={formData.executive.businessName} 
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
            >
              Close
            </Button>
            <Button 
              onClick={handleDownloadBusinessPlan}
              disabled={!generatedBusinessPlan}
            >
              Download Business Plan
              <FileText className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BusinessPlan
