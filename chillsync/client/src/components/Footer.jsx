import { BsGithub, BsTwitterX, BsDiscord } from 'react-icons/bs'
import { FaRocket, FaStar, FaSpaceShuttle, FaSatelliteDish } from 'react-icons/fa'
import { motion } from 'framer-motion'

function Footer() {
  const currentYear = new Date().getFullYear()
  
  // Generate random stars
  const stars = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 3
  }))
  
  return (
    <footer className="relative mt-auto overflow-hidden">
      {/* Star background */}
      {stars.map(star => (
        <motion.div
          key={star.id}
          className="star absolute"
          style={{ 
            width: `${star.size}px`, 
            height: `${star.size}px`,
            top: star.top,
            left: star.left,
          }}
          animate={{ 
            opacity: [0.4, 1, 0.4],
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 3 + star.delay,
            delay: star.delay,
            ease: "easeInOut" 
          }}
        />
      ))}
      
      {/* Footer planet graphic */}
      <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-b from-primary-900/30 to-primary-700/10 blur-3xl -z-10" />
      
      <div className="relative space-border border-t border-primary-900/30 bg-space-dark/30 backdrop-blur-sm pt-12 pb-8">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex flex-col items-center md:items-start gap-4 relative">
              <div className="flex items-center gap-3">
                <motion.div 
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center"
                  animate={{ 
                    rotate: [0, 10, 0, -10, 0],
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 5,
                    ease: "easeInOut" 
                  }}
                >
                  <FaRocket className="text-white text-sm" />
                </motion.div>
                <span className="font-bold text-gradient text-lg font-space tracking-wide">ChillSync</span>
                <motion.div
                  className="absolute -top-8 right-8 text-space-star text-xs"
                  animate={{ 
                    y: [0, -15, 0],
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 10,
                    ease: "easeInOut" 
                  }}
                >
                  <FaStar />
                </motion.div>
              </div>
              <p className="text-slate-400 text-sm text-center md:text-left max-w-md">
                Explore the cosmos of synchronized video watching. Connect with earthlings and aliens alike from across the galaxy.
              </p>
              
              {/* Floating planet */}
              <motion.div
                className="absolute -top-24 -left-24 w-16 h-16 rounded-full bg-space-neptune/30 opacity-40 hidden md:block"
                animate={{ 
                  y: [0, -10, 0],
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 8,
                  ease: "easeInOut" 
                }}
              />
            </div>
            
            <div className="flex flex-col gap-4 items-center md:items-end">
              <div className="flex gap-6">
                <SocialLink href="https://github.com/MayoPickle/tofu-chillsync" icon={<BsGithub />} label="GitHub" />
                <SocialLink href="https://twitter.com" icon={<BsTwitterX />} label="Twitter" />
                <SocialLink href="https://discord.com" icon={<BsDiscord />} label="Discord" />
              </div>
              
              <div className="flex gap-6 text-sm text-slate-400">
                <FooterLink href="#">Mission</FooterLink>
                <FooterLink href="#">Space Map</FooterLink>
                <FooterLink href="#">Orbital Terms</FooterLink>
              </div>
              
              <motion.div 
                className="text-sm text-slate-500 flex items-center gap-2"
                animate={{ opacity: [0.6, 0.8, 0.6] }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 4,
                  ease: "easeInOut" 
                }}
              >
                <FaSatelliteDish className="text-xs" />
                <p>&copy; {currentYear} ChillSync Orbital. Signal received.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ href, children }) {
  return (
    <a 
      href={href} 
      className="text-slate-400 hover:text-primary-400 transition-colors duration-200"
    >
      {children}
    </a>
  )
}

function SocialLink({ href, icon, label }) {
  return (
    <motion.a 
      href={href}
      aria-label={label}
      className="text-slate-400 hover:text-primary-400 transition-colors duration-200 text-xl"
      whileHover={{ 
        scale: 1.1, 
        y: -3,
        color: 'rgb(56, 189, 248)',
      }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {icon}
    </motion.a>
  )
}

export default Footer 