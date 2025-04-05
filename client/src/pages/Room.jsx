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
  
  const [isWaitingForNewUser, setIsWaitingForNewUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  
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
      
      // 当有新用户加入且当前正在播放视频时，暂停视频
      if (videoRef.current && !videoRef.current.paused && room?.videoInfo) {
        // 只有当当前用户不是房主，才暂停视频
        // 房主是第一个加入房间的用户
        const isHost = socketRef.current.id === room.hostId;
        
        if (isHost) {
          // 暂停视频
          videoRef.current.pause();
          setIsPlaying(false);
          
          // 设置等待状态和新用户名称
          setIsWaitingForNewUser(true);
          setNewUserName(user.name);
          
          // 通知所有客户端暂停视频并等待新用户
          socketRef.current.emit('playbackControl', {
            roomId,
            action: 'pause',
            currentTime: videoRef.current.currentTime,
            isPlaying: false,
            waitingForUser: user.name
          });
          
          // 5秒后恢复播放
          setTimeout(() => {
            if (videoRef.current && videoRef.current.paused) {
              videoRef.current.play().catch(err => console.error('Error resuming playback:', err));
              setIsPlaying(true);
              setIsWaitingForNewUser(false);
              
              // 通知所有客户端恢复播放
              socketRef.current.emit('playbackControl', {
                roomId,
                action: 'play',
                currentTime: videoRef.current.currentTime,
                isPlaying: true
              });
            }
          }, 5000);
        }
      }
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
    
    // 处理播放控制事件
    socketRef.current.on('playbackUpdate', (data) => {
      if (!videoRef.current) return;
      
      // Ignore if this client initiated the event
      if (data.initiator === socketRef.current.id) return;
      
      console.log('Received playback update:', data);
      
      // 处理等待新用户加入的情况
      if (data.waitingForUser) {
        // 设置等待状态
        setIsWaitingForNewUser(true);
        setNewUserName(data.waitingForUser);
      } else {
        // 清除等待状态
        setIsWaitingForNewUser(false);
      }
      
      // 检查是否为iOS设备且处于全屏模式
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      const isIOSFullscreen = isIOS && isFullscreen;
      
      // 如果是iOS设备且处于全屏模式，存储最新进度但不立即应用
      if (isIOSFullscreen) {
        console.log('iOS fullscreen mode - storing sync data for later application');
        // 存储同步数据，等退出全屏时应用
        window.pendingSync = data;
        return;
      }
      
      // 对于非iOS全屏模式，立即应用同步
      try {
        // 防止在视频加载前尝试同步
        if (videoRef.current.readyState === 0) {
          console.log('Video not ready, storing sync data for later');
          window.pendingSync = data;
          return;
        }
        
        // 处理进度同步 (增加容差范围并使阈值更小，以确保细微变化也能得到同步)
        if (Math.abs(videoRef.current.currentTime - data.currentTime) > 0.5) {
          console.log(`Syncing time from ${videoRef.current.currentTime} to ${data.currentTime}`);
          
          // 记录当前的播放状态
          const wasPlaying = !videoRef.current.paused;
          
          // 设置标志为远程操作，防止触发额外的同步事件
          isRemoteActionRef.current = true;
          
          // 更新内部状态以确保进度条UI立即更新
          setCurrentTime(data.currentTime);
          
          // 设置视频元素的当前时间
          videoRef.current.currentTime = data.currentTime;
          
          // 如果是seek操作，保持视频的播放状态
          if (data.action === 'seek') {
            // 如果之前在播放中，确保仍在播放
            if (wasPlaying && videoRef.current.paused) {
              setIsPlaying(true); // 更新React状态
              videoRef.current.play()
                .catch(err => console.error('Error playing after remote seek:', err));
            }
            // 如果之前是暂停的，保持暂停状态
            else if (!wasPlaying && !videoRef.current.paused) {
              setIsPlaying(false); // 更新React状态
              videoRef.current.pause();
            }
          } 
          // 否则依照data中的播放状态
          else if (data.isPlaying !== undefined) {
            if (data.isPlaying && videoRef.current.paused) {
              setIsPlaying(true); // 更新React状态
              videoRef.current.play()
                .catch(err => console.error('Error playing video:', err));
            } else if (!data.isPlaying && !videoRef.current.paused) {
              setIsPlaying(false); // 更新React状态
              videoRef.current.pause();
            }
          }
          
          // 操作完成后将标志重置
          setTimeout(() => {
            isRemoteActionRef.current = false;
          }, 50);
          
          return; // 跳过下面的播放/暂停处理
        }
        
        // 处理播放/暂停状态同步
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
      } catch (error) {
        console.error('Error applying sync data:', error);
        // 出错时存储同步数据以便后续重试
        window.pendingSync = data;
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
      // 只有在不是由远程操作引起的情况下才更新当前时间
      if (!isRemoteActionRef.current) {
        setCurrentTime(videoElement.currentTime);
      }
      
      // 定期发送同步数据，确保所有客户端保持同步
      // 每30秒广播一次当前播放位置，作为额外的同步保障
      const currentSeconds = Math.floor(videoElement.currentTime);
      if (currentSeconds % 30 === 0 && currentSeconds > 0 && !isRemoteActionRef.current) {
        socketRef.current.emit('playbackControl', {
          roomId,
          action: 'timeupdate',
          currentTime: videoElement.currentTime,
          isPlaying: !videoElement.paused
        });
      }
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
      
      // 同步完成时清除等待状态
      setIsWaitingForNewUser(false);
      
      // 处理iOS全屏状态
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIOS && isFullscreen) {
        console.log('iOS in fullscreen - storing sync data');
        window.pendingSync = playbackState;
        return;
      }
      
      // 确保视频已准备好
      if (videoRef.current.readyState === 0) {
        console.log('Video not ready yet, storing sync data');
        window.pendingSync = playbackState;
        
        // 添加一次性监听器，在视频可以播放时应用同步
        const applyPendingSync = () => {
          if (window.pendingSync) {
            console.log('Applying pending sync now that video is ready');
            
            // 记录当前的播放状态
            const wasPlaying = !videoRef.current.paused;
            
            // 应用存储的同步数据
            videoRef.current.currentTime = window.pendingSync.currentTime;
            setCurrentTime(window.pendingSync.currentTime);
            
            // 如果是seek操作，保持原来的播放状态
            if (window.pendingSync.action === 'seek') {
              if (wasPlaying && videoRef.current.paused) {
                videoRef.current.play().catch(err => console.error('Error playing after delayed seek:', err));
              }
            }
            // 否则按照同步数据指定的播放状态
            else if (window.pendingSync.isPlaying !== undefined) {
              if (window.pendingSync.isPlaying && videoRef.current.paused) {
                setIsPlaying(true);
                videoRef.current.play()
                  .catch(err => console.error('Error playing on delayed sync:', err));
              } else if (!window.pendingSync.isPlaying && !videoRef.current.paused) {
                setIsPlaying(false);
                videoRef.current.pause();
              }
            }
            
            window.pendingSync = null;
          }
          
          // 清理一次性监听器
          videoRef.current.removeEventListener('canplay', applyPendingSync);
        };
        
        videoRef.current.addEventListener('canplay', applyPendingSync);
        return;
      }
      
      // 设置当前时间
      if (Math.abs(videoRef.current.currentTime - playbackState.currentTime) > 0.5) {
        // 记录当前播放状态
        const wasPlaying = !videoRef.current.paused;
        
        // 设置标志为远程操作，防止触发额外事件
        isRemoteActionRef.current = true;
        
        // 立即更新UI状态，确保进度条立即响应
        setCurrentTime(playbackState.currentTime);
        videoRef.current.currentTime = playbackState.currentTime;
        
        // 如果是seek操作，保持视频的播放状态
        if (playbackState.action === 'seek') {
          // 如果之前在播放中，确保仍在播放
          if (wasPlaying && videoRef.current.paused) {
            videoRef.current.play()
              .catch(err => console.error('Error playing after sync seek:', err));
          }
          // 如果之前是暂停的，保持暂停状态
        }
        // 否则按照指定的播放状态处理
        else if (playbackState.isPlaying !== undefined) {
          if (playbackState.isPlaying && videoRef.current.paused) {
            setIsPlaying(true);
            videoRef.current.play()
              .catch(err => console.error('Error playing after sync:', err));
          } else if (!playbackState.isPlaying && !videoRef.current.paused) {
            setIsPlaying(false);
            videoRef.current.pause();
          }
        }
        
        // 重置远程操作标志
        setTimeout(() => {
          isRemoteActionRef.current = false;
        }, 50);
        
        return;
      }
    };
    
    socketRef.current.on('syncPlayback', handleSyncPlayback);
    
    // 视频加载时请求同步
    const handleCanPlay = () => {
      // 发送同步请求，同时发送用户名
      socketRef.current.emit('requestSync', { 
        roomId,
        userName
      });
    };
    
    videoRef.current.addEventListener('canplay', handleCanPlay);
    
    // 处理同步请求事件
    socketRef.current.on('syncRequested', (data) => {
      // 如果是自己发出的请求，不处理
      if (data.requester === socketRef.current.id) return;
      
      console.log(`用户 ${data.userName} 请求同步`);
      
      // 如果当前用户是房主（第一个加入的用户）
      const isHost = socketRef.current.id === room.hostId;
      
      if (isHost && videoRef.current) {
        // 设置等待状态
        setIsWaitingForNewUser(true);
        setNewUserName(data.userName);
        
        // 暂停视频
        if (!videoRef.current.paused) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
        
        // 通知所有客户端暂停并等待此用户
        socketRef.current.emit('playbackControl', {
          roomId,
          action: 'pause',
          currentTime: videoRef.current.currentTime,
          isPlaying: false,
          waitingForUser: data.userName
        });
        
        // 2秒后发送当前播放状态给请求者和所有人
        setTimeout(() => {
          // 发送当前播放状态
          socketRef.current.emit('sendSyncData', {
            roomId,
            targetId: data.requester,
            playbackState: {
              currentTime: videoRef.current.currentTime,
              isPlaying: false // 初始同步时先保持暂停
            }
          });
          
          // 3秒后恢复播放并清除等待状态
          setTimeout(() => {
            setIsWaitingForNewUser(false);
            
            // 如果之前是播放状态，则恢复播放
            if (isPlaying) {
              videoRef.current.play()
                .then(() => {
                  setIsPlaying(true);
                  
                  // 通知所有客户端恢复播放
                  socketRef.current.emit('playbackControl', {
                    roomId,
                    action: 'play',
                    currentTime: videoRef.current.currentTime,
                    isPlaying: true
                  });
                })
                .catch(err => console.error('Error resuming playback:', err));
            }
          }, 3000);
        }, 2000);
      }
    });
    
    return () => {
      socketRef.current.off('syncPlayback');
      socketRef.current.off('syncRequested');
      if (videoRef.current) {
        videoRef.current.removeEventListener('canplay', handleCanPlay);
      }
    };
  }, [roomId, room?.videoInfo, socketRef.current]);
  
  // 初始同步请求 - 加入房间后发送
  useEffect(() => {
    if (socketRef.current && room) {
      // 只有当socket连接和房间信息都可用时才发送请求
      socketRef.current.emit('requestSync', { 
        roomId,
        userName
      });
    }
  }, [socketRef.current, room, roomId, userName]);
  
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
            isWaitingForNewUser={isWaitingForNewUser}
            newUserName={newUserName}
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