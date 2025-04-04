import { BsGithub } from 'react-icons/bs'
import { FaRocket, FaStar } from 'react-icons/fa'
import { HiMail } from 'react-icons/hi'
import { motion } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'
import { useState, useEffect } from 'react'

function Footer() {
  const currentYear = new Date().getFullYear()
  const { t } = useLanguage()
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    // 检测是否为移动设备
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // 初始检查
    checkIsMobile();
    
    // 监听窗口大小变化
    window.addEventListener('resize', checkIsMobile);
    
    // 清理监听器
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  
  // 增加更多星星，但在移动设备上减少数量
  const starCount = isMobile ? 12 : 25; // 移动设备减少星星数量
  const stars = Array.from({ length: starCount }, (_, i) => ({
    id: i,
    size: Math.random() * (isMobile ? 3 : 4) + 2,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 3,
    duration: Math.random() * 3 + 2
  }))
  
  return (
    <footer className="relative w-full mt-auto">
      {/* 星星背景 - 确保可见 */}
      <div className="absolute inset-0 overflow-hidden">
        {stars.map(star => (
          <motion.div
            key={star.id}
            className="absolute bg-space-star rounded-full z-0"
            style={{ 
              width: `${star.size}px`, 
              height: `${star.size}px`,
              top: star.top,
              left: star.left,
            }}
            animate={{ 
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.2, 1],
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
      
      <div className="relative space-border border-t border-space-star/10 bg-space-dark/50 backdrop-blur-sm py-4 md:py-6 z-10">
        <div className="container px-3 md:px-4">
          {/* 在小屏幕上使用更灵活的布局 */}
          <div className="flex flex-col items-center gap-4 md:gap-6 md:flex-row md:justify-between md:items-center">
            {/* Logo区域 */}
            <div className="flex items-center gap-2">
              <motion.div 
                className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br from-primary-500 to-space-star/60 flex items-center justify-center"
                animate={!isMobile ? { 
                  rotate: [0, 10, 0, -10, 0],
                } : {}}
                transition={{ 
                  repeat: Infinity, 
                  duration: 5,
                  ease: "easeInOut" 
                }}
              >
                <FaRocket className="text-white text-[10px] md:text-xs" />
              </motion.div>
              <span className="font-bold text-space-star text-xs md:text-sm font-space tracking-wide">ChillSync</span>
            </div>
            
            {/* 中间部分: 链接 */}
            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 text-sm">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-space-star transition-all duration-200 flex items-center gap-2 relative text-xs md:text-sm"
                aria-label="GitHub"
              >
                <BsGithub className="text-base md:text-lg" />
                <span>GitHub</span>
              </a>
              
              <div className="text-slate-300 flex items-center gap-2 relative text-xs md:text-sm">
                <HiMail className="text-base md:text-lg text-space-star/80" />
                <span>support@yudoufu.org</span>
              </div>
            </div>
            
            {/* 版权信息 */}
            <div className="text-[10px] md:text-xs text-slate-400 flex items-center gap-1">
              <FaStar className="text-[10px] md:text-xs text-space-star" />
              <p>&copy; {currentYear} ChillSync. {t.allRights}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 