import React, { useState } from 'react';
import { FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import { 
  EditNameButton,
  UserNameEditModal,
  ModalContent,
  ModalHeader,
  ModalInputGroup,
  ModalLabel,
  ModalInput,
  ModalButtonGroup,
  ModalButton
} from './RoomStyles';
import Cookies from 'js-cookie';

const UserNameEditor = ({ userName, setUserName, roomId, socketRef, setViewers, setChatMessages }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [newUserName, setNewUserName] = useState('');

  // 处理编辑按钮点击
  const handleEditUserName = () => {
    setNewUserName(userName);
    setIsEditingName(true);
  };
  
  // 处理保存用户名
  const handleSaveUserName = () => {
    if (newUserName.trim()) {
      const trimmedName = newUserName.trim();
      const oldUserName = userName;
      
      // 更新本地状态
      setUserName(trimmedName);
      
      // 保存到cookie
      const cookieKey = `chillsync_room_${roomId}_user`;
      Cookies.set(cookieKey, trimmedName, { expires: 7 });
      
      // 通知服务器用户改名
      if (socketRef.current) {
        socketRef.current.emit('userNameChanged', { 
          roomId, 
          oldUserName, 
          newUserName: trimmedName
        });
        
        // 更新viewer列表中自己的名称
        setViewers(prevViewers => 
          prevViewers.map(viewer => 
            viewer.id === socketRef.current.id
              ? { ...viewer, name: trimmedName }
              : viewer
          )
        );
        
        // 添加一条系统消息
        const systemMessage = {
          id: Date.now(),
          sender: 'System',
          message: `${oldUserName} 修改名称为 ${trimmedName}`,
          timestamp: new Date(),
          isSystem: true
        };
        
        setChatMessages(prev => [...prev, systemMessage]);
      }
    }
    
    setIsEditingName(false);
  };
  
  // 处理取消编辑
  const handleCancelEditName = () => {
    setIsEditingName(false);
  };

  return (
    <>
      <div className="flex items-center">
        <span className="text-space-star/80">您的名称: {userName}</span>
        <EditNameButton 
          onClick={handleEditUserName}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaEdit size={10} />
          修改
        </EditNameButton>
      </div>

      {isEditingName && (
        <UserNameEditModal
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ModalContent
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <ModalHeader>
              <FaEdit />
              修改您的探索者名称
            </ModalHeader>
            
            <ModalInputGroup>
              <ModalLabel>探索者名称</ModalLabel>
              <ModalInput
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                autoFocus
                maxLength={20}
                placeholder="输入您的名称"
              />
            </ModalInputGroup>
            
            <ModalButtonGroup>
              <ModalButton
                className="secondary"
                onClick={handleCancelEditName}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaTimes size={12} />
                取消
              </ModalButton>
              
              <ModalButton
                className="primary"
                onClick={handleSaveUserName}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!newUserName.trim()}
              >
                <FaCheck size={12} />
                保存
              </ModalButton>
            </ModalButtonGroup>
          </ModalContent>
        </UserNameEditModal>
      )}
    </>
  );
};

export default UserNameEditor; 