import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Info, Wand2, RefreshCw } from "lucide-react"
import { useState } from "react"
import axios from "axios"
import { useToast } from "@/components/ui/use-toast"

const REMIX_SECTIONS = [
  // Executive Summary
  'missionStatement', 
  'objectives', 
  'productsServices', 
  'marketOpportunity', 
  'financialHighlights',
  
  // Company Description
  'businessOverview', 
  'visionStatement',
  
  // Market Analysis
  'industryOverview', 
  'targetMarket', 
  'marketSize', 
  'competitiveAnalysis', 
  'regulations'
];

interface BusinessPlanSectionProps {
  title: string
  description: string
  fields: {
    name: string
    label: string
    type: 'input' | 'textarea'
    placeholder: string
    tooltip?: string
  }[]
  values: Record<string, string>
  onChange: (field: string, value: string) => void
  onGenerateBusinessPlan?: (generatedPlan: string) => void
  businessName?: string
}

export function BusinessPlanSection({
  title,
  description,
  fields,
  values,
  onChange,
  onGenerateBusinessPlan,
  businessName
}: BusinessPlanSectionProps) {
  const [isRemixing, setIsRemixing] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  // Map field names to ensure consistency with backend
  const mapFieldToSection = (field: string): string => {
    // This mapping ensures frontend field names match exactly with backend section names
    const fieldMapping: Record<string, string> = {
      'competitiveAnalysis': 'competitiveAnalysis',
      'regulations': 'regulations',
      // Add other mappings if needed
    };
    
    return fieldMapping[field] || field;
  };

  const handleRemix = async (field: string) => {
    // Ensure the field is in the remix sections
    if (!REMIX_SECTIONS.includes(field)) {
      console.warn(`Remix not supported for field: ${field}`)
      return
    }

    // Start remixing for this specific field
    setIsRemixing(prev => ({ ...prev, [field]: true }))
    
    // Map the field to the correct section name for the backend
    const sectionName = mapFieldToSection(field);
    
    // Enhanced debugging - log the field being remixed
    console.log(`Attempting to remix field: ${field} (section: ${sectionName})`)

    try {
      // Prepare the context data with all relevant fields
      const contextData = {
        businessName: businessName,
        // Include all relevant context from values for comprehensive remixing
        ...Object.fromEntries(
          Object.entries(values).filter(([key]) => 
            ['missionStatement', 'objectives', 'productsServices', 'marketOpportunity', 'financialHighlights', 'competitiveAnalysis', 'targetMarket', 'industryOverview', 'marketSize', 'regulations', 'businessOverview', 'visionStatement'].includes(key)
          )
        )
      }
      
      // Log the request payload for debugging
      console.log('Remix request payload:', {
        section: sectionName,
        content: values[field] || '',
        contextKeys: Object.keys(contextData)
      })

      const response = await axios.post(
        process.env.NODE_ENV === 'development' 
          ? 'http://localhost:9000/.netlify/functions/generate-business-plan'
          : '/.netlify/functions/generate-business-plan', 
        {
          section: sectionName, // Use the mapped section name for consistency
          content: values[field] || '',
          context: contextData
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.remixedSection) {
        // Update the field with the remixed content
        onChange(field, response.data.remixedSection.trim())
        
        toast({
          title: "Section Remixed",
          description: `Your ${field} has been enhanced.`,
          variant: "default"
        })
      }
    } catch (error) {
      console.error(`Remix error for ${field}:`, error)
      toast({
        title: "Remix Failed",
        description: `Unable to remix ${field}. Please try again.`,
        variant: "destructive"
      })
    } finally {
      // Stop remixing for this field
      setIsRemixing(prev => ({ ...prev, [field]: false }))
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold">{title}</h2>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p>{description}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            {title === 'Business Plan Overview' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  // Prepare the business plan request object
                  const businessPlanRequest = {
                    businessName: values.businessName || '',
                    location: values.location || '',
                    missionStatement: values.missionStatement || '',
                    objectives: values.objectives || '',
                    productsServices: values.productsServices || '',
                    marketOpportunity: values.marketOpportunity || '',
                    financialHighlights: values.financialHighlights || '',
                    ownershipStructure: values.ownershipStructure || '',
                    businessOverview: values.businessOverview || '',
                    visionStatement: values.visionStatement || '',
                    legalStructure: values.legalStructure || '',
                    locationDetails: values.locationDetails || '',
                    industryOverview: values.industryOverview || '',
                    targetMarket: values.targetMarket || '',
                    marketSize: values.marketSize || '',
                    competitiveAnalysis: values.competitiveAnalysis || '',
                    regulations: values.regulations || ''
                  };

                  // Convert to JSON string for the Netlify function
                  onGenerateBusinessPlan?.(JSON.stringify(businessPlanRequest));
                }}
              >
                Generate Business Plan
                <Wand2 className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor={field.name}>{field.label}</Label>
                  {field.tooltip && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <p>{field.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                {REMIX_SECTIONS.includes(field.name) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemix(field.name)}
                    disabled={isRemixing[field.name]}
                    className="text-xs"
                  >
                    {isRemixing[field.name] ? 'Remixing...' : `Remix ${field.name}`}
                    <RefreshCw className="ml-2 h-3 w-3" />
                  </Button>
                )}
              </div>
              {field.type === 'textarea' ? (
                <Textarea
                  id={field.name}
                  placeholder={field.placeholder}
                  value={values[field.name] || ''}
                  onChange={(e) => onChange(field.name, e.target.value)}
                  className="min-h-[100px]"
                />
              ) : (
                <Input
                  id={field.name}
                  placeholder={field.placeholder}
                  value={values[field.name] || ''}
                  onChange={(e) => onChange(field.name, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}
