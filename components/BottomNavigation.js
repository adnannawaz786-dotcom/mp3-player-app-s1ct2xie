'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Home, Music, Search, Library, Settings } from 'lucide-react';

const BottomNavigation = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'music', icon: Music, label: 'Music' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'library', icon: Library, label: 'Library' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="relative flex flex-col items-center justify-center p-2 rounded-lg transition-colors duration-200"
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  color: isActive ? '#8b5cf6' : '#6b7280'
                }}
                transition={{ duration: 0.2 }}
                className="relative z-10"
              >
                <Icon size={20} />
              </motion.div>
              
              <motion.span
                animate={{
                  scale: isActive ? 1 : 0.85,
                  color: isActive ? '#8b5cf6' : '#6b7280',
                  fontWeight: isActive ? 600 : 400
                }}
                transition={{ duration: 0.2 }}
                className="text-xs mt-1 relative z-10"
              >
                {item.label}
              </motion.span>
              
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-500 rounded-full"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default BottomNavigation;