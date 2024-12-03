import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Info } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface RatioCalculatorProps {
  title: string
  description: string
  inputs: Array<{
    name: string
    label: string
    placeholder?: string
    tooltip?: string
    min?: number
    max?: number
    required?: boolean
  }>
  calculate: (values: Record<string, number>) => number
  interpretation: {
    good: string
    bad: string
    context?: string
  }
  data: Record<string, number>
  onDataChange?: (data: Record<string, number>) => void
  formatResult?: (value: number) => string
}

export function RatioCalculator({
  title,
  description,
  inputs,
  calculate,
  interpretation,
  data,
  onDataChange,
  formatResult = (value) => value.toFixed(2)
}: RatioCalculatorProps) {
  const [result, setResult] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const validateInput = (name: string, value: string): string | null => {
    if (!value && inputs.find(input => input.name === name)?.required !== false) {
      return "This field is required"
    }

    const numValue = parseFloat(value)
    if (isNaN(numValue)) {
      return "Please enter a valid number"
    }

    const input = inputs.find(input => input.name === name)
    if (input?.min !== undefined && numValue < input.min) {
      return `Value must be at least ${input.min}`
    }
    if (input?.max !== undefined && numValue > input.max) {
      return `Value must be no more than ${input.max}`
    }

    return null
  }

  const handleInputChange = (name: string, value: string) => {
    // Clear previous error for this field
    const newErrors = { ...errors }
    delete newErrors[name]
    setErrors(newErrors)

    // Validate input
    const error = validateInput(name, value)
    if (error) {
      setErrors({ ...newErrors, [name]: error })
      return
    }

    // Update data if validation passes
    const numValue = value === '' ? undefined : parseFloat(value)
    const newData = { ...data }
    if (numValue !== undefined) {
      newData[name] = numValue
    } else {
      delete newData[name]
    }
    onDataChange?.(newData)
    setShowResult(false)
  }

  const handleCalculate = () => {
    // Validate all inputs
    const newErrors: Record<string, string> = {}
    let hasErrors = false

    inputs.forEach(input => {
      const value = data[input.name]?.toString() || ''
      const error = validateInput(input.name, value)
      if (error) {
        newErrors[input.name] = error
        hasErrors = true
      }
    })

    if (hasErrors) {
      setErrors(newErrors)
      toast({
        title: "Validation Error",
        description: "Please correct the errors before calculating",
        variant: "destructive"
      })
      return
    }

    try {
      const calculatedResult = calculate(data)
      
      // Validate the result
      if (isNaN(calculatedResult) || !isFinite(calculatedResult)) {
        toast({
          title: "Calculation Error",
          description: "The calculation resulted in an invalid value. Please check your inputs.",
          variant: "destructive"
        })
        return
      }

      setResult(calculatedResult)
      setShowResult(true)
    } catch (error) {
      toast({
        title: "Calculation Error",
        description: "An error occurred during calculation. Please check your inputs.",
        variant: "destructive"
      })
    }
  }

  return (
    <Card className="p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="grid gap-4">
        {inputs.map((input) => (
          <div key={input.name}>
            <div className="flex items-center gap-2">
              <Label>
                {input.label}
                {input.required !== false && <span className="text-red-500">*</span>}
              </Label>
              {input.tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{input.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <Input
              type="number"
              placeholder={input.placeholder}
              value={data[input.name] || ''}
              onChange={(e) => handleInputChange(input.name, e.target.value)}
              min={input.min}
              max={input.max}
              step="0.01"
              className={errors[input.name] ? "border-red-500" : ""}
            />
            {errors[input.name] && (
              <p className="text-sm text-red-500 mt-1">{errors[input.name]}</p>
            )}
          </div>
        ))}

        <Button onClick={handleCalculate} className="mt-2">
          Calculate
        </Button>

        {showResult && result !== null && (
          <Alert className={result > 0 ? "bg-green-50" : "bg-red-50"}>
            <AlertTitle>Result: {formatResult(result)}</AlertTitle>
            <AlertDescription>
              {result > 0 ? interpretation.good : interpretation.bad}
              {interpretation.context && (
                <p className="text-sm text-muted-foreground mt-2">
                  {interpretation.context}
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </Card>
  )
}
