'use client'

import { createContext, useContext, ReactNode } from 'react'
import { ModelCreditCost } from '@/types/model-cost'

interface ModelCostContextType {
  modelCosts: Map<string, ModelCreditCost>
}

const ModelCostContext = createContext<ModelCostContextType | undefined>(undefined)

interface ModelCostProviderProps {
  children: ReactNode
  value: Map<string, ModelCreditCost>
}

export function ModelCostProvider({ children, value }: ModelCostProviderProps) {
  return (
    <ModelCostContext.Provider value={{ modelCosts: value }}>
      {children}
    </ModelCostContext.Provider>
  )
}

export function useModelCosts() {
  const context = useContext(ModelCostContext)
  if (context === undefined) {
    throw new Error('useModelCosts must be used within a ModelCostProvider')
  }
  return context.modelCosts
}
