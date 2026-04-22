// lib/ai/providers.ts
import OpenAI from 'openai'

// ── Tier 1: Groq — free, 300 tok/s, best for India latency ──
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY ?? '',
  baseURL: 'https://api.groq.com/openai/v1',
})

// ── Tier 2: Gemini — free, via OpenAI-compat endpoint ───────
const gemini = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY ?? '',
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai',
})

export interface AIResponse {
  text: string
  source: 'Groq' | 'Gemini' | 'Rule-Based'
}

const sanitizeInput = (input: string): string => {
  return input.replace(/[<>{}$`]/g, '').trim()
}

const withTimeout = <T>(promise: Promise<T>, ms: number, providerName: string): Promise<T> => {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`[AI] ${providerName} timeout after ${ms}ms`)), ms)
  )
  return Promise.race([promise, timeout])
}

export async function callAI(
  messages: { role: 'user' | 'assistant' | 'system', content: string }[],
  systemPrompt: string
): Promise<AIResponse> {
  // ── Tier 1: Groq ─────────────────────────────────────────
  if (process.env.GROQ_API_KEY) {
    try {
      const completion = groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile', // best free model for reasoning
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ 
            role: m.role, 
            content: sanitizeInput(m.content) 
          })),
        ],
        max_tokens: 1000,
        temperature: 0.3, // lower = more consistent medical output
      })
      const res = await withTimeout(completion, 8000, 'Groq')
      const text = res.choices[0]?.message?.content
      if (text) return { text, source: 'Groq' }
    } catch (err) {
      console.warn('[AI] Groq failed:', (err as Error).message)
    }
  }

  // ── Tier 2: Gemini Flash ──────────────────────────────────
  if (process.env.GEMINI_API_KEY) {
    try {
      const completion = gemini.chat.completions.create({
        model: 'gemini-1.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ 
            role: m.role, 
            content: sanitizeInput(m.content) 
          })),
        ],
        max_tokens: 1000,
        temperature: 0.3,
      })
      const res = await withTimeout(completion, 6000, 'Gemini')
      const text = res.choices[0]?.message?.content
      if (text) return { text, source: 'Gemini' }
    } catch (err) {
      console.warn('[AI] Gemini failed:', (err as Error).message)
    }
  }

  // ── Tier 3: Rule-Based (existing) ────────────────────────
  throw new Error('NO_AI_PROVIDER') // caught by orchestrator.ts → triggers rule-based
}
