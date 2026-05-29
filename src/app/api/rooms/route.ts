import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateRoomCode } from '@/lib/utils'
import { Prisma } from '@prisma/client'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, nickname } = body

    if (!name || !nickname) {
      return NextResponse.json(
        { error: 'Room name and nickname are required' },
        { status: 400 }
      )
    }

    if (name.trim().length === 0 || nickname.trim().length === 0) {
      return NextResponse.json(
        { error: 'Room name and nickname cannot be empty' },
        { status: 400 }
      )
    }

    let code = generateRoomCode()
    let existingRoom = await prisma.room.findUnique({ where: { code } })

    while (existingRoom) {
      code = generateRoomCode()
      existingRoom = await prisma.room.findUnique({ where: { code } })
    }

    const room = await prisma.room.create({
      data: {
        name: name.trim(),
        code,
      },
    })

    let user = await prisma.user.findUnique({ where: { nickname: nickname.trim() } })

    if (!user) {
      user = await prisma.user.create({
        data: { nickname: nickname.trim() },
      })
    }

    await prisma.roomMember.create({
      data: {
        roomId: room.id,
        userId: user.id,
      },
    })

    return NextResponse.json({ room, user }, { status: 201 })
  } catch (error) {
    console.error('Error creating room:', error)
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'A room with this code already exists' },
          { status: 409 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create room. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json(
        { error: 'Room code is required' },
        { status: 400 }
      )
    }

    if (code.trim().length === 0) {
      return NextResponse.json(
        { error: 'Room code cannot be empty' },
        { status: 400 }
      )
    }

    const room = await prisma.room.findUnique({
      where: { code: code.trim() },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        queueItems: {
          where: { isPlayed: false },
          orderBy: { position: 'asc' },
          include: {
            user: true,
          },
        },
      },
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(room)
  } catch (error) {
    console.error('Error fetching room:', error)
    return NextResponse.json(
      { error: 'Failed to fetch room. Please try again.' },
      { status: 500 }
    )
  }
}
