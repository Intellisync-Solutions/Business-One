import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { InfoCircledIcon } from "@radix-ui/react-icons"
import { useState } from "react"

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  tooltip?: string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  allowNegative?: boolean;
}

export function NumberInput({ 
  label, 
  value, 
  onChange, 
  tooltip, 
  min = 0, 
  max, 
  step = 1,
  required = false,
  allowNegative = false
}: NumberInputProps) {
  const [error, setError] = useState<string>("")

  const validateAndUpdateValue = (inputValue: string) => {
    // Clear previous error
    setError("")

    // Check if empty and required
    if (required && !inputValue) {
      setError(`${label} is required`)
      return
    }

    // Parse the input value
    const numValue = parseFloat(inputValue)

    // Validate number format
    if (inputValue && isNaN(numValue)) {
      setError("Please enter a valid number")
      return
    }

    // Check negative values
    if (!allowNegative && numValue < 0) {
      setError("Negative values are not allowed")
      return
    }

    // Check min/max constraints
    if (min !== undefined && numValue < min) {
      setError(`Value must be at least ${min}`)
      return
    }
    if (max !== undefined && numValue > max) {
      setError(`Value must be no more than ${max}`)
      return
    }

    // If all validation passes, update the value
    onChange(numValue)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label>{label}{required && <span className="text-red-500">*</span>}</Label>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoCircledIcon className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>{tooltip}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <Input
        type="number"
        value={value}
        onChange={(e) => validateAndUpdateValue(e.target.value)}
        min={allowNegative ? undefined : min}
        max={max}
        step={step}
        required={required}
        className={error ? "border-red-500" : ""}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}

interface PercentageInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  tooltip?: string;
  required?: boolean;
}

export function PercentageInput({ 
  label, 
  value, 
  onChange, 
  tooltip,
  required = false
}: PercentageInputProps) {
  return (
    <NumberInput
      label={label}
      value={value * 100}
      onChange={(value) => onChange(value / 100)}
      tooltip={tooltip}
      min={0}
      max={100}
      step={0.1}
      required={required}
      allowNegative={false}
    />
  )
}

interface CurrencyInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  tooltip?: string;
  required?: boolean;
  allowNegative?: boolean;
}

export function CurrencyInput({ 
  label, 
  value, 
  onChange, 
  tooltip,
  required = false,
  allowNegative = false
}: CurrencyInputProps) {
  const [error, setError] = useState<string>("")

  const validateAndUpdateValue = (inputValue: string) => {
    // Clear previous error
    setError("")

    // Check if empty and required
    if (required && !inputValue) {
      setError(`${label} is required`)
      return
    }

    // Remove currency formatting
    const cleanValue = inputValue.replace(/[$,]/g, "")
    const numValue = parseFloat(cleanValue)

    // Validate number format
    if (cleanValue && isNaN(numValue)) {
      setError("Please enter a valid amount")
      return
    }

    // Check negative values
    if (!allowNegative && numValue < 0) {
      setError("Negative amounts are not allowed")
      return
    }

    // If all validation passes, update the value
    onChange(numValue)
  }

  // Format the value as currency for display
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label>{label}{required && <span className="text-red-500">*</span>}</Label>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoCircledIcon className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>{tooltip}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <Input
        type="text"
        value={formattedValue}
        onChange={(e) => validateAndUpdateValue(e.target.value)}
        required={required}
        className={error ? "border-red-500" : ""}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
