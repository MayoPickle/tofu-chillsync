import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiOutlineVideoCamera, HiMenuAlt3, HiX } from 'react-icons/hi'
import { FaRocket, FaSatellite, FaGlobeAsia, FaToggleOn, FaToggleOff } from 'react-icons/fa'
import { useState, useContext } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'
import { AnimationsContext } from '../App'

// 动画切换组件
const AnimationToggle = () => {
  const { enabled, toggleAnimations } = useContext(AnimationsContext);
  const { t } = useLanguage();

  return (
    <motion.button
      className="flex items-center gap-1.5 text-slate-300 hover:text-space-star transition-colors px-2 py-1 rounded-md"
      onClick={toggleAnimations}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={enabled ? '关闭动画效果' : '打开动画效果'}
    >
      {enabled ? (
        <FaToggleOn className="text-lg text-space-star" />
      ) : (
        <FaToggleOff className="text-lg" />
      )}
      <span className="text-sm hidden md:inline-block">{enabled ? '动画：开' : '动画：关'}</span>
    </motion.button>
  );
};

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { t } = useLanguage()
  const { enabled: animationsEnabled } = useContext(AnimationsContext);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <header className="bg-space-dark/30 backdrop-blur border-b border-primary-900/30 sticky top-0 z-50">
      <div className="container">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-4">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link to="/" className="flex items-center gap-3 text-2xl font-bold text-white no-underline group">
                <motion.div 
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-space-star/60 shadow-glow overflow-hidden"
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: 10,
                    boxShadow: '0 0 15px rgba(254, 240, 138, 0.5), 0 0 30px rgba(254, 240, 138, 0.3)' 
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    initial={{ y: 0 }}
                    animate={animationsEnabled ? { 
                      y: [0, -2, 0, 2, 0] 
                    } : {}}
                    transition={animationsEnabled ? { 
                      repeat: Infinity, 
                      duration: 2, 
                      ease: "easeInOut" 
                    } : {}}
                  >
                    <FaRocket className="text-white text-xl" />
                  </motion.div>
                </motion.div>
                <div className="flex flex-col">
                  <span className="text-space-star font-space font-bold tracking-wide">ChillSync</span>
                  <span className="text-xs text-slate-400 -mt-1">Space Station</span>
                </div>
                
                {/* 闪烁的星星点，只在动画开启时显示 */}
                <AnimatePresence>
                  {animationsEnabled && (
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
                </AnimatePresence>
              </Link>
            </motion.div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <AnimationToggle />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/">{t.missionControl}</NavLink>
            <NavLink to="/planets">{t.planetExplorer}</NavLink>
            <Link to="/create" className="btn bg-blue-900 hover:bg-blue-800 text-white group shadow-md hover:shadow-[0_0_15px_rgba(254,240,138,0.4)]">
              <span className="flex items-center gap-2">
                {animationsEnabled ? (
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
                ) : (
                  <span className="inline-block">
                    <FaGlobeAsia className="text-sm opacity-80 group-hover:text-space-star" />
                  </span>
                )}
                <span>{t.hostPlanet}</span>
              </span>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-slate-200 focus:outline-none hover:text-space-star"
            onClick={toggleMenu}
            aria-label="Toggle menu"
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
          className="md:hidden bg-space-dark/90 backdrop-blur-sm border-t border-primary-900/30"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="container py-4 flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <LanguageSwitcher />
              <AnimationToggle />
            </div>
            <NavLink to="/" onClick={toggleMenu}>{t.missionControl}</NavLink>
            <NavLink to="/planets" onClick={toggleMenu}>{t.planetExplorer}</NavLink>
            <Link 
              to="/create" 
              className="btn bg-blue-900 hover:bg-blue-800 text-white group shadow-md hover:shadow-[0_0_15px_rgba(254,240,138,0.4)]"
              onClick={toggleMenu}
            >
              <span className="flex items-center justify-center gap-2">
                {animationsEnabled ? (
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
                ) : (
                  <span className="inline-block">
                    <FaGlobeAsia className="text-sm opacity-80 group-hover:text-space-star" />
                  </span>
                )}
                <span>{t.hostPlanet}</span>
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
        className="text-slate-300 font-medium hover:text-space-star transition-all duration-200 tracking-wide px-1 py-1"
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