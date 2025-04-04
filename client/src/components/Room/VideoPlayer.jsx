import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaPlay, FaPause, FaCompress, FaExpand, FaVolumeUp, FaVolumeDown, FaVolumeMute, FaSatellite } from 'react-icons/fa';
import { formatTime } from '../../utils/formatTime';
import { ControlButton } from './RoomStyles';

// 视频播放器样式
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
  width: 100%;
  
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

const VolumeControl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 120px;
  position: relative;
  
  @media (max-width: 768px) {
    width: 100px;
  }
  
  @media (max-width: 576px) {
    width: 32px;
    
    // Hide slider on small screens, only show mute button
    .volume-slider-container {
      display: none;
    }
  }
`;

const VolumeSliderContainer = styled.div`
  position: relative;
  flex: 1;
  height: 16px;
  display: flex;
  align-items: center;
`;

const VolumeSlider = styled.input.attrs({ type: 'range' })`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 16px;
  appearance: none;
  background: transparent;
  outline: none;
  margin: 0;
  z-index: 2;
  cursor: pointer;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--space-star, #fef08a);
    cursor: pointer;
    box-shadow: 0 0 5px rgba(254, 240, 138, 0.8);
    z-index: 3;
    position: relative;
  }
  
  &::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border: none;
    border-radius: 50%;
    background: var(--space-star, #fef08a);
    cursor: pointer;
    box-shadow: 0 0 5px rgba(254, 240, 138, 0.8);
    z-index: 3;
  }
`;

const VolumeTrack = styled.div`
  position: absolute;
  width: 100%;
  height: 4px;
  background: rgba(222, 226, 230, 0.3);
  border-radius: 2px;
`;

const VolumeFill = styled.div`
  position: absolute;
  height: 4px;
  width: ${props => props.value * 100}%;
  background: var(--space-star, #fef08a);
  background-image: linear-gradient(to right, rgba(254, 240, 138, 0.8), rgba(254, 240, 138, 1));
  border-radius: 2px;
  transition: width 0.1s ease;
`;

const VideoPlayer = ({
  videoInfo,
  socketRef,
  roomId,
  videoRef,
  videoContainerRef,
  currentTime,
  duration,
  isPlaying,
  volume,
  isFullscreen,
  setCurrentTime,
  setIsPlaying,
  setVolume,
  setIsFullscreen
}) => {
  const isSeeking = useRef(false);
  const ignoreNextPlayEvent = useRef(false);
  const ignorePauseEvent = useRef(false);
  const [seekTooltip, setSeekTooltip] = React.useState({ visible: false, time: 0, position: 0 });

  // 处理播放/暂停按钮点击
  const handlePlayPause = () => {
    if (!videoRef.current || !socketRef.current) return;
    
    if (videoRef.current.paused) {
      // 播放视频并更新本地状态
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        // 通知其他客户端
        socketRef.current.emit('playbackControl', {
          roomId,
          action: 'play',
          currentTime: videoRef.current.currentTime,
          isPlaying: true
        });
      }).catch(err => {
        console.error('Error playing video:', err);
      });
    } else {
      // 暂停视频并更新本地状态
      videoRef.current.pause();
      setIsPlaying(false);
      // 通知其他客户端
      socketRef.current.emit('playbackControl', {
        roomId,
        action: 'pause',
        currentTime: videoRef.current.currentTime,
        isPlaying: false
      });
    }
  };

  // 处理进度条拖动
  const handleSeekTo = (seekTime) => {
    if (!videoRef.current) return;
    
    isSeeking.current = true;
    
    // 更新本地状态
    setCurrentTime(seekTime);
    
    // 设置视频时间
    videoRef.current.currentTime = seekTime;
    
    // 通知其他人
    socketRef.current.emit('playbackControl', {
      roomId,
      action: 'seek',
      currentTime: seekTime,
      // 添加当前播放状态，确保所有客户端保持一致的播放/暂停状态
      isPlaying: !videoRef.current.paused
    });
    
    isSeeking.current = false;
  };

  // 处理进度条悬停
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

  // 处理音量变化
  const handleVolumeChange = (e) => {
    if (!videoRef.current) return;
    
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
  };

  // 处理全屏切换
  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    
    // 检测是否为iOS设备，iOS对全屏API有特殊处理
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    try {
      if (!document.fullscreenElement && 
          !document.webkitFullscreenElement && 
          !document.mozFullScreenElement && 
          !document.msFullscreenElement) {
        
        // iOS设备使用专门的全屏处理方式
        if (isIOS) {
          iOSFullscreenHandler();
        } else {
          // 非iOS设备走标准流程
          // 使用不同浏览器的全屏API
          if (videoContainerRef.current.requestFullscreen) {
            videoContainerRef.current.requestFullscreen().catch(err => {
              console.error(`Error attempting to enable fullscreen: ${err.message}`);
              
              // 如果是移动设备，尝试直接对视频元素启用全屏
              if (/Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                tryVideoElementFullscreen();
              }
            });
          } else if (videoContainerRef.current.webkitRequestFullscreen) {
            videoContainerRef.current.webkitRequestFullscreen();
          } else if (videoContainerRef.current.mozRequestFullScreen) {
            videoContainerRef.current.mozRequestFullScreen();
          } else if (videoContainerRef.current.msRequestFullscreen) {
            videoContainerRef.current.msRequestFullscreen();
          }
        }
      } else {
        // 退出全屏
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
      // 尝试直接对视频元素启用全屏作为备选方案
      if (isIOS) {
        iOSFullscreenHandler();
      } else {
        tryVideoElementFullscreen();
      }
    }
  };
  
  // 专门处理iOS设备的全屏
  const iOSFullscreenHandler = () => {
    if (!videoRef.current) return;
    
    try {
      // 记录当前播放位置和播放状态，用于进入全屏后恢复
      const currentPlaybackTime = videoRef.current.currentTime;
      const wasPlaying = !videoRef.current.paused;
      
      // 创建时间更新处理器，确保在全屏期间能同步位置
      const handleiOSTimeUpdate = () => {
        // 如果用户正在拖动进度条，则不应该更新状态
        if (isSeeking.current) return;
        
        // 正常更新当前时间状态
        setCurrentTime(videoRef.current.currentTime);
        
        // 更频繁地发送同步信息（每5秒而不是10秒）
        if (Math.floor(videoRef.current.currentTime) % 5 === 0 && socketRef && videoRef.current.readyState > 0) {
          socketRef.emit('playbackControl', {
            roomId,
            action: 'seek',
            currentTime: videoRef.current.currentTime,
            isPlaying: !videoRef.current.paused
          });
        }
      };
      
      // 启用iOS特有的全屏模式
      videoRef.current.webkitEnterFullscreen();
      
      // 设置标志位表示已进入全屏
      setIsFullscreen(true);
      
      // 添加iOS全屏期间的时间更新处理器
      videoRef.current.addEventListener('timeupdate', handleiOSTimeUpdate);
      
      // 监听iOS设备上的全屏退出事件
      const handleiOSFullscreenExit = () => {
        // 清理事件监听
        videoRef.current.removeEventListener('webkitendfullscreen', handleiOSFullscreenExit);
        videoRef.current.removeEventListener('timeupdate', handleiOSTimeUpdate);
        
        // 更新全屏状态
        setIsFullscreen(false);
        
        // 应用全屏期间接收到的同步数据
        if (window.pendingSync) {
          console.log('Applying pending sync data:', window.pendingSync);
          
          // 应用进度更新
          if (Math.abs(videoRef.current.currentTime - window.pendingSync.currentTime) > 1) {
            videoRef.current.currentTime = window.pendingSync.currentTime;
          }
          
          // 应用播放状态
          if (window.pendingSync.isPlaying && videoRef.current.paused) {
            videoRef.current.play().catch(err => console.error('Error applying pending play:', err));
          } else if (!window.pendingSync.isPlaying && !videoRef.current.paused) {
            videoRef.current.pause();
          }
          
          // 清除待处理的同步数据
          window.pendingSync = null;
        } else {
          // 如果没有挂起的同步数据，则尝试恢复原始状态
          if (Math.abs(videoRef.current.currentTime - currentPlaybackTime) > 1) {
            // 同步播放位置
            videoRef.current.currentTime = currentPlaybackTime;
            
            // 通知其他客户端同步位置
            if (socketRef) {
              socketRef.emit('playbackControl', {
                roomId,
                action: 'seek',
                currentTime: currentPlaybackTime
              });
            }
          }
          
          // 恢复播放状态
          if (wasPlaying && videoRef.current.paused) {
            videoRef.current.play();
          } else if (!wasPlaying && !videoRef.current.paused) {
            videoRef.current.pause();
          }
        }
      };
      
      // 添加iOS专用的全屏结束事件监听
      videoRef.current.addEventListener('webkitendfullscreen', handleiOSFullscreenExit);
      
    } catch (error) {
      console.error("iOS fullscreen error:", error);
    }
  };

  // 尝试对视频元素直接启用全屏
  const tryVideoElementFullscreen = () => {
    if (!videoRef.current) return;
    
    try {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      } else if (videoRef.current.webkitEnterFullscreen) {
        // 特殊的iOS方法
        videoRef.current.webkitEnterFullscreen();
      }
    } catch (error) {
      console.error("Video element fullscreen error:", error);
    }
  };

  // 处理静音切换
  const toggleMute = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !videoRef.current.muted;
    setVolume(videoRef.current.muted ? 0 : 1);
  };

  // 获取音量图标
  const getVolumeIcon = () => {
    if (videoRef.current?.muted || volume === 0) {
      return <FaVolumeMute />;
    } else if (volume < 0.5) {
      return <FaVolumeDown />;
    } else {
      return <FaVolumeUp />;
    }
  };

  // 监听全屏变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreenActive = 
        !!document.fullscreenElement ||
        !!document.webkitFullscreenElement ||
        !!document.mozFullScreenElement ||
        !!document.msFullscreenElement;
      
      setIsFullscreen(isFullscreenActive);
    };
    
    // 添加所有浏览器前缀的全屏事件监听
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      // 清理监听器
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [setIsFullscreen]);

  if (!videoInfo) {
    return (
      <VideoSection>
        <VideoContainer ref={videoContainerRef}>
          <VideoPlaceholder>
            <motion.div
              animate={{ 
                rotate: [0, -10, 10, -10, 0],
                y: [0, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 5,
                ease: "easeInOut" 
              }}
              style={{ position: 'relative' }}
            >
              <FaSatellite className="text-space-star" style={{ fontSize: '64px', opacity: 0.8 }} />
            </motion.div>
            
            <div style={{ position: 'absolute', width: '100%', height: '100%', zIndex: -1, overflow: 'hidden' }}>
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  style={{
                    position: 'absolute',
                    width: Math.random() * 3 + 1,
                    height: Math.random() * 3 + 1,
                    borderRadius: '50%',
                    backgroundColor: 'var(--space-star, #fef08a)',
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    opacity: [0.2, 0.8, 0.2],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: Math.random() * 3 + 2,
                    delay: Math.random() * 5,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
            
            <motion.h3 
              style={{ marginTop: '1.5rem', position: 'relative', zIndex: 2, textShadow: '0 0 10px rgba(0,0,0,0.5)' }}
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              还没有视频信号 
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                style={{ display: 'inline-block', marginLeft: '5px', fontSize: '1.2em' }}
              >
                📡
              </motion.span>
            </motion.h3>
            <p className="mt-2 text-gray-400" style={{ position: 'relative', zIndex: 2, textShadow: '0 0 10px rgba(0,0,0,0.5)' }}>
              上传视频开始一起探索宇宙吧
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
                style={{ display: 'inline-block', marginLeft: '5px' }}
              >
                ✨
              </motion.span>
            </p>
          </VideoPlaceholder>
        </VideoContainer>
      </VideoSection>
    );
  }

  return (
    <VideoSection>
      <VideoContainer ref={videoContainerRef}>
        <video 
          ref={videoRef}
          src={videoInfo.path}
          controls={false}
          playsInline={true}
          data-webkit-playsinline="true"
          data-webkit-airplay="allow"
          data-x5-playsinline="true"
          data-x5-video-player-type="h5"
          data-x5-video-player-fullscreen="true"
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
              onTouchStart={(e) => {
                if (!videoRef.current || !duration) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const position = (e.touches[0].clientX - rect.left) / rect.width;
                const seekTime = position * duration;
                handleSeekTo(seekTime);
              }}
              onMouseMove={handleSeekBarHover}
              onTouchMove={(e) => {
                if (!videoRef.current || !duration) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const position = (e.touches[0].clientX - rect.left) / rect.width;
                const hoverTime = position * duration;
                
                setSeekTooltip({
                  visible: true,
                  time: hoverTime,
                  position: e.touches[0].clientX - rect.left
                });
              }}
              onMouseLeave={() => setSeekTooltip({ ...seekTooltip, visible: false })}
              onTouchEnd={() => setSeekTooltip({ ...seekTooltip, visible: false })}
            />
            {duration > 0 && (
              <SeekTooltip 
                isVisible={seekTooltip.visible} 
                style={{ left: `${seekTooltip.position}px` }}
              >
                {formatTime(seekTooltip.time, duration)}
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
              <span>{formatTime(currentTime || 0, duration)}</span>
              <span className="opacity-50 mx-1">/</span>
              <span>{formatTime(duration || 0, duration)}</span>
            </TimeDisplay>
            
            <VolumeControl>
              <ControlButton 
                onClick={toggleMute}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {getVolumeIcon()}
              </ControlButton>
              <VolumeSliderContainer className="volume-slider-container">
                <VolumeTrack />
                <VolumeFill value={volume} />
                <VolumeSlider 
                  min={0} 
                  max={1} 
                  step={0.01}
                  value={volume}
                  onChange={handleVolumeChange}
                />
              </VolumeSliderContainer>
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
      </VideoContainer>
    </VideoSection>
  );
};

export default VideoPlayer; 