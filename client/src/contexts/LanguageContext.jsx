import React, { createContext, useState, useContext, useEffect } from 'react';

// Define translations for English and Chinese
const translations = {
  en: {
    // Header
    missionControl: 'Mission Control',
    planetExplorer: 'Planet Explorer',
    hostPlanet: 'Host a Planet',
    
    // Footer (assuming these are the texts)
    poweredBy: 'Powered by',
    allRights: 'All rights reserved',
    
    // Home page
    welcomeTitle: 'Welcome to ChillSync',
    cosmicVideo: 'Cosmic Video',
    explorationWithFriends: 'Exploration with Friends',
    joinPlanetsDesc: 'Join planets across the galaxy, connect with fellow explorers, and experience synchronized adventures in cosmic harmony.',
    hostPlanetBtn: 'Host a Planet',
    explorePlanetsBtn: 'Explore Planets',
    realTime: 'Real-time',
    quantumSync: 'Quantum Sync',
    universal: 'Universal',
    compatibility: 'Compatibility',
    free: 'Free',
    noTokens: 'No Tokens',
    joinPlanet: 'Join a Planet',
    planetId: 'Planet ID',
    enterPlanetCode: 'Enter planet code',
    explorerName: 'Explorer Name',
    enterSpaceIdentity: 'Enter your space identity',
    joinNow: 'Join Now',
    
    // CreateRoom page
    createYourPlanet: 'Create Your Planet',
    planetCreated: 'Planet Created!',
    shareInviteInfo: 'Share the planet ID or link with your fellow explorers',
    planetName: 'Planet Name',
    planetTheme: 'Planet Theme',
    planetThemePlaceholder: 'Movie night, Study session, etc.',
    planetNamePlaceholder: 'Enter a name for your planet',
    copyLink: 'Copy Link',
    launchPlanet: 'Launch Planet',
    creatingPlanet: 'Creating Planet...',
    createPlanet: 'Create Planet',
    
    // NotFound page
    notFoundTitle: '404',
    stationNotFound: 'Space Station Not Found',
    lostInSpace: 'It seems you\'ve ventured into unmapped territory. This cosmic coordinate doesn\'t exist in our galaxy.',
    returnHome: 'Return to Mission Control',
    
    // Planets page
    availablePlanets: 'Available Planets',
    noPlanetsFound: 'No planets orbiting at the moment',
    createFirstPlanet: 'Create the first planet in this galaxy',
    justNow: 'just now',
    timeAgoMinute: '1 minute ago',
    timeAgoMinutes: '{{count}} minutes ago',
    timeAgoHour: '1 hour ago',
    timeAgoHours: '{{count}} hours ago',
    timeAgoDay: '1 day ago',
    timeAgoDays: '{{count}} days ago',
    planetCreatedAt: 'Created: {{time}}',
    activeExplorers: 'Active Explorers: {{count}}',
    join: 'Join',
    
    // Room page
    waitingForVideo: 'Waiting for video transmission...',
    chooseFile: 'Choose a video file to transmit',
    dragDropVideo: 'Drag and drop a video file here',
    orClickToSelect: 'or click to select',
    maxFileSize: 'Maximum file size: 25GB',
    supportedFormats: 'Supported formats: MP4, WebM, OGG, MKV',
    selectFile: 'Select File',
    uploading: 'Uploading...',
    chat: 'Chat',
    viewers: 'Viewers',
    explorers: 'Explorers',
    sendMessage: 'Send Message',
    messagePlaceholder: 'Type your message...',
    
    // Error messages
    roomIdRequired: 'Room ID is required',
    roomNotFound: 'Room not found. Please check the Room ID.',
    failedToJoin: 'Failed to join room. Please try again.',
    anonymous: 'Anonymous',
    
    // Language selector
    language: 'Language',
    english: 'English',
    chinese: '中文',
  },
  zh: {
    // Header
    missionControl: '任务控制',
    planetExplorer: '行星探索',
    hostPlanet: '创建星球',
    
    // Footer
    poweredBy: '技术支持',
    allRights: '版权所有',
    
    // Home page
    welcomeTitle: '欢迎来到 ChillSync',
    cosmicVideo: '宇宙视频',
    explorationWithFriends: '与朋友一起探索',
    joinPlanetsDesc: '加入银河系各地的行星，与其他探险者联系，在宇宙和谐中体验同步冒险。',
    hostPlanetBtn: '创建星球',
    explorePlanetsBtn: '探索星球',
    realTime: '实时',
    quantumSync: '量子同步',
    universal: '通用',
    compatibility: '兼容性',
    free: '免费',
    noTokens: '无需代币',
    joinPlanet: '加入星球',
    planetId: '星球ID',
    enterPlanetCode: '输入星球代码',
    explorerName: '探险者名称',
    enterSpaceIdentity: '输入您的太空身份',
    joinNow: '立即加入',
    
    // CreateRoom page
    createYourPlanet: '创建您的星球',
    planetCreated: '星球已创建！',
    shareInviteInfo: '与您的探险伙伴分享星球ID或链接',
    planetName: '星球名称',
    planetTheme: '星球主题',
    planetThemePlaceholder: '电影之夜，学习会议等',
    planetNamePlaceholder: '输入您的星球名称',
    copyLink: '复制链接',
    launchPlanet: '启动星球',
    creatingPlanet: '创建星球中...',
    createPlanet: '创建星球',
    
    // NotFound page
    notFoundTitle: '404',
    stationNotFound: '找不到空间站',
    lostInSpace: '看来您已经进入了未标绘的领域。这个宇宙坐标在我们的银河系中不存在。',
    returnHome: '返回任务控制',
    
    // Planets page
    availablePlanets: '可用星球',
    noPlanetsFound: '当前没有运行中的星球',
    createFirstPlanet: '在这个银河系创建第一个星球',
    justNow: '刚刚',
    timeAgoMinute: '1分钟前',
    timeAgoMinutes: '{{count}}分钟前',
    timeAgoHour: '1小时前',
    timeAgoHours: '{{count}}小时前',
    timeAgoDay: '1天前',
    timeAgoDays: '{{count}}天前',
    planetCreatedAt: '创建于: {{time}}',
    activeExplorers: '在线探险者: {{count}}',
    join: '加入',
    
    // Room page
    waitingForVideo: '等待视频传输...',
    chooseFile: '选择要传输的视频文件',
    dragDropVideo: '拖放视频文件到这里',
    orClickToSelect: '或点击选择',
    maxFileSize: '最大文件大小: 25GB',
    supportedFormats: '支持的格式: MP4, WebM, OGG, MKV',
    selectFile: '选择文件',
    uploading: '上传中...',
    chat: '聊天',
    viewers: '观众',
    explorers: '探险者',
    sendMessage: '发送消息',
    messagePlaceholder: '输入您的消息...',
    
    // Error messages
    roomIdRequired: '星球ID是必填项',
    roomNotFound: '找不到星球。请检查星球ID。',
    failedToJoin: '加入星球失败。请重试。',
    anonymous: '匿名用户',
    
    // Language selector
    language: '语言',
    english: 'English',
    chinese: '中文',
  }
};

// Create the language context
const LanguageContext = createContext();

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);

// Provider component
export const LanguageProvider = ({ children }) => {
  // Get the saved language from localStorage or use 'en' as default
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'en';
  });

  // Get translations for the current language
  const t = translations[language];

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Toggle between English and Chinese
  const toggleLanguage = () => {
    setLanguage(prevLang => prevLang === 'en' ? 'zh' : 'en');
  };

  // Switch to a specific language
  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, t, toggleLanguage, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider; 