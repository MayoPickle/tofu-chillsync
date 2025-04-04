import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlinePlay, HiOutlineArrowRight, HiOutlineUserGroup } from 'react-icons/hi';
import { FaRocket, FaSatellite, FaSpaceShuttle, FaGlobeAsia, FaMeteor } from 'react-icons/fa';
import Card from '../components/Card';
import { useLanguage } from '../contexts/LanguageContext';

function Home() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');
  const { t } = useLanguage();
  
  const handleJoinRoom = async (e) => {
    e.preventDefault();
    
    if (!roomId.trim()) {
      setError(t.roomIdRequired);
      return;
    }
    
    try {
      const response = await fetch(`/api/rooms/${roomId.trim()}`);
      const data = await response.json();
      
      if (!data.success) {
        setError(t.roomNotFound);
        return;
      }
      
      // Navigate to the room with username as state
      navigate(`/room/${roomId.trim()}`, { 
        state: { userName: userName.trim() || t.anonymous } 
      });
      
    } catch (error) {
      setError(t.failedToJoin);
      console.error('Error joining room:', error);
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  // Random stars for background
  const stars = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2
  }));
  
  return (
    <div className="container py-16 md:py-24 relative">
      {/* Animated stars */}
      {stars.map(star => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-space-star/50"
          style={{ 
            width: `${star.size}px`, 
            height: `${star.size}px`,
            top: star.top,
            left: star.left,
          }}
          animate={{ 
            opacity: [0.3, 1, 0.3],
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
      
      {/* Space planets */}
      <motion.div 
        className="absolute w-64 h-64 rounded-full bg-gradient-to-br from-space-mars/20 to-space-mars/5 blur-xl -z-10"
        style={{ top: '10%', right: '15%' }}
        animate={{ y: [0, -15, 0] }}
        transition={{ 
          repeat: Infinity, 
          duration: 8,
          ease: "easeInOut" 
        }}
      />
      
      <motion.div 
        className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-space-neptune/20 to-space-neptune/5 blur-xl -z-10"
        style={{ bottom: '20%', left: '10%' }}
        animate={{ y: [0, 10, 0] }}
        transition={{ 
          repeat: Infinity, 
          duration: 6,
          ease: "easeInOut" 
        }}
      />
      
      <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        {/* Hero Content */}
        <motion.div 
          className="flex-1 relative"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight font-space tracking-wide"
            variants={itemVariants}
          >
            <span className="text-space-star">{t.cosmicVideo}</span> {t.explorationWithFriends}
          </motion.h1>
          
          <motion.p 
            className="text-lg text-slate-300 mb-8 max-w-xl"
            variants={itemVariants}
          >
            {t.joinPlanetsDesc}
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 mb-12"
            variants={itemVariants}
          >
            <Link 
              to="/create" 
              className="btn btn-primary flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(254,240,138,0.3)]"
            >
              <FaGlobeAsia className="text-sm" />
              {t.hostPlanetBtn}
            </Link>
            <Link 
              to="/planets" 
              className="btn btn-outline flex items-center justify-center gap-2"
            >
              <FaSatellite className="text-sm" />
              {t.explorePlanetsBtn}
            </Link>
          </motion.div>
          
          <motion.div 
            className="flex gap-8 text-slate-300"
            variants={itemVariants}
          >
            <div className="flex flex-col items-center">
              <div className="font-bold text-2xl text-space-star mb-1 flex items-center">
                <motion.span 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                  className="inline-block"
                >
                  <FaSatellite className="mr-2 text-lg" />
                </motion.span>
                {t.realTime}
              </div>
              <div className="text-sm">{t.quantumSync}</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="font-bold text-2xl text-space-star mb-1 flex items-center">
                <FaGlobeAsia className="mr-2 text-lg" />
                {t.universal}
              </div>
              <div className="text-sm">{t.compatibility}</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="font-bold text-2xl text-space-star mb-1 flex items-center">
                <FaSpaceShuttle className="mr-2 text-lg" />
                {t.free}
              </div>
              <div className="text-sm">{t.noTokens}</div>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Join Form */}
        <motion.div 
          id="join"
          className="w-full max-w-md relative"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <Card 
            variant="highlighted" 
            title={t.joinPlanet}
            icon={<FaGlobeAsia />}
            className="backdrop-blur-md"
          >
            <form onSubmit={handleJoinRoom} className="space-y-5">
              <div>
                <label htmlFor="roomId" className="block mb-2 font-medium text-slate-300">
                  {t.planetId}
                </label>
                <input
                  id="roomId"
                  type="text"
                  placeholder={t.enterPlanetCode}
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="form-input"
                />
              </div>
              
              <div>
                <label htmlFor="userName" className="block mb-2 font-medium text-slate-300">
                  {t.explorerName}
                </label>
                <input
                  id="userName"
                  type="text"
                  placeholder={t.enterSpaceIdentity}
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="form-input"
                />
              </div>
              
              {error && (
                <motion.div 
                  className="text-space-mars text-sm py-1 flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <FaMeteor className="text-xs" />
                  {error}
                </motion.div>
              )}
              
              <motion.button 
                type="submit" 
                className="btn btn-primary w-full flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t.joinNow}
                <HiOutlineArrowRight />
              </motion.button>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default Home; 