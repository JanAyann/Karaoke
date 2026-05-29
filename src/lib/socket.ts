import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { NextApiRequest } from 'next'

export type NextApiResponseWithSocket = NextApiRequest & {
  socket: {
    server: HTTPServer & {
      io?: SocketIOServer
    }
  }
}

export const initSocket = (req: NextApiResponseWithSocket) => {
  if (!req.socket.server.io) {
    const io = new SocketIOServer(req.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
    })
    
    req.socket.server.io = io
    
    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)
      
      socket.on('join-room', (roomId: string) => {
        socket.join(roomId)
        socket.to(roomId).emit('user-joined', socket.id)
      })
      
      socket.on('leave-room', (roomId: string) => {
        socket.leave(roomId)
        socket.to(roomId).emit('user-left', socket.id)
      })
      
      socket.on('queue-update', (data: { roomId: string; queue: any[] }) => {
        socket.to(data.roomId).emit('queue-updated', data.queue)
      })
      
      socket.on('song-play', (data: { roomId: string; song: any }) => {
        socket.to(data.roomId).emit('song-playing', data.song)
      })
      
      socket.on('song-skip', (roomId: string) => {
        socket.to(roomId).emit('song-skipped')
      })
      
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })
  }
  
  return req.socket.server.io
}
