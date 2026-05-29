import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const roomId = searchParams.get('roomId')

    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      )
    }

    if (roomId.trim().length === 0) {
      return NextResponse.json(
        { error: 'Room ID cannot be empty' },
        { status: 400 }
      )
    }

    const queue = await prisma.queueItem.findMany({
      where: {
        roomId: roomId.trim(),
        isPlayed: false,
      },
      orderBy: { position: 'asc' },
      include: {
        user: true,
      },
    })

    return NextResponse.json(queue)
  } catch (error) {
    console.error('Error fetching queue:', error)
    return NextResponse.json(
      { error: 'Failed to fetch queue. Please try again.' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { roomId, userId, youtubeId, title, thumbnail } = body

    if (!roomId || !userId || !youtubeId || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: roomId, userId, youtubeId, and title are required' },
        { status: 400 }
      )
    }

    if (roomId.trim().length === 0 || userId.trim().length === 0 || youtubeId.trim().length === 0 || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Required fields cannot be empty' },
        { status: 400 }
      )
    }

    // Verify room exists
    const room = await prisma.room.findUnique({
      where: { id: roomId.trim() },
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId.trim() },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const lastItem = await prisma.queueItem.findFirst({
      where: { roomId: roomId.trim(), isPlayed: false },
      orderBy: { position: 'desc' },
    })

    const newPosition = lastItem ? lastItem.position + 1 : 1

    const queueItem = await prisma.queueItem.create({
      data: {
        roomId: roomId.trim(),
        userId: userId.trim(),
        youtubeId: youtubeId.trim(),
        title: title.trim(),
        thumbnail: thumbnail?.trim() || '',
        position: newPosition,
      },
      include: {
        user: true,
      },
    })

    return NextResponse.json(queueItem, { status: 201 })
  } catch (error) {
    console.error('Error adding to queue:', error)
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return NextResponse.json(
          { error: 'Invalid room or user ID' },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to add to queue. Please try again.' },
      { status: 500 }
    )
  }
}
