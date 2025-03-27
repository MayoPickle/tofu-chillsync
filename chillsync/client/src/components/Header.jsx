import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlineVideoCamera, HiMenuAlt3, HiX } from 'react-icons/hi'
import { FaRocket, FaSatellite, FaGlobeAsia } from 'react-icons/fa'
import { useState } from 'react'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <header className="bg-space-dark/30 backdrop-blur border-b border-primary-900/30 sticky top-0 z-50">
      <div className="container">
        <div className="flex justify-between items-center py-4">
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
                  animate={{ y: [0, -2, 0, 2, 0] }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2, 
                    ease: "easeInOut" 
                  }}
                >
                  <FaRocket className="text-white text-xl" />
                </motion.div>
              </motion.div>
              <div className="flex flex-col">
                <span className="text-space-star font-space font-bold tracking-wide">ChillSync</span>
                <span className="text-xs text-slate-400 -mt-1">Space Station</span>
              </div>
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
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/">Mission Control</NavLink>
            <NavLink to="/planets">Planet Explorer</NavLink>
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
                <span>Host a Planet</span>
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
            <NavLink to="/" onClick={toggleMenu}>Mission Control</NavLink>
            <NavLink to="/planets" onClick={toggleMenu}>Planet Explorer</NavLink>
            <Link 
              to="/create" 
              className="btn bg-blue-900 hover:bg-blue-800 text-white group shadow-md hover:shadow-[0_0_15px_rgba(254,240,138,0.4)]"
              onClick={toggleMenu}
            >
              <span className="flex items-center justify-center gap-2">
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
                <span>Host a Planet</span>
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
    <motion.div className="relative">
      <Link 
        to={to} 
        className="text-slate-300 font-medium hover:text-space-star transition-all duration-200 tracking-wide px-1 py-1"
        onClick={onClick}
        whileHover={{ y: -1 }}
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