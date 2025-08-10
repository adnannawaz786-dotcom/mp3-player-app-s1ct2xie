import React from 'react';
import { motion } from 'framer-motion';
import { Home, Search, Library, Heart, User, Play, Pause, SkipBack, SkipForward, Volume2, Maximize2 } from 'lucide-react';

const Layout = ({ children, currentTrack, isPlaying, onPlayPause, onNext, onPrev, onFullScreen, miniPlayerVisible = false }) => {
  const navItems = [
    { icon: Home, label: 'Home', active: true },
    { icon: Search, label: 'Search', active: false },
    { icon: Library, label: 'Library', active: false },
    { icon: Heart, label: 'Favorites', active: false },
    { icon: User, label: 'Profile', active: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Main Content */}
      <main className={`${miniPlayerVisible ? 'pb-32' : 'pb-20'} transition-all duration-300`}>
        {children}
      </main>

      {/* Mini Player */}
      {miniPlayerVisible && currentTrack && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-white/10 px-4 py-3 z-40"
        >
          <div className="flex items-center justify-between max-w-screen-xl mx-auto">
            {/* Track Info */}
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex-shrink-0 flex items-center justify-center">
                <span className="text-xs font-bold">
                  {currentTrack.title?.charAt(0) || 'M'}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white font-medium text-sm truncate">
                  {currentTrack.title || 'Unknown Track'}
                </p>
                <p className="text-gray-400 text-xs truncate">
                  {currentTrack.artist || 'Unknown Artist'}
                </p>
              </div>
            </div>

            {/* Mini Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onPrev}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <SkipBack size={18} />
              </button>
              
              <button
                onClick={onPlayPause}
                className="p-2 bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>
              
              <button
                onClick={onNext}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <SkipForward size={18} />
              </button>
              
              <button
                onClick={onFullScreen}
                className="p-2 text-gray-400 hover:text-white transition-colors ml-2"
              >
                <Maximize2 size={18} />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-2 max-w-screen-xl mx-auto">
            <div className="w-full bg-gray-700 rounded-full h-1">
              <motion.div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-1 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '35%' }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-white/10 px-4 py-2 z-50">
        <div className="flex items-center justify-around max-w-screen-xl mx-auto">
          {navItems.map((item, index) => (
            <motion.button
              key={item.label}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-all duration-200 ${
                item.active
                  ? 'text-purple-400 bg-purple-400/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={20} />
              <span className="text-xs font-medium">{item.label}</span>
              {item.active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-1 w-1 h-1 bg-purple-400 rounded-full"
                />
              )}
            </motion.button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;