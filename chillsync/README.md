# ChillSync - Watch Videos Together

ChillSync is a web application that allows users to watch videos together in perfect synchronization. Create a room, upload your video, and invite friends to watch together in real-time.

## Features

- Create watch rooms and invite friends
- Upload and stream videos
- Synchronized playback controls (play, pause, seek)
- Real-time chat
- Viewer list with presence indicators
- Mobile-responsive design

## Tech Stack

- **Frontend**: React, Socket.io Client, Styled Component
- **Backend**: Node.js, Express, Socket.io
- **Tools**: Vite (for React development)

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- npm or yarn

### Installation

1. Clone the repository
```
git clone https://github.com/MayoPickle/chillsync.git
cd chillsync
```

2. Install server dependencies
```
cd server
npm install
```

3. Install client dependencies
```
cd ../client
npm install
```

### Running the Application

1. Start the server
```
cd server
npm run dev
```

2. In a separate terminal, start the client
```
cd client
npm run dev
```

3. Open your browser and go to `http://localhost:3000`

## How to Use

1. **Create a Room**:
   - Click "Create a Room" on the homepage
   - Enter your name (optional)
   - Share the generated room ID or link with friends

2. **Join a Room**:
   - Enter the room ID in the "Join an Existing Room" section
   - Enter your name (optional)
   - Click "Join Room"

3. **Upload a Video**:
   - Once in a room, click "Upload Video"
   - Select a video file from your computer (MP4, WebM, or OGG format)
   - The video will be uploaded and shared with everyone in the room

4. **Watch Together**:
   - Playback controls are automatically synchronized
   - Anyone in the room can play, pause, or seek, and it will update for everyone
   - Use the chat to communicate with others in the room

## License

This project is licensed under the ISC License.

## Acknowledgments

- Socket.io for real-time communication
- React for the user interface
- Styled Components for styling 
