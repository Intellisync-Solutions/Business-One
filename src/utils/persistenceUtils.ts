import { z } from 'zod'

// Generic type for calculator state
export interface CalculatorState {
  id: string
  name: string
  timestamp: number
  calculatorType: string
  data: any
}

// Schema for validating stored data
const calculatorStateSchema = z.object({
  id: z.string(),
  name: z.string(),
  timestamp: z.number(),
  calculatorType: z.string(),
  data: z.any()
})

const STORAGE_KEY = 'intellisync_calculator_states'

export const persistenceUtils = {
  // Save calculator state
  saveState: (state: CalculatorState): void => {
    try {
      const existingStates = persistenceUtils.getAllStates()
      const newStates = [...existingStates.filter(s => s.id !== state.id), state]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newStates))
    } catch (error) {
      console.error('Error saving calculator state:', error)
    }
  },

  // Get all saved states
  getAllStates: (): CalculatorState[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return []
      
      const parsed = JSON.parse(stored)
      return Array.isArray(parsed) 
        ? parsed.filter(state => {
            try {
              calculatorStateSchema.parse(state)
              return true
            } catch {
              return false
            }
          })
        : []
    } catch (error) {
      console.error('Error retrieving calculator states:', error)
      return []
    }
  },

  // Get states for a specific calculator type
  getStatesByType: (calculatorType: string): CalculatorState[] => {
    return persistenceUtils.getAllStates()
      .filter(state => state.calculatorType === calculatorType)
      .sort((a, b) => b.timestamp - a.timestamp)
  },

  // Delete a saved state
  deleteState: (id: string): void => {
    try {
      const states = persistenceUtils.getAllStates()
      const newStates = states.filter(state => state.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newStates))
    } catch (error) {
      console.error('Error deleting calculator state:', error)
    }
  },

  // Clear all saved states
  clearAllStates: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing calculator states:', error)
    }
  }
}
