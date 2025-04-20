import { PropsWithChildren } from 'react'
import ProvidersClient from '@/contexts/providers-client'
import { getModelCostData } from '@/lib/api/get-model-cost-data'
import { ModelCreditCost } from '@/types/model-cost'

export default async function Providers({ children }: PropsWithChildren) {
  const modelCosts: Map<string, ModelCreditCost> = await getModelCostData()

  return (
    <ProvidersClient modelCosts={modelCosts}>
      {children}
    </ProvidersClient>
  )
}
