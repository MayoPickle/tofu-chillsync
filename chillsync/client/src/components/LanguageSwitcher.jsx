import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaLanguage } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';

function LanguageSwitcher() {
  const { language, t, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className="relative">
      <motion.button
        className="flex items-center gap-1.5 text-slate-300 hover:text-space-star transition-colors px-2 py-1 rounded-md"
        onClick={toggleDropdown}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={t.language}
      >
        <FaLanguage className="text-lg" />
        <span className="text-sm">{language === 'en' ? 'EN' : 'ZH'}</span>
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 mt-2 py-2 w-32 bg-space-dark border border-primary-900/30 rounded-md shadow-lg backdrop-blur z-50"
        >
          <button
            className={`flex items-center w-full px-4 py-2 text-sm ${language === 'en' ? 'text-space-star' : 'text-slate-300'} hover:bg-space-dark/80 hover:text-space-star`}
            onClick={() => {
              changeLanguage('en');
              setIsOpen(false);
            }}
          >
            {t.english}
          </button>
          <button
            className={`flex items-center w-full px-4 py-2 text-sm ${language === 'zh' ? 'text-space-star' : 'text-slate-300'} hover:bg-space-dark/80 hover:text-space-star`}
            onClick={() => {
              changeLanguage('zh');
              setIsOpen(false);
            }}
          >
            {t.chinese}
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default LanguageSwitcher; 