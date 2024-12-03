import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Info } from "lucide-react"

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
}

export function BusinessPlanSection({
  title,
  description,
  fields,
  values,
  onChange,
}: BusinessPlanSectionProps) {
  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="space-y-2">
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
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
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
