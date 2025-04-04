import { BsGithub } from 'react-icons/bs'
import { FaRocket, FaStar } from 'react-icons/fa'
import { HiMail } from 'react-icons/hi'
import { motion } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'

function Footer() {
  const currentYear = new Date().getFullYear()
  const { t } = useLanguage()
  
  // 增加更多星星
  const stars = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
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
      
      <div className="relative space-border border-t border-space-star/10 bg-space-dark/50 backdrop-blur-sm py-6 z-10">
        <div className="container">
          {/* 在小屏幕上使用更灵活的布局 */}
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between md:items-center">
            {/* Logo区域 */}
            <div className="flex items-center gap-2">
              <motion.div 
                className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-space-star/60 flex items-center justify-center"
                animate={{ 
                  rotate: [0, 10, 0, -10, 0],
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 5,
                  ease: "easeInOut" 
                }}
              >
                <FaRocket className="text-white text-xs" />
              </motion.div>
              <span className="font-bold text-space-star text-sm font-space tracking-wide">ChillSync</span>
            </div>
            
            {/* 中间部分: 链接 */}
            <div className="flex flex-wrap justify-center items-center gap-6">
              <motion.a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-space-star transition-all duration-200 flex items-center gap-2 relative"
                whileHover={{ scale: 1.05, y: -2 }}
                aria-label="GitHub"
              >
                <BsGithub className="text-lg" />
                <span className="text-sm">GitHub</span>
                <motion.div 
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-space-star/60" 
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.2 }}
                />
              </motion.a>
              
              <motion.div 
                className="text-slate-300 flex items-center gap-2 relative"
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <HiMail className="text-lg text-space-star/80" />
                <span className="text-sm">support@yudoufu.org</span>
                <motion.div 
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-space-star/60" 
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.2 }}
                />
              </motion.div>
            </div>
            
            {/* 版权信息 */}
            <motion.div 
              className="text-xs text-slate-400 flex items-center gap-1"
              animate={{ opacity: [0.6, 0.8, 0.6] }}
              transition={{ 
                repeat: Infinity, 
                duration: 4,
                ease: "easeInOut" 
              }}
            >
              <FaStar className="text-xs text-space-star" />
              <p>&copy; {currentYear} ChillSync. {t.allRights}</p>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 