import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaRocket, FaGlobeAsia, FaSatellite, FaUsers, FaVideo, FaClock } from 'react-icons/fa';

const PlanetsContainer = styled.div`
  padding: 1.5rem 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: calc(100vh - 80px);
`;

const StarsBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: -1;
`;

const Star = styled(motion.div)`
  position: absolute;
  background-color: var(--space-star, #fef08a);
  border-radius: 50%;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PlanetsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  width: 100%;
`;

const PlanetCard = styled(motion.div)`
  background-color: rgba(13, 17, 23, 0.7);
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(254, 240, 138, 0.1);
  overflow: hidden;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(254, 240, 138, 0.15);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  
  &:hover {
    box-shadow: 0 0 25px rgba(254, 240, 138, 0.15);
    transform: translateY(-2px);
    border-color: rgba(254, 240, 138, 0.3);
  }
`;

const PlanetHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid rgba(254, 240, 138, 0.1);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--space-star, #fef08a);
`;

const PlanetBody = styled.div`
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const PlanetInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex: 1;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #fff;
  font-size: 0.875rem;
  
  svg {
    color: var(--space-star, #fef08a);
    opacity: 0.8;
  }
`;

const PlanetFooter = styled.div`
  padding: 1rem;
  border-top: 1px solid rgba(254, 240, 138, 0.1);
  display: flex;
  justify-content: center;
`;

const JoinButton = styled(motion.button)`
  background: rgba(254, 240, 138, 0.15);
  border: 1px solid rgba(254, 240, 138, 0.3);
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  color: var(--space-star, #fef08a);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  
  &:hover {
    background: rgba(254, 240, 138, 0.2);
    border-color: rgba(254, 240, 138, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: rgba(13, 17, 23, 0.5);
  border-radius: 12px;
  border: 1px dashed rgba(254, 240, 138, 0.2);
  grid-column: 1 / -1;
`;

const CreateRoomButton = styled(Link)`
  background: linear-gradient(to right, rgba(254, 240, 138, 0.2), rgba(254, 240, 138, 0.3));
  border: 1px solid rgba(254, 240, 138, 0.3);
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  color: var(--space-star, #fef08a);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  
  &:hover {
    background: linear-gradient(to right, rgba(254, 240, 138, 0.3), rgba(254, 240, 138, 0.4));
    border-color: rgba(254, 240, 138, 0.4);
    transform: translateY(-2px);
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

// Format the creation time to be human-readable
function formatTimeAgo(date) {
  const now = new Date();
  const createdAt = new Date(date);
  const diffInSeconds = Math.floor((now - createdAt) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  const days = Math.floor(diffInSeconds / 86400);
  return `${days} ${days === 1 ? 'day' : 'days'} ago`;
}

function Planets() {
  const [planets, setPlanets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // Fetch all active planets when the component mounts
  useEffect(() => {
    const fetchPlanets = async () => {
      try {
        const response = await fetch('/api/rooms');
        const data = await response.json();
        
        if (data.success) {
          setPlanets(data.rooms);
        } else {
          setError('Failed to fetch planets');
        }
      } catch (error) {
        console.error('Error fetching planets:', error);
        setError('An error occurred while fetching planets');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlanets();
    
    // Set up a polling interval to refresh the planets list
    const interval = setInterval(fetchPlanets, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle joining a planet
  const handleJoinPlanet = (planetId) => {
    navigate(`/room/${planetId}`, {
      state: { userName: 'Explorer' } // You could prompt for a name or use a stored name
    });
  };
  
  // Generate random stars for background
  const randomStars = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2
  }));
  
  // Animation variants for page elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
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
  
  if (isLoading) {
    return (
      <div className="container">
        <PlanetsContainer>
          <LoadingState>
            <motion.div
              animate={{ 
                rotate: 360,
                y: [0, -10, 0]
              }}
              transition={{ 
                rotate: { repeat: Infinity, duration: 10, ease: "linear" },
                y: { repeat: Infinity, duration: 2, ease: "easeInOut" }
              }}
            >
              <FaSatellite className="text-space-star" style={{ fontSize: '64px' }} />
            </motion.div>
            <h2 className="text-space-star">Scanning for Planets...</h2>
          </LoadingState>
        </PlanetsContainer>
      </div>
    );
  }
  
  return (
    <div className="container">
      <PlanetsContainer>
        <StarsBackground>
          {randomStars.map(star => (
            <Star
              key={star.id}
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
        </StarsBackground>

        <PageHeader>
          <PageTitle>
            <FaGlobeAsia className="text-space-star" />
            Active Planets <span className="text-sm text-space-star ml-2">({planets.length})</span>
          </PageTitle>
          
          <CreateRoomButton to="/create">
            <FaRocket />
            Host a New Planet
          </CreateRoomButton>
        </PageHeader>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <PlanetsGrid>
            {planets.length === 0 ? (
              <EmptyState>
                <FaSatellite className="text-space-star text-4xl mb-4" />
                <h3 className="text-xl mb-2">No Active Planets Found</h3>
                <p className="text-gray-400 mb-4">Be the first to launch a planet for exploration!</p>
                <CreateRoomButton to="/create" className="mx-auto inline-flex">
                  <FaRocket />
                  Host a New Planet
                </CreateRoomButton>
              </EmptyState>
            ) : (
              planets.map(planet => (
                <PlanetCard 
                  key={planet.id}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                >
                  <PlanetHeader>
                    <FaGlobeAsia />
                    {planet.name}
                  </PlanetHeader>
                  <PlanetBody>
                    <PlanetInfo>
                      <InfoItem>
                        <FaSatellite />
                        <span>Theme: {planet.theme}</span>
                      </InfoItem>
                      <InfoItem>
                        <FaUsers />
                        <span>Explorers: {planet.viewerCount}</span>
                      </InfoItem>
                      <InfoItem>
                        <FaVideo />
                        <span>Transmission: {planet.hasVideo ? 'Available' : 'None'}</span>
                      </InfoItem>
                      <InfoItem>
                        <FaClock />
                        <span>Created: {formatTimeAgo(planet.createdAt)}</span>
                      </InfoItem>
                    </PlanetInfo>
                    <InfoItem className="text-xs opacity-60">
                      <span>ID: {planet.id}</span>
                    </InfoItem>
                  </PlanetBody>
                  <PlanetFooter>
                    <JoinButton
                      onClick={() => handleJoinPlanet(planet.id)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <FaRocket />
                      Join Planet
                    </JoinButton>
                  </PlanetFooter>
                </PlanetCard>
              ))
            )}
          </PlanetsGrid>
        </motion.div>
      </PlanetsContainer>
    </div>
  );
}

export default Planets; 