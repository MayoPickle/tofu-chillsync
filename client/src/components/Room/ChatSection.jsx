import React from 'react';
import styled from 'styled-components';
import { FaPaperPlane } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { formatChatTime } from '../../utils/formatTime';
import { Card, CardHeader, CardBody, SystemMessage } from './RoomStyles';

// 聊天区域样式
const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0; /* Required for Firefox */
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(20, 25, 35, 0.3);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(254, 240, 138, 0.3);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(254, 240, 138, 0.5);
  }
`;

const ChatMessage = styled.div`
  padding: 0.75rem;
  border-radius: 8px;
  background-color: rgba(20, 25, 35, 0.5);
  border: 1px solid rgba(254, 240, 138, 0.1);
  transition: all 0.2s ease;
  
  &:hover {
    border-color: rgba(254, 240, 138, 0.25);
    background-color: rgba(30, 35, 45, 0.5);
  }
`;

const MessageSender = styled.span`
  font-weight: 500;
  margin-right: 0.5rem;
  color: var(--space-star, #fef08a);
`;

const MessageTime = styled.span`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  margin-left: auto;
  white-space: nowrap;
`;

const MessageContent = styled.div`
  margin-top: 0.5rem;
  line-height: 1.4;
`;

const ChatForm = styled.form`
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  border-top: 1px solid rgba(254, 240, 138, 0.1);
  background-color: rgba(13, 17, 23, 0.5);
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(254, 240, 138, 0.2);
  border-radius: 8px;
  background-color: rgba(13, 17, 23, 0.7);
  color: #fff;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: var(--space-star, #fef08a);
    outline: none;
    box-shadow: 0 0 10px rgba(254, 240, 138, 0.2);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const ChatSection = ({ 
  chatMessages, 
  messageInput, 
  userName, 
  setMessageInput, 
  handleSendMessage, 
  iconElement 
}) => {
  return (
    <Card style={{ display: 'flex', flexDirection: 'column', height: '400px' }}>
      <CardHeader>
        {iconElement}
        Space Communications 
      </CardHeader>
      <ChatContainer>
        <ChatMessages id="chat-messages">
          {chatMessages.length === 0 ? (
            <div className="text-center p-3 text-gray-400">No communications yet</div>
          ) : (
            <>
              {chatMessages.map(msg => (
                msg.isSystem ? (
                  <SystemMessage key={msg.id}>
                    {msg.message}
                  </SystemMessage>
                ) : (
                  <ChatMessage key={msg.id} className={msg.sender === userName ? "border-space-star/30 ml-auto max-w-[85%]" : "max-w-[85%]"}>
                    <div className="flex justify-between items-center">
                      <MessageSender>
                        {msg.sender} {msg.sender === userName && '(You)'}
                      </MessageSender>
                      <MessageTime>
                        {formatChatTime(msg.timestamp)}
                      </MessageTime>
                    </div>
                    <MessageContent>{msg.message}</MessageContent>
                  </ChatMessage>
                )
              ))}
            </>
          )}
        </ChatMessages>
        
        <ChatForm onSubmit={handleSendMessage}>
          <ChatInput
            type="text"
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
          />
          <motion.button 
            type="submit" 
            className="btn btn-primary flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!messageInput.trim()}
          >
            <FaPaperPlane size={12} />
            Send
          </motion.button>
        </ChatForm>
      </ChatContainer>
    </Card>
  );
};

export default ChatSection; 