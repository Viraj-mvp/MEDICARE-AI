import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [covidRes, fluRes] = await Promise.all([
      fetch('https://disease.sh/v3/covid-19/countries/India'),
      fetch('https://disease.sh/v3/covid-19/all'),
    ])

    const covid = await covidRes.json()
    const global = await fluRes.json()

    return NextResponse.json({
      india: {
        active:    covid.active,
        recovered: covid.recovered,
        deaths:    covid.deaths,
        updated:   covid.updated,
      },
      global: {
        cases:  global.cases,
        deaths: global.deaths,
      }
    })
  } catch (error) {
    console.error('Outbreak stats fetch failed', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
