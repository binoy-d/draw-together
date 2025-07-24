# Bubbles, Together

A real-time collaborative drawing application where anyone can draw together on a shared canvas!

Originally deployed at https://bubbles.binoy.co

## Features

- Real-time collaborative cursor tracking
- Multiple users can draw together simultaneously
- Each user gets a unique color
- WebSocket-based communication using Socket.IO
- **Live User Count Display**: Clean, minimal counter showing active users
- **Slower Bubble Dispersion**: Bubbles now float and fade more gracefully
- **Optimized Performance**: 
  - Throttled cursor updates (~60 FPS)
  - Efficient particle management with limits
  - Reduced server-side broadcasting frequency
  - Memory cleanup for disconnected users

## Technologies

Created with Node.js, Express, Socket.IO, EJS, and p5.js

## Performance Optimizations

This version includes several performance improvements:

### Server-side:
- **Throttled Broadcasting**: Updates sent at 60 FPS instead of every 100ms
- **Smart User Management**: Automatic cleanup of inactive users
- **Efficient Data Structures**: Using Maps for better performance
- **Modern Socket.IO**: Updated to v4.x with better optimization settings

### Client-side:
- **Frame Rate Control**: Throttled mouse updates to ~60 FPS
- **Particle Limits**: Maximum 500 particles to prevent memory issues
- **Optimized Rendering**: Pre-calculated velocities and reduced draw calls
- **Modern Libraries**: Updated p5.js and Socket.IO for better performance
- **Slower Dispersion**: Bubbles live longer (150 frames vs 105) with slower movement
- **User Count Display**: Real-time counter with clean, minimal design

## Prerequisites

- Node.js 18+ (for local development)
- Docker (for containerized deployment)

## Running with Docker (Recommended)

### Option 1: Using Docker directly

1. Build the Docker image:
```bash
docker build -t draw-together .
```

2. Run the container:
```bash
docker run -d --name draw-together -p 3000:3000 draw-together
```

3. Access the application at http://localhost:3000

4. To stop the container:
```bash
docker stop draw-together
docker rm draw-together
```

### Option 2: Using Docker Compose

1. Start the application:
```bash
docker-compose up -d
```

2. Access the application at http://localhost:3000

3. To stop the application:
```bash
docker-compose down
```

4. To view logs:
```bash
docker-compose logs -f
```

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open http://localhost:3000 in your browser

## Project Structure

```
├── server.js           # Main server file with Socket.IO setup
├── package.json        # Node.js dependencies and scripts
├── public/            # Static files
│   └── client.js      # Client-side JavaScript
├── views/             # EJS templates
│   └── index.ejs      # Main page template
├── Dockerfile         # Docker configuration
├── docker-compose.yml # Docker Compose configuration
├── .dockerignore      # Docker ignore file
└── .gitignore         # Git ignore file
```

## Environment Variables

- `PORT`: Server port (default: 3000)
- `IP`: Server IP address (default: 0.0.0.0)
- `NODE_ENV`: Environment (development/production)

## Docker Configuration

The Dockerfile uses:
- Node.js 18 Alpine base image for smaller size
- Multi-stage approach for optimized production builds
- Non-root user for security
- Production-only dependencies

## Security Features

- Runs as non-root user in Docker container
- Production-only dependencies in Docker image
- Proper file permissions and ownership

## Development with Docker

For development with live reload, uncomment the volume mounts in `docker-compose.yml`:

```yaml
volumes:
  - .:/app
  - /app/node_modules
```

## License

ISC

## Author

Daniel Binoy
