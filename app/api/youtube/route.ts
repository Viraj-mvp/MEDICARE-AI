import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q')
  if (!query) return NextResponse.json({ error: 'Missing query' }, { status: 400 })

  const url = new URL('https://www.googleapis.com/youtube/v3/search')
  url.searchParams.set('part', 'snippet')
  url.searchParams.set('q', query)
  url.searchParams.set('type', 'video')
  url.searchParams.set('maxResults', '3')
  url.searchParams.set('relevanceLanguage', 'en')
  url.searchParams.set('regionCode', 'IN')  // India-first results
  url.searchParams.set('key', process.env.YOUTUBE_API_KEY!)

  try {
    const res = await fetch(url.toString())
    const data = await res.json()

    if (!res.ok) {
      console.error('YouTube API Error:', data);
      return NextResponse.json({ error: 'YouTube API failed' }, { status: res.status })
    }

    const videos = data.items?.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
      channel: item.snippet.channelTitle,
      embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
    }))

    return NextResponse.json({ videos })
  } catch (error) {
    console.error('YouTube execution error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
