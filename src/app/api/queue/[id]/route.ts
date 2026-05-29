import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id) {
      return NextResponse.json(
        { error: 'Queue item ID is required' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { position, isPlaying, isPlayed, votes } = body

    if (position !== undefined && typeof position !== 'number') {
      return NextResponse.json(
        { error: 'Position must be a number' },
        { status: 400 }
      )
    }

    if (votes !== undefined && typeof votes !== 'number') {
      return NextResponse.json(
        { error: 'Votes must be a number' },
        { status: 400 }
      )
    }

    const queueItem = await prisma.queueItem.update({
      where: { id: params.id },
      data: {
        ...(position !== undefined && { position }),
        ...(isPlaying !== undefined && { isPlaying }),
        ...(isPlayed !== undefined && { isPlayed }),
        ...(votes !== undefined && { votes }),
      },
      include: {
        user: true,
      },
    })

    return NextResponse.json(queueItem)
  } catch (error) {
    console.error('Error updating queue item:', error)
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Queue item not found' },
          { status: 404 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to update queue item. Please try again.' },
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
        { error: 'Queue item ID is required' },
        { status: 400 }
      )
    }

    await prisma.queueItem.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Queue item deleted successfully' })
  } catch (error) {
    console.error('Error deleting queue item:', error)
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Queue item not found' },
          { status: 404 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to delete queue item. Please try again.' },
      { status: 500 }
    )
  }
}
