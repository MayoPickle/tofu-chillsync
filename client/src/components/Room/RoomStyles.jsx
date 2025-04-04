import styled from 'styled-components';
import { motion } from 'framer-motion';

// 主容器样式
export const RoomContainer = styled.div`
  padding: 1.5rem 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: calc(100vh - 80px);
`;

export const StarsBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: -1;
`;

export const Star = styled(motion.div)`
  position: absolute;
  background-color: var(--space-star, #fef08a);
  border-radius: 50%;
`;

export const RoomHeader = styled.div`
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

export const RoomTitle = styled.h1`
  font-size: 1.75rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const RoomId = styled.span`
  font-size: 1rem;
  font-weight: normal;
  color: var(--space-star, #fef08a);
  margin-left: 0.5rem;
`;

export const RoomMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
`;

// 卡片和面板样式
export const Card = styled.div`
  background-color: rgba(13, 17, 23, 0.7);
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(254, 240, 138, 0.1);
  overflow: hidden;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(254, 240, 138, 0.15);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 0 25px rgba(254, 240, 138, 0.15);
    transform: translateY(-2px);
  }
`;

export const CardHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid rgba(254, 240, 138, 0.1);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--space-star, #fef08a);
`;

export const CardBody = styled.div`
  padding: 1rem;
`;

export const ControlPanel = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  width: 100%;
`;

// 上传相关样式
export const FileUploadSection = styled.div`
  padding: 1.5rem;
  border: 2px dashed rgba(254, 240, 138, 0.3);
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s ease;
  background-color: rgba(20, 25, 35, 0.3);
  
  &:hover {
    border-color: var(--space-star, #fef08a);
    box-shadow: 0 0 15px rgba(254, 240, 138, 0.2) inset;
  }
`;

export const UploadInput = styled.input`
  display: none;
`;

export const UploadLabel = styled.label`
  cursor: pointer;
  display: block;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  color: #fff;
  
  &:hover {
    color: var(--space-star, #fef08a);
  }
`;

export const ProgressBar = styled.div`
  width: 100%;
  height: 5px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2.5px;
  cursor: pointer;
  position: relative;
  margin-bottom: 0.5rem;
  
  &:hover {
    height: 8px;
    border-radius: 4px;
    
    &::before {
      transform: scale(1.2);
    }
  }
  
  &::before {
    content: '';
    position: absolute;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--space-star, #fef08a);
    top: 50%;
    left: ${props => props.progress || 0}%;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 5px rgba(254, 240, 138, 0.8);
    transition: transform 0.2s ease;
    z-index: 2;
  }
  
  &::after {
    content: '';
    position: absolute;
    height: 100%;
    width: ${props => props.progress || 0}%;
    background: var(--space-star, #fef08a);
    background-image: linear-gradient(to right, rgba(254, 240, 138, 0.8), rgba(254, 240, 138, 1));
    border-radius: inherit;
    z-index: 1;
  }
`;

export const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.progress}%;
  background-color: var(--space-star, #fef08a);
  background-image: linear-gradient(to right, rgba(254, 240, 138, 0.8), rgba(254, 240, 138, 1));
  border-radius: 0.25rem;
  transition: width 0.3s ease;
`;

// 用户名编辑相关样式
export const EditNameButton = styled(motion.button)`
  background: none;
  border: none;
  color: var(--space-star, #fef08a);
  opacity: 0.8;
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: 0.5rem;
  
  &:hover {
    opacity: 1;
    background: rgba(254, 240, 138, 0.1);
  }
`;

export const UserNameEditModal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const ModalContent = styled(motion.div)`
  background-color: rgba(20, 25, 35, 0.9);
  border: 1px solid rgba(254, 240, 138, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  width: 90%;
  max-width: 400px;
  backdrop-filter: blur(10px);
`;

export const ModalHeader = styled.div`
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--space-star, #fef08a);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const ModalInputGroup = styled.div`
  margin-bottom: 1.5rem;
`;

export const ModalLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #fff;
`;

export const ModalInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(254, 240, 138, 0.2);
  border-radius: 8px;
  background-color: rgba(13, 17, 23, 0.7);
  color: #fff;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--space-star, #fef08a);
    box-shadow: 0 0 10px rgba(254, 240, 138, 0.2);
  }
`;

export const ModalButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

export const ModalButton = styled(motion.button)`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  
  &.primary {
    background-color: var(--space-star, #fef08a);
    color: #000;
    border: none;
    
    &:hover {
      background-color: rgba(254, 240, 138, 0.8);
    }
  }
  
  &.secondary {
    background-color: transparent;
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
`;

// 其他控制按钮和通用样式
export const ControlButton = styled(motion.button)`
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  transition: all 0.2s ease;
  border-radius: 50%;
  
  &:hover {
    opacity: 1;
    background: rgba(254, 240, 138, 0.15);
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

// Viewers list styles
export const ViewersDropdown = styled.div`
  position: relative;
  display: inline-block;
`;

export const ViewersButton = styled.button`
  background: rgba(13, 17, 23, 0.7);
  border: 1px solid rgba(254, 240, 138, 0.2);
  border-radius: 20px;
  padding: 0.5rem 1rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(13, 17, 23, 0.9);
    border-color: rgba(254, 240, 138, 0.4);
  }
`;

export const ViewersPanel = styled(motion.div)`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: rgba(13, 17, 23, 0.95);
  border: 1px solid rgba(254, 240, 138, 0.2);
  border-radius: 12px;
  width: 240px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  z-index: 100;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: -6px;
    right: 20px;
    width: 12px;
    height: 12px;
    background: rgba(13, 17, 23, 0.95);
    border-left: 1px solid rgba(254, 240, 138, 0.2);
    border-top: 1px solid rgba(254, 240, 138, 0.2);
    transform: rotate(45deg);
  }
`;

export const ViewersPanelHeader = styled.div`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(254, 240, 138, 0.1);
  font-weight: 500;
  color: var(--space-star, #fef08a);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const ViewersDropdownList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 240px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(13, 17, 23, 0.5);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(254, 240, 138, 0.3);
    border-radius: 2px;
  }
`;

export const ViewersDropdownItem = styled.li`
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(254, 240, 138, 0.05);
  }
  
  &::before {
    content: '';
    display: block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #10b981;
  }
  
  &.you {
    background-color: rgba(254, 240, 138, 0.1);
  }
`;

export const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
  overflow: hidden;
`;

// 系统消息样式
export const SystemMessage = styled.div`
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  background-color: rgba(254, 240, 138, 0.1);
  border: 1px solid rgba(254, 240, 138, 0.15);
  margin: 0.5rem 0;
  text-align: center;
  font-size: 0.9rem;
  color: var(--space-star, #fef08a);
  opacity: 0.8;
`; 