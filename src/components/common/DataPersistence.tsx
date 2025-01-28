import { saveToFile, loadFromFile } from '@/utils/fileOperations'
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"

interface DataPersistenceProps<T> {
  data: T
  onDataImport: (data: T) => void
  dataType: string
  className?: string
}

export function DataPersistence<T>({ 
  data, 
  onDataImport, 
  dataType, 
  className = "" 
}: DataPersistenceProps<T>) {
  const { toast } = useToast()

  const handleExport = () => {
    const timestamp = new Date().toISOString().split('T')[0]
    saveToFile(data, dataType, `${dataType}-${timestamp}.json`)
    toast({
      title: "Data Exported",
      description: `Your ${dataType} data has been exported successfully.`,
    })
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const importedData = await loadFromFile<T>(file, dataType)
      onDataImport(importedData)
      toast({
        title: "Data Imported",
        description: `Your ${dataType} data has been imported successfully.`,
      })
    } catch (error) {
      toast({
        title: "Import Error",
        description: error instanceof Error ? error.message : "Failed to import data",
        variant: "destructive"
      })
    }
    // Reset the input
    event.target.value = ''
  }

  return (
    <div className={`flex gap-4 ${className}`}>
      <input
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
        id={`import-${dataType}`}
      />
      <label
        htmlFor={`import-${dataType}`}
        className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md cursor-pointer"
      >
        Import Data
      </label>
      <Button
        onClick={handleExport}
        variant="default"
      >
        Export Data
      </Button>
    </div>
  )
}
