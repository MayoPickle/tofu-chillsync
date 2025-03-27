import { Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

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

// 闪烁星星组件
const TwinklingStars = () => {
  const [stars, setStars] = useState([])

  useEffect(() => {
    // 生成随机星星
    const generateStars = () => {
      const newStars = Array.from({ length: 80 }, (_, i) => ({
        id: i,
        size: Math.random() * 3 + 1,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 5,
        duration: Math.random() * 3 + 2,
        opacity: Math.random() * 0.7 + 0.3
      }))
      setStars(newStars)
    }

    generateStars()
  }, [])

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
            scale: [1, star.size > 2 ? 1.3 : 1.1, 1],
          }}
          transition={{ 
            repeat: Infinity, 
            duration: star.duration,
            delay: star.delay,
            ease: "easeInOut" 
          }}
        />
      ))}
    </div>
  )
}

// 流星组件
const ShootingStars = () => {
  const [meteors, setMeteors] = useState([])
  
  useEffect(() => {
    // 初始化几个流星
    const initialMeteors = Array.from({ length: 3 }, (_, i) => createMeteor(i))
    setMeteors(initialMeteors)
    
    // 随机产生新流星
    const interval = setInterval(() => {
      const newMeteorId = Date.now()
      setMeteors(prev => {
        // 移除一些旧流星，保持总数在合理范围内
        const updatedMeteors = prev.length > 15 
          ? [...prev.slice(prev.length - 15), createMeteor(newMeteorId)]
          : [...prev, createMeteor(newMeteorId)]
        return updatedMeteors
      })
    }, Math.random() * 2000 + 2000)
    
    return () => clearInterval(interval)
  }, [])
  
  // 创建流星对象
  const createMeteor = (id) => ({
    id,
    top: `${Math.random() * 30}%`,
    left: `${Math.random() * 60 + 10}%`,
    size: Math.random() * 2.5 + 1.5, // 流星大小稍微增加
    travel: Math.random() * 200 + 100, // 位移距离
    duration: Math.random() * 1.5 + 0.8, // 动画持续时间
    delay: Math.random() * 3 // 延迟时间
  })
  
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
          {/* 只保留流星主体 */}
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
  )
}

function App() {
  return (
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
  )
}

export default App 