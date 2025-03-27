import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlineHome } from 'react-icons/hi'
import { FaRocket, FaSpaceShuttle, FaGlobeAsia, FaSatellite } from 'react-icons/fa'
import Card from '../components/Card'

function NotFound() {
  // Generate stars
  const stars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2
  }));

  return (
    <div className="container py-16 md:py-24 flex justify-center">
      <div className="absolute inset-0 overflow-hidden">
        {/* Stars */}
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
              opacity: [0.4, 1, 0.4],
              scale: [1, 1.3, 1],
            }}
            transition={{ 
              repeat: Infinity, 
              duration: star.duration,
              delay: star.delay,
              ease: "easeInOut" 
            }}
          />
        ))}

        {/* Lost planet */}
        <motion.div
          className="absolute w-64 h-64 rounded-full bg-gradient-to-br from-space-mars/50 to-space-mars/20 blur-xl hidden md:block"
          style={{ top: '30%', left: '15%' }}
          animate={{ 
            y: [0, -10, 0],
            rotate: 360,
          }}
          transition={{
            y: { 
              repeat: Infinity, 
              duration: 10, 
              ease: "easeInOut" 
            },
            rotate: {
              repeat: Infinity,
              duration: 120,
              ease: "linear"
            }
          }}
        />
        
        {/* Lost moon */}
        <motion.div
          className="absolute w-20 h-20 rounded-full bg-space-moon/30 blur-md hidden md:block"
          style={{ bottom: '25%', right: '20%' }}
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{
            repeat: Infinity, 
            duration: 8, 
            ease: "easeInOut" 
          }}
        />
      </div>
      
      <motion.div 
        className="max-w-2xl w-full text-center relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-center mb-8">
          <motion.div
            className="w-32 h-32 relative"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              delay: 0.2 
            }}
          >
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ 
                rotate: 360,
              }}
              transition={{
                repeat: Infinity,
                duration: 60,
                ease: "linear"
              }}
            >
              <motion.div 
                className="w-20 h-20 rounded-full bg-gradient-to-br from-space-dark to-space-dark/80 relative overflow-hidden flex items-center justify-center"
                animate={{ 
                  boxShadow: ['0 0 15px rgba(254, 240, 138, 0.3)', '0 0 25px rgba(254, 240, 138, 0.5)', '0 0 15px rgba(254, 240, 138, 0.3)'] 
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  ease: "easeInOut"
                }}
              >
                <FaGlobeAsia className="text-space-star text-3xl" />
                <div className="absolute w-full h-1/2 bg-space-dark/70 top-0"></div>
              </motion.div>
            </motion.div>
            
            <motion.div
              className="absolute top-5 left-28 w-6 h-6 rounded-full bg-space-star/40 flex items-center justify-center"
              animate={{
                rotate: [0, 360],
                translateX: [-5, 5, -5],
                translateY: [0, -5, 0],
              }}
              transition={{
                rotate: {
                  repeat: Infinity,
                  duration: 10,
                  ease: "linear"
                },
                translateX: {
                  repeat: Infinity,
                  duration: 5,
                  ease: "easeInOut"
                },
                translateY: {
                  repeat: Infinity,
                  duration: 3,
                  ease: "easeInOut"
                }
              }}
            >
              <motion.div
                className="w-1 h-1 rounded-full bg-space-star"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{
                  repeat: Infinity,
                  duration: 2
                }}
              />
            </motion.div>
            
            <motion.div
              className="absolute left-1/2 top-4 transform -translate-x-1/2"
              animate={{
                y: [0, -30, 0],
                x: [0, 10, 0, -10, 0]
              }}
              transition={{
                repeat: Infinity,
                duration: 8,
                ease: "easeInOut"
              }}
            >
              <FaRocket className="text-4xl text-space-star rotate-45" />
            </motion.div>
          </motion.div>
        </div>
        
        <Card variant="highlighted" className="mb-8">
          <motion.h1 
            className="text-6xl font-bold mb-4 text-space-star font-space"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            404
          </motion.h1>
          
          <motion.h2 
            className="text-2xl md:text-3xl font-semibold mb-6 text-space-star/90 font-space"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Space Station Not Found
          </motion.h2>
          
          <motion.p
            className="text-slate-300 text-lg mb-8 max-w-md mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Your spacecraft has drifted into unknown territory. This sector of space hasn't been mapped yet.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Link 
              to="/" 
              className="btn btn-primary inline-flex items-center gap-2 shadow-[0_0_15px_rgba(254,240,138,0.4)] px-8"
            >
              <FaSpaceShuttle />
              Return to Base
            </Link>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  )
}

export default NotFound 