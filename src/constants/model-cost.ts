interface ModelCost {
  name: string
  creditPerInputToken: string
  creditPerOutputToken: string
  contextLength: string
  maxCompletion: string
  score: string
}

export const modelCost: ModelCost[] = [
  {
    name: 'DeepSeek R1',
    creditPerInputToken: '0.715',
    creditPerOutputToken: '2.847',
    contextLength: '128k tokens',
    maxCompletion: '128k tokens',
    score: '-',
  },
  {
    name: 'DeepSeek V3',
    creditPerInputToken: '0.65',
    creditPerOutputToken: '1.95',
    contextLength: '128k tokens',
    maxCompletion: '128k tokens',
    score: '-',
  },
  {
    name: 'Gemini 2.5 Pro',
    creditPerInputToken: '1.625',
    creditPerOutputToken: '13',
    contextLength: '1M tokens',
    maxCompletion: '65k tokens',
    score: '-',
  },
  {
    name: 'Free Models',
    creditPerInputToken: '0',
    creditPerOutputToken: '0',
    contextLength: 'Varies',
    maxCompletion: 'Varies',
    score: '-',
  },
  {
    name: 'Custom API',
    creditPerInputToken: '0',
    creditPerOutputToken: '0',
    contextLength: 'Unknown',
    maxCompletion: 'Unknown',
    score: '-',
  },
]
