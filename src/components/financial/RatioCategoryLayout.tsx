import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RatioCalculator } from './RatioCalculator'
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, ChevronUp, Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface RatioCategoryLayoutProps {
  category: {
    title: string;
    ratios: Array<{
      title: string;
      description: string;
      interpretation: {
        good: string;
        bad: string;
        context: string;
        insights: {
          title: string;
          points: string[];
        }[];
        warningSignals: string[];
        benchmarks?: {
          industry: string;
          range: string;
        }[];
        strategies?: string[];
      };
      inputs: Array<{
        name: string;
        label: string;
        placeholder: string;
        tooltip: string;
        min: number;
        required: boolean;
      }>;
      calculate: (values: Record<string, number>) => number;
      formatResult: (value: number) => string;
    }>;
  };
  onCalculate?: (ratioName: string, result: number) => void;
}

export function RatioCategoryLayout({ category, onCalculate }: RatioCategoryLayoutProps) {
  const [expandedInfo, setExpandedInfo] = useState<string | null>(null)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center justify-between">
          {category.title}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info 
                  className="h-5 w-5 text-muted-foreground hover:text-primary cursor-help" 
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Financial ratios in the {category.title.toLowerCase()} category</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>
          Explore and calculate various {category.title.toLowerCase()} to analyze financial performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={category.ratios[0].title} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            {category.ratios.map((ratio) => (
              <TabsTrigger 
                key={ratio.title} 
                value={ratio.title} 
                className="group flex items-center justify-center"
              >
                <span className="mr-2">{ratio.title}</span>
                <ChevronDown 
                  className="h-4 w-4 opacity-50 group-data-[state=active]:rotate-180 transition-transform" 
                  strokeWidth={1.5} 
                />
              </TabsTrigger>
            ))}
          </TabsList>
          
          {category.ratios.map((ratio) => (
            <TabsContent key={ratio.title} value={ratio.title} className="space-y-4">
              <ScrollArea className="h-[600px] w-full pr-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <p className="text-muted-foreground">{ratio.description}</p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setExpandedInfo(expandedInfo === ratio.title ? null : ratio.title)}
                            className="ml-2 p-1 hover:bg-accent rounded-full group"
                          >
                            <Info
                              className="h-4 w-4 text-muted-foreground group-hover:text-primary" 
                            />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Click for detailed interpretation</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  {expandedInfo === ratio.title && (
                    <Card className="mt-4">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-green-600 dark:text-green-400 flex items-center">
                              <ChevronDown className="mr-2 h-4 w-4" strokeWidth={1.5} />
                              Good Range
                            </h4>
                            <p className="text-sm">{ratio.interpretation.good}</p>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-semibold text-red-600 dark:text-red-400 flex items-center">
                              <ChevronUp className="mr-2 h-4 w-4" strokeWidth={1.5} />
                              Warning Signs
                            </h4>
                            <p className="text-sm">{ratio.interpretation.bad}</p>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-semibold text-blue-600 dark:text-blue-400 flex items-center">
                              <ChevronDown className="mr-2 h-4 w-4" strokeWidth={1.5} />
                              Context & Considerations
                            </h4>
                            <p className="text-sm">{ratio.interpretation.context}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
                
                <RatioCalculator
                  title={ratio.title}
                  description={ratio.description}
                  interpretation={ratio.interpretation}
                  inputs={ratio.inputs}
                  calculate={ratio.calculate}
                  formatResult={ratio.formatResult}
                  onCalculate={(result) => onCalculate?.(ratio.title, result)}
                />
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
