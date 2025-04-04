import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { motion } from 'framer-motion';
import { FaRocket, FaSatellite, FaGlobeAsia, FaUpload, FaUsers, FaComments, FaPaperPlane, FaPlay, FaPause, FaCompress, FaExpand, FaVolumeUp, FaVolumeDown, FaVolumeMute, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import Cookies from 'js-cookie';

// 导入自定义组件
import VideoPlayer from '../components/Room/VideoPlayer';
import ChatSection from '../components/Room/ChatSection';
import FileUploader from '../components/Room/FileUploader';
import UserNameEditor from '../components/Room/UserNameEditor';
import ViewersList from '../components/Room/ViewersList';
import { 
  RoomContainer, 
  RoomHeader, 
  RoomTitle, 
  RoomId, 
  RoomMain,
  StarsBackground,
  Star,
  ControlPanel
} from '../components/Room/RoomStyles';

const Room = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // 获取用户名，优先从cookie中获取，其次是路由状态，最后默认值
  const getRoomUserName = () => {
    // 从cookie中获取用户名，格式为"roomId_user"
    const cookieKey = `chillsync_room_${roomId}_user`;
    const savedUserName = Cookies.get(cookieKey);
    
    // 如果cookie中有保存的用户名，优先使用
    if (savedUserName) {
      return savedUserName;
    }
    
    // 其次使用location state中的用户名
    if (location.state?.userName) {
      // 将用户名保存到cookie中，有效期7天
      Cookies.set(cookieKey, location.state.userName, { expires: 7 });
      return location.state.userName;
    }
    
    // 最后使用默认值
    return 'Explorer';
  };
  
  // 使用函数获取初始用户名
  const [userName, setUserName] = useState(getRoomUserName);
  
  // References
  const videoRef = useRef(null);
  const socketRef = useRef(null);
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // 添加标志变量，防止事件循环
  const isRemoteActionRef = useRef(false);
  
  // 生成背景星星
  const randomStars = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2
  }));
  
  // 初始化socket连接和加入房间
  useEffect(() => {
    socketRef.current = io();
    
    socketRef.current.on('connect', () => {
      console.log('Connected to server');
      
      // 生成或获取visitorId
      let visitorId = localStorage.getItem('chillsync_visitor_id');
      if (!visitorId) {
        visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('chillsync_visitor_id', visitorId);
      }
      
      // 加入房间时发送用户名和visitorId
      socketRef.current.emit('joinRoom', { roomId, userName, visitorId });
    });
    
    socketRef.current.on('roomState', (roomData) => {
      setRoom(roomData);
      setViewers(roomData.viewers);
      
      // 初始化聊天记录历史
      if (roomData.chatMessages && roomData.chatMessages.length > 0) {
        setChatMessages(roomData.chatMessages);
        
        // 滚动到聊天记录底部
        setTimeout(() => {
          const chatContainer = document.querySelector('#chat-messages');
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        }, 100);
      }
      
      setIsLoading(false);
    });
    
    socketRef.current.on('userJoined', (user) => {
      setViewers(prev => [...prev, user]);
    });
    
    socketRef.current.on('userLeft', (user) => {
      setViewers(prev => prev.filter(v => v.id !== user.id));
    });
    
    // 处理用户名变更事件
    socketRef.current.on('userNameChanged', ({ socketId, oldName, newName }) => {
      // 更新viewers列表中的用户名
      setViewers(prevViewers => 
        prevViewers.map(viewer => 
          viewer.id === socketId ? { ...viewer, name: newName } : viewer
        )
      );
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
      
      // Handle play/pause with explicit state updates
      if (data.isPlaying && videoRef.current.paused) {
        setIsPlaying(true);
        // 设置标志为远程操作
        isRemoteActionRef.current = true;
        videoRef.current.play()
          .catch(err => console.error('Error playing video:', err))
          .finally(() => {
            // 操作完成后将标志重置
            setTimeout(() => {
              isRemoteActionRef.current = false;
            }, 50);
          });
      } else if (!data.isPlaying && !videoRef.current.paused) {
        setIsPlaying(false);
        // 设置标志为远程操作
        isRemoteActionRef.current = true;
        videoRef.current.pause();
        // 操作完成后将标志重置
        setTimeout(() => {
          isRemoteActionRef.current = false;
        }, 50);
      }
    });
    
    // 清理组件卸载
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId, userName]);
  
  // 视频事件处理
  useEffect(() => {
    if (!videoRef.current || !room?.videoInfo || !socketRef.current) return;
    
    const videoElement = videoRef.current;
    
    const handlePlay = () => {
      // 更新本地状态
      setIsPlaying(true);
      
      // 如果是远程操作触发的播放事件，不要再发送socket事件
      if (isRemoteActionRef.current) return;
      
      // 广播到其他客户端
      socketRef.current.emit('playbackControl', {
        roomId,
        action: 'play',
        currentTime: videoElement.currentTime,
        isPlaying: true
      });
    };
    
    const handlePause = () => {
      // 更新本地状态
      setIsPlaying(false);
      
      // 如果是远程操作触发的暂停事件，不要再发送socket事件
      if (isRemoteActionRef.current) return;
      
      // 广播到其他客户端
      socketRef.current.emit('playbackControl', {
        roomId,
        action: 'pause',
        currentTime: videoElement.currentTime,
        isPlaying: false
      });
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
    };
    
    const handleDurationChange = () => {
      setDuration(videoElement.duration);
    };
    
    const handleEnded = () => {
      // 只更新本地状态
      setIsPlaying(false);
    };
    
    // 添加事件监听
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('durationchange', handleDurationChange);
    videoElement.addEventListener('ended', handleEnded);
    
    // 清理
    return () => {
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('durationchange', handleDurationChange);
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, [roomId, room?.videoInfo]);
  
  // 添加同步功能
  useEffect(() => {
    if (!socketRef.current || !videoRef.current || !room?.videoInfo) return;
    
    // 添加同步响应处理程序
    const handleSyncPlayback = (playbackState) => {
      if (!videoRef.current) return;
      
      console.log('Synchronizing playback state:', playbackState);
      
      // 设置当前时间
      if (Math.abs(videoRef.current.currentTime - playbackState.currentTime) > 1) {
        videoRef.current.currentTime = playbackState.currentTime;
      }
      
      // 设置播放/暂停状态
      if (playbackState.isPlaying && videoRef.current.paused) {
        setIsPlaying(true);
        // 设置标志为远程操作
        isRemoteActionRef.current = true;
        videoRef.current.play()
          .catch(err => console.error('Error playing video during sync:', err))
          .finally(() => {
            // 操作完成后将标志重置
            setTimeout(() => {
              isRemoteActionRef.current = false;
            }, 50);
          });
      } else if (!playbackState.isPlaying && !videoRef.current.paused) {
        setIsPlaying(false);
        // 设置标志为远程操作
        isRemoteActionRef.current = true;
        videoRef.current.pause();
        // 操作完成后将标志重置
        setTimeout(() => {
          isRemoteActionRef.current = false;
        }, 50);
      }
    };
    
    socketRef.current.on('syncPlayback', handleSyncPlayback);
    
    // 视频加载时请求同步
    const handleCanPlay = () => {
      socketRef.current.emit('requestSync', { roomId });
    };
    
    videoRef.current.addEventListener('canplay', handleCanPlay);
    
    // 初始同步请求
    socketRef.current.emit('requestSync', { roomId });
    
    return () => {
      socketRef.current.off('syncPlayback');
      if (videoRef.current) {
        videoRef.current.removeEventListener('canplay', handleCanPlay);
      }
    };
  }, [roomId, room?.videoInfo, socketRef.current]);
  
  // 添加聊天时间戳刷新定时器
  useEffect(() => {
    // 创建刷新定时器
    const timeUpdateInterval = setInterval(() => {
      // 强制重新渲染以更新相对时间戳
      setChatMessages(prevMessages => [...prevMessages]);
    }, 60000); // 每分钟更新一次
    
    // 清理
    return () => clearInterval(timeUpdateInterval);
  }, []);
  
  // 处理聊天消息提交
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
          <div>
            <RoomTitle>
              <FaGlobeAsia className="text-space-star" />
              {room.name || "Planet Explorer"} <RoomId>#{roomId}</RoomId>
            </RoomTitle>
            <div className="text-sm text-slate-400 mt-1 flex items-center gap-2">
              <FaSatellite className="text-space-star text-xs" />
              <span>{room.theme || "General"}</span>
              <span className="mx-2">·</span>
              
              {/* 用户名编辑组件 */}
              <UserNameEditor 
                userName={userName} 
                setUserName={setUserName} 
                roomId={roomId} 
                socketRef={socketRef} 
                setViewers={setViewers} 
                setChatMessages={setChatMessages}
              />
            </div>
          </div>
          
          <div className="flex gap-2 items-center">
            {/* 观众列表组件 */}
            <ViewersList viewers={viewers} socketRef={socketRef} />
          </div>
        </RoomHeader>
        
        <RoomMain>
          {/* 视频播放器组件 */}
          <VideoPlayer 
            videoInfo={room.videoInfo}
            socketRef={socketRef}
            roomId={roomId}
            videoRef={videoRef}
            videoContainerRef={videoContainerRef}
            currentTime={currentTime}
            duration={duration}
            isPlaying={isPlaying}
            volume={volume}
            isFullscreen={isFullscreen}
            setCurrentTime={setCurrentTime}
            setIsPlaying={setIsPlaying}
            setVolume={setVolume}
            setIsFullscreen={setIsFullscreen}
          />
          
          <ControlPanel>
            {/* 文件上传组件 */}
            <FileUploader 
              roomId={roomId}
              room={room}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              setIsUploading={setIsUploading}
              setUploadProgress={setUploadProgress}
              setRoom={setRoom}
            />
            
            {/* 聊天组件 */}
            <ChatSection 
              chatMessages={chatMessages} 
              messageInput={messageInput} 
              userName={userName} 
              setMessageInput={setMessageInput} 
              handleSendMessage={handleSendMessage}
              iconElement={<FaComments />}
            />
          </ControlPanel>
        </RoomMain>
      </RoomContainer>
    </div>
  );
}

export default Room; 