import { Routes, Route } from 'react-router-dom'
import { useEffect, useState, useCallback, memo, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import React from 'react'

// Pages
import Home from './pages/Home'
import CreateRoom from './pages/CreateRoom'
import Room from './pages/Room'
import NotFound from './pages/NotFound'
import Planets from './pages/Planets'

// Components
import Header from './components/Header'
import Footer from './components/Footer'
import CatTofuMeteors from './components/CatTofuMeteors'

// 自定义hook，判断是否需要应用动画
const useAnimationsEnabled = () => {
  const [enabled, setEnabled] = useState(() => {
    // 默认启用，但可以从localStorage读取用户偏好
    const saved = localStorage.getItem('animations-enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // 用于控制动画的函数
  const toggleAnimations = useCallback(() => {
    setEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem('animations-enabled', JSON.stringify(newValue));
      return newValue;
    });
  }, []);

  return { enabled, toggleAnimations };
};

// 优化的星星组件
const TwinklingStars = memo(() => {
  const [stars, setStars] = useState([]);
  const shouldReduceMotion = useReducedMotion();
  const { enabled: animationsEnabled } = useAnimationsEnabled();
  
  // 如果用户系统设置为减少动画或用户已关闭动画，则不显示
  const showAnimations = !shouldReduceMotion && animationsEnabled;

  useEffect(() => {
    // 只有在启用动画时才生成星星
    if (!showAnimations) return;
    
    // 生成随机星星，减少数量从80减少到40
    const generateStars = () => {
      const newStars = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        size: Math.random() * 3 + 1,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 5,
        duration: Math.random() * 3 + 2,
        opacity: Math.random() * 0.7 + 0.3
      }));
      setStars(newStars);
    };

    generateStars();
  }, [showAnimations]);

  // 如果不显示动画，返回null
  if (!showAnimations || stars.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {stars.map(star => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-space-star"
          style={{ 
            width: `${star.size}px`, 
            height: `${star.size}px`,
            top: star.top,
            left: star.left,
          }}
          animate={{ 
            opacity: [star.opacity, 1, star.opacity],
            scale: [1, star.size > 2 ? 1.2 : 1.05, 1], // 减小缩放幅度
          }}
          transition={{ 
            repeat: Infinity, 
            duration: star.duration,
            delay: star.delay,
            ease: "easeInOut",
            // 使用更高效的CSS变换而不是JS动画
            type: "tween"
          }}
        />
      ))}
    </div>
  );
});

TwinklingStars.displayName = 'TwinklingStars';

// 优化的流星组件
const ShootingStars = memo(() => {
  const [meteors, setMeteors] = useState([]);
  const intervalRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const { enabled: animationsEnabled } = useAnimationsEnabled();
  
  // 如果用户系统设置为减少动画或用户已关闭动画，则不显示
  const showAnimations = !shouldReduceMotion && animationsEnabled;
  
  // 使用useCallback优化函数创建
  const createMeteor = useCallback((id) => ({
    id,
    top: `${Math.random() * 30}%`,
    left: `${Math.random() * 60 + 10}%`,
    size: Math.random() * 2.5 + 1.5,
    travel: Math.random() * 200 + 100,
    duration: Math.random() * 1.5 + 0.8,
    delay: Math.random() * 3
  }), []);
  
  useEffect(() => {
    // 只有在启用动画时才生成流星
    if (!showAnimations) return;
    
    // 初始化流星，减少初始数量
    const initialMeteors = Array.from({ length: 2 }, (_, i) => createMeteor(i));
    setMeteors(initialMeteors);
    
    // 随机产生新流星，增加时间间隔
    intervalRef.current = setInterval(() => {
      const newMeteorId = Date.now();
      setMeteors(prev => {
        // 限制最大流星数量
        const maxMeteors = 8; // 限制流星总数
        const updatedMeteors = prev.length >= maxMeteors 
          ? [...prev.slice(1), createMeteor(newMeteorId)] // 移除最旧的流星
          : [...prev, createMeteor(newMeteorId)];
        return updatedMeteors;
      });
    }, Math.random() * 3000 + 3000); // 增加时间间隔
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [showAnimations, createMeteor]);
  
  // 如果不显示动画，返回null
  if (!showAnimations || meteors.length === 0) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {meteors.map(meteor => (
        <div
          key={meteor.id}
          className="absolute"
          style={{
            top: meteor.top,
            left: meteor.left,
            zIndex: 1,
            '--travel-distance': `${meteor.travel}px`
          }}
        >
          <div 
            className="absolute rounded-full bg-space-star"
            style={{
              width: `${meteor.size}px`,
              height: `${meteor.size}px`,
              boxShadow: '0 0 6px #fef08a',
              animation: `shooting-star ${meteor.duration}s ${meteor.delay}s ease-out forwards`
            }}
          />
        </div>
      ))}
    </div>
  );
});

ShootingStars.displayName = 'ShootingStars';

// 为App组件添加Context Provider，允许组件访问animations启用状态
export const AnimationsContext = React.createContext({
  enabled: true,
  toggleAnimations: () => {}
});

function App() {
  const animationsState = useAnimationsEnabled();
  
  return (
    <AnimationsContext.Provider value={animationsState}>
      <div className="flex flex-col min-h-screen">
        <TwinklingStars />
        <ShootingStars />
        <CatTofuMeteors />
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateRoom />} />
            <Route path="/room/:roomId" element={<Room />} />
            <Route path="/planets" element={<Planets />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AnimationsContext.Provider>
  );
}

export default App; 