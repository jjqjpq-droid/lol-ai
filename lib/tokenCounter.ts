import { encodingForModel, getEncoding as getTiktokenEncoding } from 'js-tiktoken'

const encodingMap: Record<string, any> = {}

export function getEncoding(modelName: string) {
  if (!encodingMap[modelName]) {
    try {
      encodingMap[modelName] = encodingForModel(modelName as any)
    } catch {
      // Fallback to cl100k_base encoding for unknown models
      try {
        encodingMap[modelName] = getTiktokenEncoding('cl100k_base')
      } catch {
        // If all else fails, return a mock encoding
        encodingMap[modelName] = {
          encode: (text: string) => Array.from(text).slice(0, Math.ceil(text.length / 4)),
        }
      }
    }
  }
  return encodingMap[modelName]
}

export function countTokens(text: string, model: string): number {
  try {
    const encoding = getEncoding(model)
    return encoding.encode(text).length
  } catch {
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4)
  }
}

export const CREDIT_COSTS: Record<string, number> = {
  'dolphin': 0.0015,           // Cheap model
  'github': 0,                  // Free (unlimited GitHub account)
  'claude': 0.015,              // Expensive Claude model
  'perplexity': 0.005,          // Mid-range
  'glm': 0.004,                 // Mid-range
  'hy3': 0.003,                 // Mid-range
}

export function calculateCredits(model: string, tokenCount: number): number {
  const costPerToken = CREDIT_COSTS[model] || 0.001
  return tokenCount * costPerToken
}
