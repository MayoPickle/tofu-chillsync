import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import io from 'socket.io-client';

const RoomContainer = styled.div`
  padding: 2rem 0;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const RoomHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const RoomTitle = styled.h1`
  font-size: 1.75rem;
  margin: 0;
`;

const RoomId = styled.span`
  font-size: 1rem;
  font-weight: normal;
  color: var(--dark-grey);
  margin-left: 0.5rem;
`;

const RoomMain = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 1.5rem;
  flex: 1;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
`;

const VideoSection = styled.div`
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  background-color: #000;
  aspect-ratio: 16 / 9;
  
  video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const VideoPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #fff;
  text-align: center;
  padding: 1.5rem;
`;

const VideoControls = styled.div`
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background-color: #F8F9FA;
  border-top: 1px solid #E9ECEF;
`;

const ControlButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  
  &:hover {
    background-color: var(--primary-hover);
  }
  
  &:disabled {
    background-color: var(--grey-color);
    cursor: not-allowed;
  }
`;

const TimeDisplay = styled.div`
  font-family: monospace;
  font-size: 0.875rem;
  color: var(--dark-grey);
`;

const SeekBar = styled.input.attrs({ type: 'range' })`
  flex: 1;
  height: 4px;
  appearance: none;
  background: #DEE2E6;
  outline: none;
  border-radius: 2px;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--primary-color);
    cursor: pointer;
  }
`;

const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Card = styled.div`
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #E9ECEF;
  font-weight: 500;
`;

const CardBody = styled.div`
  padding: 1rem;
`;

const ViewersList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ViewerItem = styled.li`
  padding: 0.5rem 0;
  border-bottom: 1px solid #E9ECEF;
  
  &:last-child {
    border-bottom: none;
  }
`;

const FileUploadSection = styled.div`
  padding: 1.5rem;
  border: 2px dashed #DEE2E6;
  border-radius: var(--border-radius);
  text-align: center;
`;

const UploadInput = styled.input`
  display: none;
`;

const UploadLabel = styled.label`
  cursor: pointer;
  display: block;
  margin-bottom: 1rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 0.5rem;
  background-color: #E9ECEF;
  border-radius: 0.25rem;
  margin: 1rem 0;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background-color: var(--primary-color);
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const ChatSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  max-height: 400px;
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
`;

const ChatMessage = styled.div`
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const MessageSender = styled.span`
  font-weight: 500;
  margin-right: 0.5rem;
`;

const MessageTime = styled.span`
  font-size: 0.75rem;
  color: var(--dark-grey);
`;

const MessageContent = styled.p`
  margin: 0.25rem 0 0 0;
`;

const ChatForm = styled.form`
  display: flex;
  padding: 1rem;
  border-top: 1px solid #E9ECEF;
  gap: 0.5rem;
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--grey-color);
  border-radius: var(--border-radius);
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  return [
    h > 0 ? h : null,
    h > 0 ? (m < 10 ? '0' + m : m) : m,
    s < 10 ? '0' + s : s
  ].filter(Boolean).join(':');
}

function Room() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get user name from location state or set default
  const userName = location.state?.userName || 'Anonymous';
  
  // References
  const videoRef = useRef(null);
  const socketRef = useRef(null);
  const isPlayingRef = useRef(false);
  const isSeeking = useRef(false);
  const ignoreNextPlayEvent = useRef(false);
  const ignorePauseEvent = useRef(false);
  
  // State
  const [room, setRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewers, setViewers] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  
  // Initialize socket connection and join room
  useEffect(() => {
    socketRef.current = io();
    
    socketRef.current.on('connect', () => {
      console.log('Connected to server');
      
      // Join the room
      socketRef.current.emit('joinRoom', { roomId, userName });
    });
    
    socketRef.current.on('roomState', (roomData) => {
      setRoom(roomData);
      setViewers(roomData.viewers);
      setIsLoading(false);
    });
    
    socketRef.current.on('userJoined', (user) => {
      setViewers(prev => [...prev, user]);
    });
    
    socketRef.current.on('userLeft', (user) => {
      setViewers(prev => prev.filter(v => v.id !== user.id));
    });
    
    socketRef.current.on('videoUpdated', (videoInfo) => {
      setRoom(prev => ({ ...prev, videoInfo }));
    });
    
    socketRef.current.on('error', (err) => {
      setError(err.message);
      setIsLoading(false);
    });
    
    socketRef.current.on('newChatMessage', (message) => {
      setChatMessages(prev => [...prev, message]);
      
      // Scroll to bottom of chat
      setTimeout(() => {
        const chatContainer = document.querySelector('#chat-messages');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);
    });
    
    // Playback control handling
    socketRef.current.on('playbackUpdate', (data) => {
      if (!videoRef.current) return;
      
      // Ignore if this client initiated the event
      if (data.initiator === socketRef.current.id) return;
      
      console.log('Received playback update:', data);
      
      // Handle seek
      if (Math.abs(videoRef.current.currentTime - data.currentTime) > 1) {
        videoRef.current.currentTime = data.currentTime;
      }
      
      // Handle play/pause
      if (data.isPlaying && videoRef.current.paused) {
        ignoreNextPlayEvent.current = true;
        videoRef.current.play().catch(err => console.error('Error playing video:', err));
      } else if (!data.isPlaying && !videoRef.current.paused) {
        ignorePauseEvent.current = true;
        videoRef.current.pause();
      }
    });
    
    // Cleanup on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId, userName]);
  
  // Video event handlers
  useEffect(() => {
    if (!videoRef.current || !room?.videoInfo) return;
    
    const videoElement = videoRef.current;
    
    const handlePlay = () => {
      if (ignoreNextPlayEvent.current) {
        ignoreNextPlayEvent.current = false;
        return;
      }
      
      isPlayingRef.current = true;
      socketRef.current.emit('playbackControl', {
        roomId,
        action: 'play',
        currentTime: videoElement.currentTime
      });
    };
    
    const handlePause = () => {
      if (ignorePauseEvent.current) {
        ignorePauseEvent.current = false;
        return;
      }
      
      isPlayingRef.current = false;
      socketRef.current.emit('playbackControl', {
        roomId,
        action: 'pause',
        currentTime: videoElement.currentTime
      });
    };
    
    const handleTimeUpdate = () => {
      if (!isSeeking.current) {
        setCurrentTime(videoElement.currentTime);
      }
    };
    
    const handleDurationChange = () => {
      setDuration(videoElement.duration);
    };
    
    const handleEnded = () => {
      isPlayingRef.current = false;
    };
    
    // Add event listeners
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('durationchange', handleDurationChange);
    videoElement.addEventListener('ended', handleEnded);
    
    // Cleanup
    return () => {
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('durationchange', handleDurationChange);
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, [roomId, room?.videoInfo]);
  
  // Handle seek bar change
  const handleSeekBarChange = (e) => {
    if (!videoRef.current) return;
    
    const seekTime = parseFloat(e.target.value);
    isSeeking.current = true;
    
    // Update local state
    setCurrentTime(seekTime);
    
    // Set video time
    videoRef.current.currentTime = seekTime;
    
    // Notify others about seek
    socketRef.current.emit('playbackControl', {
      roomId,
      action: 'seek',
      currentTime: seekTime
    });
    
    isSeeking.current = false;
  };
  
  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!validTypes.includes(file.type)) {
      alert('Only MP4, WebM, and OGG video formats are supported');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append('video', file);
    
    try {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setIsUploading(false);
          setRoom(prev => ({ ...prev, videoInfo: response.videoInfo }));
        } else {
          setIsUploading(false);
          alert('Upload failed');
        }
      });
      
      xhr.addEventListener('error', () => {
        setIsUploading(false);
        alert('Upload failed');
      });
      
      xhr.open('POST', `/api/rooms/${roomId}/upload`);
      xhr.send(formData);
      
    } catch (error) {
      console.error('Error uploading file:', error);
      setIsUploading(false);
      alert('Failed to upload video');
    }
  };
  
  // Handle chat message submit
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!messageInput.trim()) return;
    
    socketRef.current.emit('chatMessage', {
      roomId,
      message: messageInput.trim(),
      sender: userName
    });
    
    setMessageInput('');
  };
  
  // Handle play/pause button click
  const handlePlayPause = () => {
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };
  
  if (isLoading) {
    return (
      <div className="container">
        <RoomContainer>
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <h2>Joining room...</h2>
          </div>
        </RoomContainer>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container">
        <RoomContainer>
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <h2>Error</h2>
            <p>{error}</p>
            <button 
              onClick={() => navigate('/')} 
              className="btn btn-primary"
              style={{ marginTop: '1rem' }}
            >
              Go Home
            </button>
          </div>
        </RoomContainer>
      </div>
    );
  }
  
  return (
    <div className="container">
      <RoomContainer>
        <RoomHeader>
          <RoomTitle>
            Watch Room <RoomId>#{roomId}</RoomId>
          </RoomTitle>
        </RoomHeader>
        
        <RoomMain>
          <VideoSection>
            <VideoContainer>
              {room.videoInfo ? (
                <video 
                  ref={videoRef}
                  src={room.videoInfo.path}
                  controls={false}
                  playsInline
                />
              ) : (
                <VideoPlaceholder>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16 13H13V16C13 16.55 12.55 17 12 17C11.45 17 11 16.55 11 16V13H8C7.45 13 7 12.55 7 12C7 11.45 7.45 11 8 11H11V8C11 7.45 11.45 7 12 7C12.55 7 13 7.45 13 8V11H16C16.55 11 17 11.45 17 12C17 12.55 16.55 13 16 13Z" fill="white" fillOpacity="0.5"/>
                  </svg>
                  <h3 style={{ marginTop: '1rem' }}>No video uploaded yet</h3>
                  <p>Upload a video to start watching together</p>
                </VideoPlaceholder>
              )}
            </VideoContainer>
            
            {room.videoInfo && (
              <VideoControls>
                <ControlButton onClick={handlePlayPause}>
                  {videoRef.current?.paused ? '▶' : '⏸️'}
                </ControlButton>
                
                <TimeDisplay>{formatTime(currentTime)}</TimeDisplay>
                
                <SeekBar 
                  min={0} 
                  max={duration} 
                  value={currentTime}
                  onChange={handleSeekBarChange}
                />
                
                <TimeDisplay>{formatTime(duration)}</TimeDisplay>
              </VideoControls>
            )}
          </VideoSection>
          
          <SidePanel>
            <Card>
              <CardHeader>Upload Video</CardHeader>
              <CardBody>
                <FileUploadSection>
                  <UploadInput
                    id="video-upload"
                    type="file"
                    accept="video/mp4,video/webm,video/ogg"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  <UploadLabel htmlFor="video-upload">
                    {isUploading ? 
                      'Uploading...' : 
                      room.videoInfo ? 
                        'Change video' : 
                        'Click to upload video'
                    }
                  </UploadLabel>
                  
                  {room.videoInfo && !isUploading && (
                    <div>
                      <p style={{ marginBottom: '0.5rem', fontWeight: '500' }}>Current video:</p>
                      <p style={{ fontSize: '0.9rem' }}>{room.videoInfo.originalName}</p>
                    </div>
                  )}
                  
                  {isUploading && (
                    <div>
                      <ProgressBar>
                        <ProgressFill progress={uploadProgress} />
                      </ProgressBar>
                      <div>{uploadProgress}%</div>
                    </div>
                  )}
                </FileUploadSection>
              </CardBody>
            </Card>
            
            <Card>
              <CardHeader>Viewers ({viewers.length})</CardHeader>
              <CardBody>
                <ViewersList>
                  {viewers.length === 0 ? (
                    <div>No viewers connected</div>
                  ) : (
                    viewers.map(viewer => (
                      <ViewerItem key={viewer.id}>
                        {viewer.name} {viewer.id === socketRef.current?.id && '(You)'}
                      </ViewerItem>
                    ))
                  )}
                </ViewersList>
              </CardBody>
            </Card>
            
            <Card style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <CardHeader>Chat</CardHeader>
              <ChatSection>
                <ChatMessages id="chat-messages">
                  {chatMessages.length === 0 ? (
                    <div>No messages yet</div>
                  ) : (
                    chatMessages.map(msg => (
                      <ChatMessage key={msg.id}>
                        <div>
                          <MessageSender>
                            {msg.sender} {msg.sender === userName && '(You)'}
                          </MessageSender>
                          <MessageTime>
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </MessageTime>
                        </div>
                        <MessageContent>{msg.message}</MessageContent>
                      </ChatMessage>
                    ))
                  )}
                </ChatMessages>
                
                <ChatForm onSubmit={handleSendMessage}>
                  <ChatInput
                    type="text"
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary">
                    Send
                  </button>
                </ChatForm>
              </ChatSection>
            </Card>
          </SidePanel>
        </RoomMain>
      </RoomContainer>
    </div>
  );
}

export default Room; 