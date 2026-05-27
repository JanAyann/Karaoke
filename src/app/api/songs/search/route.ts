import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    // If no YouTube API key, return mock data for testing
    if (!process.env.YOUTUBE_API_KEY) {
      const mockSongs = [
        {
          youtubeId: 'dQw4w9WgXcQ',
          title: `${query} - Karaoke Version`,
          thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg',
          channelTitle: 'Karaoke Channel',
        },
        {
          youtubeId: 'jNQXAC9IVRw',
          title: `${query} - Acoustic Karaoke`,
          thumbnail: 'https://i.ytimg.com/vi/jNQXAC9IVRw/default.jpg',
          channelTitle: 'Karaoke Hits',
        },
        {
          youtubeId: '9bZkp7q19f0',
          title: `${query} - Pop Karaoke`,
          thumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/default.jpg',
          channelTitle: 'Sing Along',
        },
      ]
      return NextResponse.json(mockSongs)
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query + ' karaoke')}&type=video&maxResults=10&key=${process.env.YOUTUBE_API_KEY}`
    )

    if (!response.ok) {
      throw new Error('YouTube API request failed')
    }

    const data = await response.json()

    const songs = data.items.map((item: any) => ({
      youtubeId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.default.url,
      channelTitle: item.snippet.channelTitle,
    }))

    return NextResponse.json(songs)
  } catch (error) {
    console.error('Error searching songs:', error)
    return NextResponse.json(
      { error: 'Failed to search songs' },
      { status: 500 }
    )
  }
}
