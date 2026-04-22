import { NextRequest, NextResponse } from 'next/server'
import { getConditionSummary } from '@/lib/medlineplus'

export async function GET(req: NextRequest) {
  const specialty = req.nextUrl.searchParams.get('specialty')
  if (!specialty) return NextResponse.json({ summary: null })

  const summary = await getConditionSummary(specialty)
  return NextResponse.json({ summary })
}
