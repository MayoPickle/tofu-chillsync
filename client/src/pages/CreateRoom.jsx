import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaGlobeAsia, FaSatellite, FaCopy, FaRocket, FaTag, FaPalette } from 'react-icons/fa';
import Card from '../components/Card';
import { useLanguage } from '../contexts/LanguageContext';

function CreateRoom() {
  const navigate = useNavigate();
  const [hostName, setHostName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [roomTheme, setRoomTheme] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [roomCreated, setRoomCreated] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null);
  const { t } = useLanguage();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hostName: hostName.trim() || t.anonymous,
          roomName: roomName.trim() || 'Untitled Planet',
          roomTheme: roomTheme.trim() || 'General',
        }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        setError(data.message || 'Failed to create planet');
        return;
      }
      
      // Set room info and show success message
      setRoomInfo({
        roomId: data.roomId,
        roomLink: `${window.location.origin}/room/${data.roomId}`,
        roomName: data.roomName,
        roomTheme: data.roomTheme,
      });
      setRoomCreated(true);
      
    } catch (error) {
      setError(t.failedToJoin);
      console.error('Error creating planet:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopyLink = () => {
    if (!roomInfo) return;
    
    navigator.clipboard.writeText(roomInfo.roomLink)
      .then(() => {
        alert('Planet link copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy link:', err);
      });
  };
  
  const goToRoom = () => {
    if (!roomInfo) return;
    navigate(`/room/${roomInfo.roomId}`, { 
      state: { 
        userName: hostName.trim() || t.anonymous,
        roomName: roomInfo.roomName,
        roomTheme: roomInfo.roomTheme
      } 
    });
  };

  // 星星背景
  const stars = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2
  }));
  
  return (
    <div className="container py-16 md:py-24 relative">
      {/* 星星背景 */}
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

      {/* 行星背景 */}
      <motion.div 
        className="absolute w-64 h-64 rounded-full bg-gradient-to-br from-space-mars/20 to-space-mars/5 blur-xl -z-10"
        style={{ top: '15%', left: '5%' }}
        animate={{ y: [0, -15, 0] }}
        transition={{ 
          repeat: Infinity, 
          duration: 8,
          ease: "easeInOut" 
        }}
      />

      <div className="max-w-2xl mx-auto">
        <motion.h1 
          className="text-4xl md:text-5xl font-bold text-center mb-8 leading-tight font-space"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-space-star">Host</span> a Planet
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card 
            variant={roomCreated ? "highlighted" : "elevated"}
            className="backdrop-blur-md"
            icon={<FaGlobeAsia />}
            title={roomCreated ? t.planetCreated : t.createYourPlanet}
          >
            {roomCreated ? (
              <div className="space-y-6">
                <div className="text-center text-slate-300 mb-6 flex items-center justify-center gap-2">
                  <FaSatellite className="text-space-star animate-pulse" />
                  <span>{t.shareInviteInfo}</span>
                </div>
                
                <div className="space-border border p-4 rounded-lg relative bg-space-dark/50">
                  <label className="block mb-2 text-sm font-medium text-slate-400">
                    {t.planetName}
                  </label>
                  <div className="text-xl font-medium text-center mb-2 text-space-star">
                    {roomInfo.roomName}
                  </div>
                  
                  <label className="block mb-2 text-sm font-medium text-slate-400">
                    {t.planetTheme}
                  </label>
                  <div className="text-sm text-center mb-4 text-slate-300">
                    {roomInfo.roomTheme}
                  </div>
                  
                  <label className="block mb-2 text-sm font-medium text-slate-400">
                    {t.planetId}
                  </label>
                  <div className="text-3xl font-mono text-center mb-2 font-bold tracking-widest text-space-star">
                    {roomInfo.roomId}
                  </div>
                  
                  <label className="block mb-2 text-sm font-medium text-slate-400">
                    Planet Link
                  </label>
                  <div className="p-3 bg-space-dark/70 border border-space-star/20 rounded font-mono text-sm text-slate-300 break-all">
                    {roomInfo.roomLink}
                  </div>

                  <motion.div 
                    className="absolute w-3 h-3 bg-space-star rounded-full -top-1.5 -right-1.5"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <motion.button 
                    className="btn btn-outline flex-1 w-full sm:w-auto flex items-center justify-center gap-2 min-w-[160px]"
                    onClick={handleCopyLink}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaCopy className="text-sm" />
                    {t.copyLink}
                  </motion.button>
                  <motion.button 
                    className="btn btn-primary flex-1 w-full sm:w-auto flex items-center justify-center gap-2 min-w-[160px]"
                    onClick={goToRoom}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaRocket className="text-sm" />
                    {t.launchPlanet}
                  </motion.button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="roomName" className="block mb-2 font-medium text-slate-300">
                    {t.planetName}
                  </label>
                  <div className="relative">
                    <FaTag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="roomName"
                      type="text"
                      placeholder={t.planetNamePlaceholder}
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      className="form-input pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="roomTheme" className="block mb-2 font-medium text-slate-300">
                    {t.planetTheme}
                  </label>
                  <div className="relative">
                    <FaPalette className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="roomTheme"
                      type="text"
                      placeholder={t.planetThemePlaceholder}
                      value={roomTheme}
                      onChange={(e) => setRoomTheme(e.target.value)}
                      className="form-input pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="hostName" className="block mb-2 font-medium text-slate-300">
                    {t.explorerName}
                  </label>
                  <input
                    id="hostName"
                    type="text"
                    placeholder={t.enterSpaceIdentity}
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    className="form-input"
                  />
                </div>
                
                {error && (
                  <motion.div 
                    className="text-space-mars text-sm py-1 flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <FaRocket className="text-xs" />
                    {error}
                  </motion.div>
                )}
                
                <motion.button 
                  type="submit" 
                  className="btn btn-primary w-full flex items-center justify-center gap-2 min-w-[200px] mx-auto"
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                >
                  {isLoading ? t.creatingPlanet : t.createPlanet}
                  <FaGlobeAsia className={`text-sm ${isLoading ? 'animate-spin' : ''}`} />
                </motion.button>
              </form>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default CreateRoom; 