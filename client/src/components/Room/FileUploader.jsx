import React from 'react';
import { motion } from 'framer-motion';
import { FaUpload } from 'react-icons/fa';
import { 
  Card, 
  CardHeader, 
  CardBody,
  FileUploadSection,
  UploadInput,
  UploadLabel,
  ProgressBar,
  ProgressFill
} from './RoomStyles';
import { useLanguage } from '../../contexts/LanguageContext';

const FileUploader = ({ 
  roomId, 
  room, 
  isUploading, 
  uploadProgress, 
  setIsUploading, 
  setUploadProgress, 
  setRoom
}) => {
  const { t } = useLanguage();
  
  // 处理文件上传
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // 检查文件扩展名和类型
    const fileName = file.name.toLowerCase();
    const fileExt = fileName.substring(fileName.lastIndexOf('.') + 1);
    
    // 验证文件类型，接受指定MIME类型或者.mkv扩展名的文件
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/x-matroska'];
    const validExtensions = ['mp4', 'webm', 'ogg', 'mkv'];
    
    if (!validTypes.includes(file.type) && !(fileExt === 'mkv')) {
      alert('Only MP4, WebM, OGG, and MKV video formats are supported');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    const formData = new FormData();
    
    // 添加额外的文件名信息，确保中文文件名能正确传递
    formData.append('video', file);
    
    try {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setIsUploading(false);
          setRoom(prev => ({ ...prev, videoInfo: response.videoInfo }));
        } else {
          setIsUploading(false);
          alert('Upload failed');
        }
      });
      
      xhr.addEventListener('error', () => {
        setIsUploading(false);
        alert('Upload failed');
      });
      
      // 设置请求头，指定编码格式
      xhr.open('POST', `/api/rooms/${roomId}/upload`);
      xhr.send(formData);
      
    } catch (error) {
      console.error('Error uploading file:', error);
      setIsUploading(false);
      alert('Failed to upload video');
    }
  };

  return (
    <Card>
      <CardHeader>
        <FaUpload />
        {t.chooseFile}
      </CardHeader>
      <CardBody>
        <FileUploadSection>
          <UploadInput
            id="video-upload"
            type="file"
            accept="video/mp4,video/webm,video/ogg,video/x-matroska,.mkv"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <UploadLabel htmlFor="video-upload" className="flex items-center justify-center gap-2">
              <FaUpload className="mr-1" />
              {isUploading ? 
                t.uploading : 
                room.videoInfo ? 
                  'Change transmission' : 
                  t.selectFile
              }
            </UploadLabel>
          </motion.div>
          
          {room.videoInfo && !isUploading && (
            <div className="mt-3 p-3 rounded-lg bg-gray-800/30 border border-space-star/10">
              <p style={{ marginBottom: '0.5rem', fontWeight: '500' }} className="text-space-star/80">Current transmission:</p>
              <p style={{ fontSize: '0.9rem' }} className="truncate">
                {decodeURIComponent(room.videoInfo.originalName)}
              </p>
              
              {/* 显示文件的详细参数 */}
              <div className="mt-2 pt-2 border-t border-space-star/10 text-xs text-gray-400 space-y-1">
                <div className="flex justify-between">
                  <span>文件类型:</span>
                  <span className="text-space-star/70">{room.videoInfo.mimeType}</span>
                </div>
                <div className="flex justify-between">
                  <span>文件大小:</span>
                  <span className="text-space-star/70">{(room.videoInfo.size / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
                <div className="flex justify-between">
                  <span>文件名:</span>
                  <span className="text-space-star/70 truncate max-w-[180px]">{room.videoInfo.fileName}</span>
                </div>
              </div>
            </div>
          )}
          
          {isUploading && (
            <div className="mt-3">
              <ProgressBar>
                <ProgressFill progress={uploadProgress} />
              </ProgressBar>
              <div className="text-space-star">{uploadProgress}%</div>
            </div>
          )}
        </FileUploadSection>
      </CardBody>
    </Card>
  );
};

export default FileUploader; 