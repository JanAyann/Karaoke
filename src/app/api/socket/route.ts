import { NextApiRequest } from 'next'
import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { initSocket, NextApiResponseWithSocket } from '@/lib/socket'

export default function handler(req: NextApiRequest, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const io = initSocket(res as NextApiResponseWithSocket)
  res.end()
}
