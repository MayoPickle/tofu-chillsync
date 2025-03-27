import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const CreateRoomContainer = styled.div`
  padding: 3rem 0;
  max-width: 600px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const Card = styled.div`
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  padding: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--grey-color);
  border-radius: var(--border-radius);
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(108, 92, 231, 0.2);
  }
`;

const ErrorMessage = styled.p`
  color: var(--danger-color);
  margin-top: 0.5rem;
  font-size: 0.875rem;
`;

const SuccessMessage = styled.div`
  background-color: var(--success-color);
  color: #2D3436;
  padding: 1rem;
  border-radius: var(--border-radius);
  margin-bottom: 1.5rem;
  font-weight: 500;
`;

const RoomInfo = styled.div`
  background-color: #F8F9FA;
  padding: 1.5rem;
  border-radius: var(--border-radius);
  border: 1px dashed var(--grey-color);
  margin-bottom: 1.5rem;
`;

const RoomId = styled.p`
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.25rem;
  color: var(--primary-color);
  text-align: center;
  margin-bottom: 1rem;
`;

const RoomLink = styled.div`
  background-color: white;
  border: 1px solid var(--grey-color);
  border-radius: var(--border-radius);
  padding: 0.75rem 1rem;
  font-family: monospace;
  margin-bottom: 1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

function CreateRoom() {
  const navigate = useNavigate();
  const [hostName, setHostName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [roomCreated, setRoomCreated] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null);
  
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
          hostName: hostName.trim() || 'Anonymous',
        }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        setError(data.message || 'Failed to create room');
        return;
      }
      
      // Set room info and show success message
      setRoomInfo({
        roomId: data.roomId,
        roomLink: `${window.location.origin}/room/${data.roomId}`,
      });
      setRoomCreated(true);
      
    } catch (error) {
      setError('Failed to create room. Please try again.');
      console.error('Error creating room:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopyLink = () => {
    if (!roomInfo) return;
    
    navigator.clipboard.writeText(roomInfo.roomLink)
      .then(() => {
        alert('Room link copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy link:', err);
      });
  };
  
  const goToRoom = () => {
    if (!roomInfo) return;
    navigate(`/room/${roomInfo.roomId}`, { 
      state: { userName: hostName.trim() || 'Anonymous' } 
    });
  };
  
  return (
    <div className="container">
      <CreateRoomContainer>
        <Title>Create a Watch Room</Title>
        
        <Card>
          {roomCreated ? (
            <>
              <SuccessMessage>
                Room created successfully! Share the room ID or link with your friends.
              </SuccessMessage>
              
              <RoomInfo>
                <Label>Room ID:</Label>
                <RoomId>{roomInfo.roomId}</RoomId>
                
                <Label>Room Link:</Label>
                <RoomLink>{roomInfo.roomLink}</RoomLink>
              </RoomInfo>
              
              <ButtonGroup>
                <button 
                  className="btn btn-outline" 
                  onClick={handleCopyLink}
                  style={{ flex: 1 }}
                >
                  Copy Link
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={goToRoom}
                  style={{ flex: 1 }}
                >
                  Enter Room
                </button>
              </ButtonGroup>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor="hostName">Your Name (optional)</Label>
                <Input
                  id="hostName"
                  type="text"
                  placeholder="Enter your name"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                />
              </FormGroup>
              
              {error && <ErrorMessage>{error}</ErrorMessage>}
              
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isLoading}
                style={{ width: '100%' }}
              >
                {isLoading ? 'Creating Room...' : 'Create Room'}
              </button>
            </form>
          )}
        </Card>
      </CreateRoomContainer>
    </div>
  );
}

export default CreateRoom; 