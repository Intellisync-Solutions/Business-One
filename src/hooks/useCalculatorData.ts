import { useLocalStorage } from './useLocalStorage'

export function useCalculatorData<T>(
  calculatorType: string,
  initialData: T
): [T, (data: T | ((prev: T) => T)) => void] {
  const [data, setData] = useLocalStorage<T>(
    `calculator-${calculatorType}`,
    initialData
  )

  const updateData = (dataOrUpdater: T | ((prev: T) => T)) => {
    if (typeof dataOrUpdater === 'function') {
      setData((prev) => (dataOrUpdater as (prev: T) => T)(prev))
    } else {
      setData(dataOrUpdater)
    }
  }

  return [data, updateData]
}
