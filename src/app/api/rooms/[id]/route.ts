import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      )
    }

    const room = await prisma.room.findUnique({
      where: { id: params.id },
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { name, isActive } = body

    if (!name && isActive === undefined) {
      return NextResponse.json(
        { error: 'At least one field (name or isActive) is required' },
        { status: 400 }
      )
    }

    const room = await prisma.room.update({
      where: { id: params.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json(room)
  } catch (error) {
    console.error('Error updating room:', error)
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Room not found' },
          { status: 404 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to update room. Please try again.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      )
    }

    await prisma.room.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Room deleted successfully' })
  } catch (error) {
    console.error('Error deleting room:', error)
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Room not found' },
          { status: 404 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to delete room. Please try again.' },
      { status: 500 }
    )
  }
}
