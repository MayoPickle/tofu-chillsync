import React, { useState } from 'react';
import { FaUsers } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { 
  ViewersDropdown,
  ViewersButton,
  ViewersPanel,
  ViewersPanelHeader,
  ViewersDropdownList,
  ViewersDropdownItem
} from './RoomStyles';

const ViewersList = ({ viewers, socketRef }) => {
  const [showViewers, setShowViewers] = useState(false);
  
  // 切换观众列表显示
  const toggleViewersDropdown = () => {
    setShowViewers(!showViewers);
  };
  
  return (
    <ViewersDropdown>
      <ViewersButton onClick={toggleViewersDropdown}>
        <FaUsers className="text-space-star" />
        <span>{viewers.length} explorer{viewers.length !== 1 ? 's' : ''}</span>
      </ViewersButton>
      
      {showViewers && (
        <ViewersPanel
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <ViewersPanelHeader>
            <span>Explorers Online</span>
            <span className="text-sm">{viewers.length}</span>
          </ViewersPanelHeader>
          <ViewersDropdownList>
            {viewers.length === 0 ? (
              <div className="p-3 text-sm text-center text-gray-400">No explorers connected</div>
            ) : (
              viewers.map(viewer => (
                <ViewersDropdownItem 
                  key={viewer.id} 
                  className={viewer.id === socketRef.current?.id ? "you" : ""}
                >
                  {viewer.name}
                  {viewer.id === socketRef.current?.id && (
                    <span className="ml-auto text-xs px-2 py-0.5 bg-space-star/20 rounded-full text-space-star">You</span>
                  )}
                </ViewersDropdownItem>
              ))
            )}
          </ViewersDropdownList>
        </ViewersPanel>
      )}
    </ViewersDropdown>
  );
};

export default ViewersList; 