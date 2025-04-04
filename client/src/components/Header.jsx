import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlineVideoCamera, HiMenuAlt3, HiX } from 'react-icons/hi'
import { FaRocket, FaSatellite, FaGlobeAsia } from 'react-icons/fa'
import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { t } = useLanguage()

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

  // 点击导航菜单外区域关闭菜单
  useEffect(() => {
    if (!isMenuOpen) return;
    
    const handleClickOutside = (e) => {
      // 只有在菜单打开状态下才会检测
      if (isMenuOpen) {
        // 检查点击的元素是否在菜单内
        const mobileMenu = document.getElementById('mobile-menu');
        const menuButton = document.getElementById('menu-button');
        
        if (mobileMenu && !mobileMenu.contains(e.target) && 
            menuButton && !menuButton.contains(e.target)) {
          setIsMenuOpen(false);
        }
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <header className="bg-space-dark/30 backdrop-blur border-b border-primary-900/30 sticky top-0 z-50">
      <div className="container">
        <div className="flex justify-between items-center py-3 md:py-4">
          <div className="flex items-center gap-2 md:gap-4">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link to="/" className="flex items-center gap-2 md:gap-3 text-xl md:text-2xl font-bold text-white no-underline group">
                <motion.div 
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-space-star/60 shadow-glow overflow-hidden"
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: 10,
                    boxShadow: '0 0 15px rgba(254, 240, 138, 0.5), 0 0 30px rgba(254, 240, 138, 0.3)' 
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    initial={{ y: 0 }}
                    animate={{ y: isMobile ? 0 : [0, -2, 0, 2, 0] }} // 在移动设备上停用精细动画
                    transition={{ 
                      repeat: Infinity, 
                      duration: 2, 
                      ease: "easeInOut" 
                    }}
                  >
                    <FaRocket className="text-white text-base md:text-xl" />
                  </motion.div>
                </motion.div>
                <div className="flex flex-col">
                  <span className="text-space-star font-space font-bold tracking-wide text-base md:text-xl">ChillSync</span>
                  <span className="text-[10px] md:text-xs text-slate-400 -mt-1">Space Station</span>
                </div>
                {!isMobile && (
                  <motion.div 
                    className="absolute w-2 h-2 bg-space-star rounded-full -top-0.5 left-6 opacity-80"
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 3, 
                      ease: "easeInOut" 
                    }}
                  />
                )}
              </Link>
            </motion.div>
            <LanguageSwitcher />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/">{t.missionControl}</NavLink>
            <NavLink to="/planets">{t.planetExplorer}</NavLink>
            <Link to="/create" className="btn bg-blue-900 hover:bg-blue-800 text-white group shadow-md hover:shadow-[0_0_15px_rgba(254,240,138,0.4)]">
              <span className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 15, 
                    ease: "linear" 
                  }}
                  className="inline-block"
                >
                  <FaGlobeAsia className="text-sm opacity-80 group-hover:text-space-star" />
                </motion.span>
                <span>{t.hostPlanet}</span>
              </span>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            id="menu-button"
            className="md:hidden text-slate-200 focus:outline-none hover:text-space-star p-2 -mr-2"
            onClick={toggleMenu}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <HiX className="w-6 h-6" />
            ) : (
              <HiMenuAlt3 className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <motion.div 
          id="mobile-menu"
          className="md:hidden bg-space-dark/90 backdrop-blur-sm border-b border-primary-900/30 absolute w-full"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="container py-4 flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <LanguageSwitcher />
            </div>
            <NavLink to="/" onClick={toggleMenu}>{t.missionControl}</NavLink>
            <NavLink to="/planets" onClick={toggleMenu}>{t.planetExplorer}</NavLink>
            <Link 
              to="/create" 
              className="btn bg-blue-900 hover:bg-blue-800 text-white text-center py-2.5 flex justify-center items-center gap-2 shadow-md"
              onClick={toggleMenu}
            >
              <span>
                <FaGlobeAsia className="inline-block mr-2 text-sm opacity-80" />
                {t.hostPlanet}
              </span>
            </Link>
          </div>
        </motion.div>
      )}
    </header>
  )
}

// NavLink component with active state styling
function NavLink({ to, children, onClick }) {
  return (
    <motion.div 
      className="relative"
      whileHover={{ y: -1 }}
    >
      <Link 
        to={to} 
        className="text-slate-300 font-medium hover:text-space-star transition-all duration-200 tracking-wide px-1 py-1 block"
        onClick={onClick}
      >
        {children}
        <motion.div
          className="absolute -bottom-1 left-0 h-0.5 bg-space-star/70 w-0"
          whileHover={{ width: '100%' }}
          transition={{ duration: 0.2 }}
        />
      </Link>
    </motion.div>
  )
}

export default Header 