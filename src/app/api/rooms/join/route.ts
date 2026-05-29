import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code, nickname } = body

    if (!code || !nickname) {
      return NextResponse.json(
        { error: 'Room code and nickname are required' },
        { status: 400 }
      )
    }

    if (code.trim().length === 0 || nickname.trim().length === 0) {
      return NextResponse.json(
        { error: 'Room code and nickname cannot be empty' },
        { status: 400 }
      )
    }

    const room = await prisma.room.findUnique({
      where: { code: code.trim() },
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    let user = await prisma.user.findUnique({ where: { nickname: nickname.trim() } })

    if (!user) {
      user = await prisma.user.create({
        data: { nickname: nickname.trim() },
      })
    }

    const existingMember = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: {
          roomId: room.id,
          userId: user.id,
        },
      },
    })

    if (!existingMember) {
      await prisma.roomMember.create({
        data: {
          roomId: room.id,
          userId: user.id,
        },
      })
    }

    return NextResponse.json({ room, user })
  } catch (error) {
    console.error('Error joining room:', error)
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'You are already a member of this room' },
          { status: 409 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to join room. Please try again.' },
      { status: 500 }
    )
  }
}
