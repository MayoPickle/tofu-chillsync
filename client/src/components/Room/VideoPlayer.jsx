import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaPlay, FaPause, FaCompress, FaExpand, FaVolumeUp, FaVolumeDown, FaVolumeMute } from 'react-icons/fa';
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
      currentTime: seekTime
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
    
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
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
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [setIsFullscreen]);

  if (!videoInfo) {
    return (
      <VideoSection>
        <VideoContainer>
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
              <div className="text-space-star" style={{ fontSize: '64px', opacity: 0.8 }}>
                🛰️
              </div>
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