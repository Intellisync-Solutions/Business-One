import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, RotateCcw } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils";
import { RatioInterpretation, RatioInterpretationData } from './RatioInterpretation'

interface RatioCalculatorProps {
  title: string;
  description: string;
  interpretation: RatioInterpretationData;
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
  onCalculate?: (result: number) => void;
}

export const RatioCalculator = ({
  title,
  description,
  interpretation,
  inputs,
  calculate,
  formatResult,
  onCalculate
}: RatioCalculatorProps) => {
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [result, setResult] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleInputChange = (name: string, value: string) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleCalculate = () => {
    // Validate required fields
    const missingFields = inputs
      .filter(input => input.required && (!values[input.name] || values[input.name].trim() === ''))
      .map(input => input.label);

    if (missingFields.length > 0) {
      setError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Convert values to numbers and validate
    const numericValues: Record<string, number> = {};
    for (const input of inputs) {
      const value = parseFloat(values[input.name] || '0');
      
      if (isNaN(value)) {
        setError(`Invalid number entered for ${input.label}`);
        return;
      }

      if (value < input.min) {
        setError(`${input.label} must be at least ${input.min}`);
        return;
      }

      numericValues[input.name] = value;
    }

    try {
      const calculatedResult = calculate(numericValues);
      setResult(calculatedResult);
      onCalculate?.(calculatedResult);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Calculation error occurred');
    }
  };

  const handleReset = () => {
    setValues({});
    setResult(null);
    setError(null);
  };

  const isFormValid = () => {
    return inputs.every(input => !input.required || values[input.name] && values[input.name].trim() !== '');
  };

  const showInterpretation = result !== null;

  return (
    <Card className="w-full max-w-md">
      <CardContent className="space-y-4 p-6">
        <div>
          <h2 className="text-xl font-bold mb-2">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
        
        {inputs.map((input) => (
          <div key={input.name} className="space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label htmlFor={input.name} className="flex items-center gap-1 cursor-help">
                    {input.label}
                    {input.required && <span className="text-red-500">*</span>}
                  </Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{input.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Input
              id={input.name}
              type="number"
              placeholder={input.placeholder}
              min={input.min}
              value={values[input.name] || ''}
              onChange={(e) => handleInputChange(input.name, e.target.value)}
              required={input.required}
              className={cn(
                "transition-colors",
                error && !values[input.name] && input.required && "border-red-500 focus-visible:ring-red-500"
              )}
            />
          </div>
        ))}
        
        <Button 
          onClick={handleCalculate} 
          disabled={!isFormValid()}
          className="w-full"
        >
          <Calculator className="w-4 h-4 mr-2" />
          Calculate
        </Button>
        
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        
        {result !== null && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Result: {formatResult(result)}</h3>
            {showInterpretation && (
              <div className="mt-4 p-4 bg-background rounded-lg border">
                <RatioInterpretation data={interpretation} />
              </div>
            )}
          </div>
        )}
        
        <Button
          variant="outline"
          onClick={handleReset}
          className="px-3"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

// Example usage:
const ratioCalculatorProps = {
  title: "Current Ratio Calculator",
  description: "Calculate your company's current ratio to assess its short-term financial health.",
  interpretation: {
    good: "A current ratio above 1.5 indicates good short-term liquidity",
    bad: "A current ratio below 1.0 suggests potential liquidity problems",
    context: "The current ratio measures a company's ability to pay short-term obligations",
    insights: [
      {
        title: "Key Considerations",
        points: [
          "Industry standards vary significantly",
          "Too high might indicate inefficient use of assets",
          "Consider alongside other liquidity ratios"
        ]
      }
    ],
    warningSignals: [
      "Sudden drops in current ratio",
      "Consistent downward trend",
      "Ratio falling below industry average"
    ]
  },
  inputs: [
    {
      name: "currentAssets",
      label: "Current Assets",
      placeholder: "Enter current assets",
      tooltip: "Total value of assets that can be converted to cash within one year.",
      min: 0,
      required: true,
    },
    {
      name: "currentLiabilities",
      label: "Current Liabilities",
      placeholder: "Enter current liabilities",
      tooltip: "Total value of liabilities that need to be paid within one year.",
      min: 0,
      required: true,
    },
  ],
  calculate: (values: Record<string, number>) => values.currentAssets / values.currentLiabilities,
  formatResult: (value: number) => value.toFixed(2),
};

<RatioCalculator {...ratioCalculatorProps} />
