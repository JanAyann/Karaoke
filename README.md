# Karaoke Reservation System

A modern, real-time karaoke room management platform built with Next.js, TypeScript, Socket.IO, and PostgreSQL.

## Features

- **Room Management**: Create and join karaoke rooms with unique room codes
- **Real-time Queue**: Live song queue synchronization across all connected users
- **YouTube Integration**: Search and play karaoke videos directly from YouTube
- **QR Code Sharing**: Generate QR codes for instant room sharing
- **Multi-user Support**: Multiple users can join and interact simultaneously
- **Responsive Design**: Mobile-first dark mode UI with smooth animations
- **Host Controls**: Room hosts can play, skip, and manage the song queue

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.IO for WebSocket connections
- **Video**: YouTube IFrame Player API
- **QR Codes**: qrcode library
- **State Management**: Zustand
- **Icons**: Lucide React

## Project Structure

```
windsurf-project/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/                    # Static assets
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── rooms/         # Room API routes
│   │   │   ├── queue/         # Queue API routes
│   │   │   ├── songs/         # Song search API
│   │   │   └── socket/        # Socket.IO setup
│   │   ├── create/            # Room creation page
│   │   ├── room/[code]/       # Room dashboard page
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Card.tsx
│   │   └── karaoke/           # Karaoke-specific components
│   │       ├── YouTubePlayer.tsx
│   │       ├── QueueList.tsx
│   │       ├── SongSearch.tsx
│   │       └── QRCode.tsx
│   ├── contexts/              # React contexts
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions
│   │   ├── prisma.ts          # Prisma client
│   │   ├── socket.ts          # Socket.IO setup
│   │   └── utils.ts           # Helper functions
│   └── types/                 # TypeScript type definitions
│       └── index.ts
├── .env.example               # Environment variables template
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## Database Schema

The application uses PostgreSQL with the following models:

- **User**: Stores user information (nickname, avatar)
- **Room**: Represents karaoke rooms (name, code, active status)
- **RoomMember**: Junction table for room membership
- **QueueItem**: Songs in the queue (YouTube ID, position, votes)
- **SongHistory**: History of played songs

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd windsurf-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/karaoke_db?schema=public"
   YOUTUBE_API_KEY="your_youtube_api_key_here"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   NODE_ENV="development"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## API Routes

### Rooms

- `POST /api/rooms` - Create a new room
- `GET /api/rooms?code={code}` - Get room by code
- `GET /api/rooms/{id}` - Get room by ID
- `PATCH /api/rooms/{id}` - Update room
- `DELETE /api/rooms/{id}` - Delete room
- `POST /api/rooms/join` - Join an existing room

### Queue

- `GET /api/queue?roomId={id}` - Get room queue
- `POST /api/queue` - Add song to queue
- `PATCH /api/queue/{id}` - Update queue item
- `DELETE /api/queue/{id}` - Remove from queue

### Songs

- `GET /api/songs/search?q={query}` - Search YouTube for karaoke songs

### Socket.IO

- `GET /api/socket` - Socket.IO connection endpoint

## Socket.IO Events

### Client → Server

- `join-room` - Join a room
- `leave-room` - Leave a room
- `queue-update` - Broadcast queue changes
- `song-play` - Start playing a song
- `song-skip` - Skip current song

### Server → Client

- `user-joined` - User joined the room
- `user-left` - User left the room
- `queue-updated` - Queue has been updated
- `song-playing` - Song is now playing
- `song-skipped` - Song was skipped

## Core Architecture

### Real-time Synchronization

The application uses Socket.IO for real-time communication:

1. **Room Joining**: When a user joins a room, they connect via Socket.IO
2. **Queue Updates**: Any queue change is broadcast to all room members
3. **Song Playback**: Host controls are synced across all connected clients
4. **User Presence**: Track active users in each room

### YouTube Integration

- Uses YouTube Data API v3 for song search
- Embeds YouTube IFrame Player for video playback
- Automatically searches for "karaoke" versions of songs
- Handles video end events for auto-advancing queue

### Queue Management

- Position-based ordering (1, 2, 3, ...)
- Host can reorder, remove, and skip songs
- Voting system for song priority (optional)
- Played song history tracking

## Best Practices for Scalability

### Database Optimization

- Use indexes on frequently queried fields (room code, queue position)
- Implement connection pooling with Prisma
- Consider read replicas for high-traffic scenarios
- Archive old song history periodically

### Real-time Performance

- Use Socket.IO rooms for efficient broadcasting
- Implement rate limiting for socket events
- Consider Redis for Socket.IO scaling across multiple servers
- Optimize payload sizes (send only necessary data)

### Frontend Optimization

- Implement virtual scrolling for large queues
- Use React.memo for expensive components
- Lazy load YouTube player
- Implement debouncing for search inputs

### Security Considerations

- Validate all user inputs on the server
- Sanitize room codes and nicknames
- Implement rate limiting on API routes
- Use environment variables for sensitive data
- Consider authentication for production use

## Development

### Adding New Features

1. **Database Changes**: Update `prisma/schema.prisma` and run migrations
2. **API Routes**: Add new routes in `src/app/api/`
3. **Components**: Create reusable components in `src/components/`
4. **Pages**: Add new pages in `src/app/`
5. **Types**: Update TypeScript types in `src/types/`

### Testing

```bash
# Run linter
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

Ensure the platform supports:
- Node.js 18+
- WebSocket connections (Socket.IO)
- PostgreSQL database
- Static file serving

## Troubleshooting

### Common Issues

**Socket.IO connection fails**
- Check if WebSocket is supported by your hosting platform
- Verify the Socket.IO path configuration

**YouTube API errors**
- Ensure your YouTube API key is valid
- Check API quota limits
- Verify the API key is in environment variables

**Database connection errors**
- Verify DATABASE_URL is correct
- Check PostgreSQL is running
- Ensure database exists

## Future Enhancements

- User authentication (OAuth, JWT)
- Song voting system
- Queue priority system
- Room activity logs
- User avatars
- Voice chat integration
- Lyrics display
- Song favorites
- Room themes/customization
- Analytics dashboard

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
