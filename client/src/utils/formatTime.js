/**
 * 格式化时间为时:分:秒格式
 * @param {number} seconds - 需要格式化的秒数
 * @param {number|null} totalDuration - 可选的总时长，用于决定是否显示小时
 * @returns {string} 格式化后的时间字符串
 */
export const formatTime = (seconds, totalDuration = null) => {
  if (!seconds || isNaN(seconds)) return '00:00';
  
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  // 根据总时长决定格式
  const useHours = totalDuration ? totalDuration >= 3600 : h > 0;
  
  if (useHours) {
    // HH:MM:SS 格式
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  } else if (totalDuration && totalDuration >= 60 || !totalDuration && m > 0) {
    // MM:SS 格式
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  } else {
    // 00:SS 格式
    return `00:${s.toString().padStart(2, '0')}`;
  }
};

/**
 * 格式化聊天消息时间为用户友好的格式
 * @param {Date|string} timestamp - 时间戳
 * @returns {string} 格式化后的时间字符串
 */
export const formatChatTime = (timestamp) => {
  if (!timestamp) return '';
  
  const messageDate = new Date(timestamp);
  const now = new Date();
  
  // 计算时间差（秒）
  const diffInSeconds = Math.floor((now - messageDate) / 1000);
  
  // 刚刚：不到1分钟
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  // X分钟前：小于1小时
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'min' : 'mins'} ago`;
  }
  
  // 今天：只显示时间
  if (messageDate.toDateString() === now.toDateString()) {
    return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // 昨天：显示"昨天" + 时间
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (messageDate.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // 更早：显示日期 + 时间
  return messageDate.toLocaleDateString([], { 
    month: 'short', 
    day: 'numeric'
  }) + ', ' + messageDate.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}; 