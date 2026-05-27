import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const videoId = searchParams.get('videoId')

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      )
    }

    // Try YouTube oEmbed API (no API key required)
    try {
      const oembedResponse = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      )

      if (oembedResponse.ok) {
        const oembedData = await oembedResponse.json()
        return NextResponse.json({
          youtubeId: videoId,
          title: oembedData.title,
          thumbnail: oembedData.thumbnail_url,
          channelTitle: oembedData.author_name,
        })
      }
    } catch (oembedError) {
      console.log('oEmbed failed, trying fallback:', oembedError)
    }

    // Fallback to YouTube Data API if available
    if (process.env.YOUTUBE_API_KEY) {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`
      )

      if (response.ok) {
        const data = await response.json()

        if (data.items && data.items.length > 0) {
          const video = data.items[0]
          return NextResponse.json({
            youtubeId: videoId,
            title: video.snippet.title,
            thumbnail: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.default.url,
            channelTitle: video.snippet.channelTitle,
          })
        }
      }
    }

    // Final fallback to generic data
    return NextResponse.json({
      youtubeId: videoId,
      title: `YouTube Video (${videoId})`,
      thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
      channelTitle: 'Added via URL',
    })
  } catch (error) {
    console.error('Error fetching video details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch video details' },
      { status: 500 }
    )
  }
}
