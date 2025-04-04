import { useState, useEffect, useContext, memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AnimationsContext } from '../App';

// memo化Cat SVG组件
const CatSVG = memo(({ color = "#fff", className = "", ...props }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color} 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={`cat-svg ${className}`} 
    {...props}
  >
    {/* 猫耳朵 */}
    <path d="M3,10 L8,4 L8,10" fill={color} stroke={color} strokeWidth="0.5" />
    <path d="M21,10 L16,4 L16,10" fill={color} stroke={color} strokeWidth="0.5" />
    
    {/* 猫头 */}
    <circle cx="12" cy="12" r="8" fill={color} />
    
    {/* 猫眼睛 */}
    <circle cx="9" cy="10" r="1.2" fill="#333" />
    <circle cx="15" cy="10" r="1.2" fill="#333" />
    <circle cx="8.5" cy="9.5" r="0.4" fill="#fff" />
    <circle cx="14.5" cy="9.5" r="0.4" fill="#fff" />
    
    {/* 猫鼻子 */}
    <path d="M12,12 L12,14" stroke="#333" strokeWidth="1" />
    <circle cx="12" cy="12.5" r="0.6" fill="#ff9999" />
    
    {/* 猫嘴 */}
    <path d="M10.5,14 C11.5,15 12.5,15 13.5,14" stroke="#333" strokeWidth="0.8" fill="none" />
    
    {/* 猫胡须 */}
    <path d="M9,13 L6.5,12.5" stroke="#333" strokeWidth="0.5" />
    <path d="M9,13.5 L6.5,13.5" stroke="#333" strokeWidth="0.5" />
    <path d="M9,14 L6.5,14.5" stroke="#333" strokeWidth="0.5" />
    
    <path d="M15,13 L17.5,12.5" stroke="#333" strokeWidth="0.5" />
    <path d="M15,13.5 L17.5,13.5" stroke="#333" strokeWidth="0.5" />
    <path d="M15,14 L17.5,14.5" stroke="#333" strokeWidth="0.5" />
  </svg>
));

CatSVG.displayName = 'CatSVG';

// memo化Tofu SVG组件
const TofuSVG = memo(({ color = "#fff", className = "", ...props }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill={color}
    className={className} 
    {...props}
  >
    {/* 豆腐主体 */}
    <rect x="2" y="2" width="20" height="20" rx="4" ry="4" fill={color} stroke="#AAA" strokeWidth="0.5" />
    
    {/* 豆腐纹理 */}
    <rect x="5" y="5" width="5" height="5" rx="1" fill="#EEE" opacity="0.6" />
    <rect x="14" y="5" width="5" height="5" rx="1" fill="#EEE" opacity="0.6" />
    <rect x="5" y="14" width="5" height="5" rx="1" fill="#EEE" opacity="0.6" />
    <rect x="14" y="14" width="5" height="5" rx="1" fill="#EEE" opacity="0.6" />
    
    {/* 豆腐笑脸 */}
    <circle cx="9" cy="12" r="1" fill="#555" />
    <circle cx="15" cy="12" r="1" fill="#555" />
    <path d="M9,16 C10.5,18 13.5,18 15,16" stroke="#555" strokeWidth="0.8" fill="none" />
  </svg>
));

TofuSVG.displayName = 'TofuSVG';

// 随机生成柔和的颜色
const pastelColors = [
  '#FFD6E0', // 粉红
  '#FFEFCF', // 淡黄
  '#D4F0F0', // 淡蓝
  '#E2F0CB', // 淡绿
  '#F0D1FF', // 淡紫
  '#FFCBC4', // 淡橙
  '#C9C9FF', // 淡蓝紫
  '#D6EDFF', // 天蓝
  '#FFE1EF', // 粉色
  '#E2F5CD', // 浅绿色
  '#FFE0C2', // 杏色
  '#B5EAD7', // 薄荷
];

const getRandomColor = () => {
  return pastelColors[Math.floor(Math.random() * pastelColors.length)];
};

// 单个流星组件，独立提取出来进行优化
const Meteor = memo(({ meteor, startX, endX }) => {
  return (
    <motion.div
      className="absolute"
      style={{ 
        top: `${meteor.position}%`,
        left: 0,
      }}
      initial={{ 
        x: startX,
        scale: meteor.scale,
      }}
      animate={{ 
        x: endX,
        y: [0, -meteor.bounce, 0],
      }}
      transition={{ 
        x: {
          duration: meteor.duration,
          delay: meteor.delay,
          repeat: Infinity,
          repeatDelay: Math.random() * 40 + 60, // 大幅增加延迟
          ease: "linear",
        },
        y: {
          duration: meteor.duration / 2,
          repeat: 1,
          repeatType: "reverse",
          ease: "easeInOut",
        }
      }}
    >
      <motion.div
        animate={{ 
          rotate: [0, 10, 0, -10, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {meteor.type === 'cat' ? (
          <CatSVG 
            width={meteor.size} 
            height={meteor.size} 
            color={meteor.color} 
            className="filter drop-shadow-lg"
          />
        ) : (
          <TofuSVG 
            width={meteor.size} 
            height={meteor.size} 
            color={meteor.color} 
            className="filter drop-shadow-lg"
          />
        )}
      </motion.div>
    </motion.div>
  );
});

Meteor.displayName = 'Meteor';

const CatTofuMeteors = memo(() => {
  const [meteors, setMeteors] = useState([]);
  const shouldReduceMotion = useReducedMotion();
  const { enabled: animationsEnabled } = useContext(AnimationsContext);
  
  // 如果用户系统设置为减少动画或用户已关闭动画，则不显示
  const showAnimations = !shouldReduceMotion && animationsEnabled;
  
  // 随机生成一定数量的流星，仅在组件挂载时计算一次
  useEffect(() => {
    // 如果不显示动画，则不生成流星
    if (!showAnimations) return;
    
    // 生成3-4个飞行物，大幅减少数量
    const meteorCount = Math.floor(Math.random() * 2) + 3;
    const newMeteors = Array.from({ length: meteorCount }, (_, index) => ({
      id: index,
      type: Math.random() > 0.5 ? 'cat' : 'tofu',
      size: Math.random() * 30 + 20, // 20-50px
      position: Math.random() * 100, // 垂直位置百分比
      delay: Math.random() * 30, // 延迟0-30秒
      duration: Math.random() * 15 + 15, // 动画持续15-30秒，增加时长减少频率
      direction: Math.random() > 0.5 ? 'left-to-right' : 'right-to-left',
      color: getRandomColor(),
      scale: Math.random() * 0.5 + 0.8, // 缩放比例0.8-1.3
      bounce: Math.random() * 50 + 20, // 减小弹跳高度
    }));
    
    setMeteors(newMeteors);
  }, [showAnimations]);
  
  // 如果不显示动画或没有流星，返回null
  if (!showAnimations || meteors.length === 0) return null;
  
  return (
    <div className="cat-tofu-container fixed inset-0 overflow-hidden pointer-events-none z-0">
      {meteors.map((meteor) => {
        // 确定起点和终点
        const startX = meteor.direction === 'left-to-right' ? -100 : window.innerWidth + 100;
        const endX = meteor.direction === 'left-to-right' ? window.innerWidth + 100 : -100;
        
        return (
          <Meteor 
            key={meteor.id} 
            meteor={meteor} 
            startX={startX} 
            endX={endX} 
          />
        );
      })}
    </div>
  );
});

CatTofuMeteors.displayName = 'CatTofuMeteors';

export default CatTofuMeteors; 