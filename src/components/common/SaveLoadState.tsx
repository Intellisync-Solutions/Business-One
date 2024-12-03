import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, FolderOpen, Trash2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

interface SavedState {
  id: string
  name: string
  timestamp: number
  calculatorType: string
  data: any
}

interface SaveLoadStateProps {
  calculatorType: string
  currentState: any
  onLoadState: (state: any) => void
}

const STORAGE_KEY = 'intellisync_calculator_states'

export function SaveLoadState({ calculatorType, currentState, onLoadState }: SaveLoadStateProps) {
  const [isNaming, setIsNaming] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [savedStates, setSavedStates] = useState<SavedState[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return []
      
      const parsed = JSON.parse(stored)
      return Array.isArray(parsed) 
        ? parsed.filter(state => state.calculatorType === calculatorType)
        : []
    } catch {
      return []
    }
  })

  const saveState = useCallback(() => {
    if (!saveName.trim()) return

    const newState: SavedState = {
      id: uuidv4(),
      name: saveName,
      timestamp: Date.now(),
      calculatorType,
      data: currentState
    }

    setSavedStates(prev => {
      const updated = [...prev, newState]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
    setSaveName('')
    setIsNaming(false)
  }, [saveName, currentState, calculatorType])

  const loadState = useCallback((state: SavedState) => {
    onLoadState(state.data)
  }, [onLoadState])

  const deleteState = useCallback((id: string) => {
    setSavedStates(prev => {
      const updated = prev.filter(state => state.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          {isNaming ? (
            <div className="p-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Enter a name for this save"
                  className="h-8"
                />
                <Button 
                  onClick={saveState} 
                  disabled={!saveName.trim()}
                  size="sm"
                >
                  Save State
                </Button>
              </div>
            </div>
          ) : (
            <DropdownMenuItem onSelect={() => setIsNaming(true)}>
              New Save
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <FolderOpen className="mr-2 h-4 w-4" />
            Load
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-72">
          {savedStates.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">
              No saved states found
            </div>
          ) : (
            savedStates.map((state) => (
              <div
                key={state.id}
                className="flex items-center justify-between p-2 hover:bg-accent"
              >
                <div className="flex-1">
                  <p className="font-medium">{state.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(state.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => loadState(state)}
                    className="h-6 px-2"
                  >
                    Load
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteState(state.id)}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
