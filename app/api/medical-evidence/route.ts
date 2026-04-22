import { NextRequest, NextResponse } from 'next/server'
import { fetchClinicalEvidence } from '@/lib/medical-search'

export async function GET(req: NextRequest) {
  const diagnosis = req.nextUrl.searchParams.get('diagnosis')
  if (!diagnosis) return NextResponse.json({ articles: [] })

  const articles = await fetchClinicalEvidence(diagnosis)
  return NextResponse.json({ articles })
}
