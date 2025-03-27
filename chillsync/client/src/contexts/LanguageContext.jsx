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