import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import io from 'socket.io-client';
import { motion } from 'framer-motion';
import { FaRocket, FaSatellite, FaGlobeAsia, FaUpload, FaUsers, FaComments, FaPaperPlane, FaPlay, FaPause, FaCompress, FaExpand, FaVolumeUp, FaVolumeDown, FaVolumeMute } from 'react-icons/fa';

const RoomContainer = styled.div`
  padding: 2rem 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const StarsBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: -1;
`;

const Star = styled(motion.div)`
  position: absolute;
  background-color: var(--space-star, #fef08a);
  border-radius: 50%;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RoomId = styled.span`
  font-size: 1rem;
  font-weight: normal;
  color: var(--space-star, #fef08a);
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
  background-color: rgba(13, 17, 23, 0.7);
  border-radius: var(--border-radius);
  box-shadow: 0 0 25px rgba(254, 240, 138, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(254, 240, 138, 0.15);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 0 30px rgba(254, 240, 138, 0.2);
  }
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

const VideoPlayerControls = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.75rem 1rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.4) 60%, transparent);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 10;
  
  ${VideoContainer}:hover & {
    opacity: 1;
  }
  
  // Always show controls on touch devices
  @media (max-width: 768px) {
    opacity: 1;
    padding: 0.5rem;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.7) 80%, rgba(0, 0, 0, 0.4));
  }
`;

const ControlsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  @media (max-width: 576px) {
    gap: 0.25rem;
  }
`;

const TimeDisplay = styled.div`
  font-family: monospace;
  font-size: 0.875rem;
  color: var(--space-star, #fef08a);
  opacity: 0.9;
  background: rgba(13, 17, 23, 0.5);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: rgba(13, 17, 23, 0.7);
  }
  
  @media (max-width: 576px) {
    font-size: 0.75rem;
    padding: 0.15rem 0.35rem;
  }
`;

const SeekBar = styled.input.attrs({ type: 'range' })`
  flex: 1;
  height: 6px;
  appearance: none;
  background: rgba(222, 226, 230, 0.3);
  outline: none;
  border-radius: 3px;
  cursor: pointer;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--space-star, #fef08a);
    cursor: pointer;
    box-shadow: 0 0 5px rgba(254, 240, 138, 0.8);
  }
  
  &::-webkit-slider-runnable-track {
    height: 6px;
    border-radius: 3px;
  }
  
  &:hover {
    &::-webkit-slider-thumb {
      transform: scale(1.1);
      box-shadow: 0 0 8px rgba(254, 240, 138, 0.9);
    }
  }
`;

const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Card = styled.div`
  background-color: rgba(13, 17, 23, 0.7);
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(254, 240, 138, 0.1);
  overflow: hidden;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(254, 240, 138, 0.15);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 0 25px rgba(254, 240, 138, 0.15);
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid rgba(254, 240, 138, 0.1);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--space-star, #fef08a);
`;

const CardBody = styled.div`
  padding: 1rem;
`;

const ViewersList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ViewerItem = styled.li`
  padding: 0.75rem;
  border-radius: 8px;
  background-color: rgba(20, 25, 35, 0.5);
  border: 1px solid rgba(254, 240, 138, 0.1);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: rgba(30, 35, 45, 0.5);
    border-color: rgba(254, 240, 138, 0.2);
  }
  
  &::before {
    content: '';
    display: block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #10b981;
    margin-right: 0.5rem;
  }
`;

const FileUploadSection = styled.div`
  padding: 1.5rem;
  border: 2px dashed rgba(254, 240, 138, 0.3);
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s ease;
  background-color: rgba(20, 25, 35, 0.3);
  
  &:hover {
    border-color: var(--space-star, #fef08a);
    box-shadow: 0 0 15px rgba(254, 240, 138, 0.2) inset;
  }
`;

const UploadInput = styled.input`
  display: none;
`;

const UploadLabel = styled.label`
  cursor: pointer;
  display: block;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  color: #fff;
  
  &:hover {
    color: var(--space-star, #fef08a);
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 5px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2.5px;
  cursor: pointer;
  position: relative;
  margin-bottom: 0.5rem;
  
  &:hover {
    height: 8px;
    border-radius: 4px;
    
    &::before {
      transform: scale(1.2);
    }
  }
  
  &::before {
    content: '';
    position: absolute;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--space-star, #fef08a);
    top: 50%;
    left: ${props => props.progress || 0}%;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 5px rgba(254, 240, 138, 0.8);
    transition: transform 0.2s ease;
    z-index: 2;
  }
  
  &::after {
    content: '';
    position: absolute;
    height: 100%;
    width: ${props => props.progress || 0}%;
    background: var(--space-star, #fef08a);
    background-image: linear-gradient(to right, rgba(254, 240, 138, 0.8), rgba(254, 240, 138, 1));
    border-radius: inherit;
    z-index: 1;
  }
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.progress}%;
  background-color: var(--space-star, #fef08a);
  background-image: linear-gradient(to right, rgba(254, 240, 138, 0.8), rgba(254, 240, 138, 1));
  border-radius: 0.25rem;
  transition: width 0.3s ease;
`;

const ChatSection = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  max-height: 250px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(20, 25, 35, 0.3);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(254, 240, 138, 0.3);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(254, 240, 138, 0.5);
  }
`;

const ChatMessage = styled.div`
  padding: 0.75rem;
  border-radius: 8px;
  background-color: rgba(20, 25, 35, 0.5);
  border: 1px solid rgba(254, 240, 138, 0.1);
  transition: all 0.2s ease;
  
  &:hover {
    border-color: rgba(254, 240, 138, 0.25);
    background-color: rgba(30, 35, 45, 0.5);
  }
`;

const MessageSender = styled.span`
  font-weight: 500;
  margin-right: 0.5rem;
  color: var(--space-star, #fef08a);
`;

const MessageTime = styled.span`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  margin-left: auto;
  white-space: nowrap;
`;

const MessageContent = styled.div`
  margin-top: 0.5rem;
  line-height: 1.4;
`;

const ChatForm = styled.form`
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  border-top: 1px solid rgba(254, 240, 138, 0.1);
  background-color: rgba(13, 17, 23, 0.5);
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(254, 240, 138, 0.2);
  border-radius: 8px;
  background-color: rgba(13, 17, 23, 0.7);
  color: #fff;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: var(--space-star, #fef08a);
    outline: none;
    box-shadow: 0 0 10px rgba(254, 240, 138, 0.2);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

// Add a component for the seek bar tooltip
const SeekTooltip = styled.div`
  position: absolute;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.8);
  color: var(--space-star, #fef08a);
  border-radius: 4px;
  font-size: 0.75rem;
  pointer-events: none;
  transform: translateX(-50%) translateY(-100%);
  margin-top: -8px;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 10;
  white-space: nowrap;
  
  ${props => props.isVisible && `
    opacity: 1;
  `}
`;

// Add missing VolumeControl component
const VolumeControl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 120px;
  
  @media (max-width: 768px) {
    width: 100px;
  }
  
  @media (max-width: 576px) {
    width: 32px;
    
    // Hide slider on small screens, only show mute button
    input {
      display: none;
    }
  }
`;

const VolumeSlider = styled.input.attrs({ type: 'range' })`
  flex: 1;
  height: 4px;
  appearance: none;
  background: rgba(222, 226, 230, 0.3);
  outline: none;
  border-radius: 2px;
  cursor: pointer;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--space-star, #fef08a);
    cursor: pointer;
    box-shadow: 0 0 5px rgba(254, 240, 138, 0.8);
  }
  
  &::-webkit-slider-runnable-track {
    height: 4px;
    border-radius: 2px;
  }
  
  &:hover {
    &::-webkit-slider-thumb {
      transform: scale(1.1);
      box-shadow: 0 0 8px rgba(254, 240, 138, 0.9);
    }
  }
`;

// Control button style
const ControlButton = styled(motion.button)`
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  transition: all 0.2s ease;
  border-radius: 50%;
  
  &:hover {
    opacity: 1;
    background: rgba(254, 240, 138, 0.15);
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  return [
    h > 0 ? h : null,
    h > 0 ? (m < 10 ? '0' + m : m) : m,
    s < 10 ? '0' + s : s
  ].filter(Boolean).join(':');
}

// Add a new function for formatting chat message times in a user-friendly way
function formatChatTime(timestamp) {
  if (!timestamp) return '';
  
  const messageDate = new Date(timestamp);
  const now = new Date();
  
  // Calculate difference in seconds
  const diffInSeconds = Math.floor((now - messageDate) / 1000);
  
  // Just now: less than 1 minute ago
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  // X minutes ago: less than 1 hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'min' : 'mins'} ago`;
  }
  
  // Today: show time only
  if (messageDate.toDateString() === now.toDateString()) {
    return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Yesterday: show "Yesterday" + time
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (messageDate.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // Older: show date + time
  return messageDate.toLocaleDateString([], { 
    month: 'short', 
    day: 'numeric'
  }) + ', ' + messageDate.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
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
  const videoContainerRef = useRef(null);
  
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
  const [seekTooltip, setSeekTooltip] = useState({ visible: false, time: 0, position: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Generate stars for background
  const randomStars = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2
  }));
  
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
      
      setIsPlaying(true);
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
      
      setIsPlaying(false);
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
      setIsPlaying(false);
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
      videoRef.current.play().catch(err => {
        console.error('Error playing video:', err);
      });
    } else {
      videoRef.current.pause();
    }
  };
  
  const handleSeekTo = (seekTime) => {
    if (!videoRef.current) return;
    
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
  
  // Add an interval to refresh chat message timestamps every minute
  useEffect(() => {
    // Create a refresh interval
    const timeUpdateInterval = setInterval(() => {
      // Force a re-render to update relative timestamps
      setChatMessages(prevMessages => [...prevMessages]);
    }, 60000); // Update every minute
    
    // Clean up on unmount
    return () => clearInterval(timeUpdateInterval);
  }, []);
  
  // Add the function to handle seek bar hover
  const handleSeekBarHover = (e) => {
    if (!videoRef.current || !duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    const hoverTime = position * duration;
    
    setSeekTooltip({
      visible: true,
      time: hoverTime,
      position: e.clientX - rect.left
    });
  };
  
  // Handle volume change
  const handleVolumeChange = (e) => {
    if (!videoRef.current) return;
    
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
  };
  
  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };
  
  // Add effect to detect fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Handle mute toggle
  const toggleMute = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !videoRef.current.muted;
    setVolume(videoRef.current.muted ? 0 : 1);
  };
  
  // Fix the getVolumeIcon function
  const getVolumeIcon = () => {
    if (videoRef.current?.muted || volume === 0) {
      return <FaVolumeMute />;
    } else if (volume < 0.5) {
      return <FaVolumeDown />;
    } else {
      return <FaVolumeUp />;
    }
  };
  
  if (isLoading) {
    return (
      <div className="container">
        <RoomContainer>
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <h2 className="text-space-star">Launching to Planet...</h2>
            <FaRocket className="text-4xl text-space-star animate-pulse mt-4" />
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
            <h2 className="text-space-mars">Exploration Failed</h2>
            <p>{error}</p>
            <button 
              onClick={() => navigate('/')} 
              className="btn btn-primary"
              style={{ marginTop: '1rem' }}
            >
              Return to Base
            </button>
          </div>
        </RoomContainer>
      </div>
    );
  }
  
  return (
    <div className="container">
      <RoomContainer>
        <StarsBackground>
          {randomStars.map(star => (
            <Star
              key={star.id}
              style={{ 
                width: `${star.size}px`, 
                height: `${star.size}px`,
                top: star.top,
                left: star.left,
              }}
              animate={{ 
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.3, 1],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: star.duration,
                delay: star.delay,
                ease: "easeInOut" 
              }}
            />
          ))}
        </StarsBackground>

        <RoomHeader>
          <RoomTitle>
            <FaGlobeAsia className="text-space-star" />
            Planet Explorer <RoomId>#{roomId}</RoomId>
          </RoomTitle>
        </RoomHeader>
        
        <RoomMain>
          <VideoSection>
            <VideoContainer ref={videoContainerRef}>
              {room.videoInfo ? (
                <>
                  <video 
                    ref={videoRef}
                    src={room.videoInfo.path}
                    controls={false}
                    playsInline
                    onClick={handlePlayPause}
                  />
                  
                  <VideoPlayerControls>
                    <div style={{ position: 'relative', width: '100%' }}>
                      <ProgressBar 
                        progress={(currentTime / duration) * 100 || 0}
                        onClick={(e) => {
                          if (!videoRef.current || !duration) return;
                          const rect = e.currentTarget.getBoundingClientRect();
                          const position = (e.clientX - rect.left) / rect.width;
                          const seekTime = position * duration;
                          handleSeekTo(seekTime);
                        }}
                        onMouseMove={handleSeekBarHover}
                        onMouseLeave={() => setSeekTooltip({ ...seekTooltip, visible: false })}
                      />
                      {duration > 0 && (
                        <SeekTooltip 
                          isVisible={seekTooltip.visible} 
                          style={{ left: `${seekTooltip.position}px` }}
                        >
                          {formatTime(seekTooltip.time)}
                        </SeekTooltip>
                      )}
                    </div>
                    
                    <ControlsRow>
                      <ControlButton 
                        onClick={handlePlayPause}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {isPlaying ? <FaPause /> : <FaPlay />}
                      </ControlButton>
                      
                      <TimeDisplay>
                        <span>{formatTime(currentTime || 0)}</span>
                        <span className="opacity-50 mx-1">/</span>
                        <span>{formatTime(duration || 0)}</span>
                      </TimeDisplay>
                      
                      <VolumeControl>
                        <ControlButton 
                          onClick={toggleMute}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {getVolumeIcon()}
                        </ControlButton>
                        <VolumeSlider 
                          min={0} 
                          max={1} 
                          step={0.01}
                          value={volume}
                          onChange={handleVolumeChange}
                        />
                      </VolumeControl>
                      
                      <div className="flex-1"></div>
                      
                      <ControlButton 
                        onClick={toggleFullscreen}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {isFullscreen ? <FaCompress /> : <FaExpand />}
                      </ControlButton>
                    </ControlsRow>
                  </VideoPlayerControls>
                </>
              ) : (
                <VideoPlaceholder>
                  <motion.div
                    animate={{ 
                      opacity: [0.6, 1, 0.6],
                      scale: [0.98, 1.02, 0.98],
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 3,
                      ease: "easeInOut" 
                    }}
                  >
                    <FaSatellite className="text-space-star" style={{ fontSize: '64px', opacity: 0.8 }} />
                  </motion.div>
                  <motion.h3 
                    style={{ marginTop: '1rem' }}
                    animate={{ opacity: [0.8, 1, 0.8] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  >
                    No transmission signal yet
                  </motion.h3>
                  <p className="mt-2 text-gray-400">Upload a video to start exploring together</p>
                </VideoPlaceholder>
              )}
            </VideoContainer>
          </VideoSection>
          
          <SidePanel>
            <Card>
              <CardHeader>
                <FaUpload />
                Transmission Upload
              </CardHeader>
              <CardBody>
                <FileUploadSection>
                  <UploadInput
                    id="video-upload"
                    type="file"
                    accept="video/mp4,video/webm,video/ogg"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <UploadLabel htmlFor="video-upload" className="flex items-center justify-center gap-2">
                      <FaUpload className="mr-1" />
                      {isUploading ? 
                        'Beaming transmission...' : 
                        room.videoInfo ? 
                          'Change transmission' : 
                          'Click to upload transmission'
                      }
                    </UploadLabel>
                  </motion.div>
                  
                  {room.videoInfo && !isUploading && (
                    <div className="mt-3 p-3 rounded-lg bg-gray-800/30 border border-space-star/10">
                      <p style={{ marginBottom: '0.5rem', fontWeight: '500' }} className="text-space-star/80">Current transmission:</p>
                      <p style={{ fontSize: '0.9rem' }} className="truncate">{room.videoInfo.originalName}</p>
                    </div>
                  )}
                  
                  {isUploading && (
                    <div className="mt-3">
                      <ProgressBar>
                        <ProgressFill progress={uploadProgress} />
                      </ProgressBar>
                      <div className="text-space-star">{uploadProgress}%</div>
                    </div>
                  )}
                </FileUploadSection>
              </CardBody>
            </Card>
            
            <Card>
              <CardHeader>
                <FaUsers />
                Explorers ({viewers.length})
              </CardHeader>
              <CardBody>
                <ViewersList>
                  {viewers.length === 0 ? (
                    <div className="text-center p-3 text-gray-400">No explorers connected</div>
                  ) : (
                    viewers.map(viewer => (
                      <ViewerItem key={viewer.id}>
                        {viewer.name} {viewer.id === socketRef.current?.id && (
                          <span className="ml-auto text-xs px-2 py-1 bg-space-star/20 rounded-full text-space-star">You</span>
                        )}
                      </ViewerItem>
                    ))
                  )}
                </ViewersList>
              </CardBody>
            </Card>
            
            <Card style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <CardHeader>
                <FaComments />
                Space Communications
              </CardHeader>
              <ChatSection>
                <ChatMessages id="chat-messages">
                  {chatMessages.length === 0 ? (
                    <div className="text-center p-3 text-gray-400">No communications yet</div>
                  ) : (
                    chatMessages.map(msg => (
                      <ChatMessage key={msg.id} className={msg.sender === userName ? "border-space-star/30 ml-auto max-w-[85%]" : "max-w-[85%]"}>
                        <div className="flex justify-between items-center">
                          <MessageSender>
                            {msg.sender} {msg.sender === userName && '(You)'}
                          </MessageSender>
                          <MessageTime>
                            {formatChatTime(msg.timestamp)}
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
                  <motion.button 
                    type="submit" 
                    className="btn btn-primary flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!messageInput.trim()}
                  >
                    <FaPaperPlane size={12} />
                    Send
                  </motion.button>
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