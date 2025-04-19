import { ModelCollection } from "@/types/model"

export const FREE_MODELS: ModelCollection = {
  "Limited": [
    {
      "name": "DeepSeek R1 (Base)",
      "maxInput": 128000,
      "maxOutput": 128000,
      "structuredOutput": true,
      "default": {
        "isMaxCompletionTokensAuto": true,
        "isUseStructuredOutput": false
      }
    },
    {
      "name": "DeepSeek R1",
      "maxInput": 163840,
      "maxOutput": 163840,
      "structuredOutput": true,
      "default": {
        "isMaxCompletionTokensAuto": false,
        "maxCompletionTokens": 163840,
        "isUseStructuredOutput": false
      }
    },
    {
      "name": "DeepSeek V3 03-24",
      "maxInput": 128000,
      "maxOutput": 128000,
      "structuredOutput": true
    }
  ],
  "Gemini": [
    {
      "name": "Gemini 2.5 Pro Experimental 03-25",
      "maxInput": 1000000,
      "maxOutput": 65536,
      "structuredOutput": true
    },
    {
      "name": "Gemini 2.0 Flash Thinking Experimental 01-21",
      "maxInput": 1000000,
      "maxOutput": 65536,
      "structuredOutput": false
    },
    {
      "name": "Gemini 2.0 Flash Experimental",
      "maxInput": 1000000,
      "maxOutput": 8192,
      "structuredOutput": true
    }
  ],
  "Free Models": [
    {
      "name": "DeepSeek R1 (Free)",
      "maxInput": 163840,
      "maxOutput": 163840,
      "structuredOutput": true,
      "default": {
        "isMaxCompletionTokensAuto": true,
        "isUseStructuredOutput": false
      }
    }
  ]
}
