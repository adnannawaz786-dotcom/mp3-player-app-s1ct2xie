import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Slider } from './ui/slider';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Maximize2,
  Heart,
  Shuffle,
  Repeat
} from 'lucide-react';

export default function MiniPlayer({ 
  currentTrack, 
  isPlaying, 
  onPlayPause, 
  onNext, 
  onPrevious,
  onExpandPlayer,
  volume = 50,
  onVolumeChange,
  currentTime = 0,
  duration = 0,
  onSeek,
  isShuffleOn = false,
  isRepeatOn = false,
  onToggleShuffle,
  onToggleRepeat,
  onToggleFavorite,
  isFavorite = false
}) {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const volumeRef = useRef(null);

  // Close volume slider when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (volumeRef.current && !volumeRef.current.contains(event.target)) {
        setShowVolumeSlider(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressChange = (value) => {
    if (onSeek && duration > 0) {
      const newTime = (value[0] / 100) * duration;
      onSeek(newTime);
    }
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!currentTrack) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700"
      >
        <Card className="rounded-none border-0 bg-transparent shadow-none">
          {/* Progress Bar */}
          <div className="px-4 pt-2">
            <Slider
              value={[progressPercentage]}
              onValueChange={handleProgressChange}
              max={100}
              step={0.1}
              className="w-full h-1 cursor-pointer"
              onPointerDown={() => setIsDragging(true)}
              onPointerUp={() => setIsDragging(false)}
            />
          </div>

          <div className="flex items-center justify-between px-4 py-3">
            {/* Track Info */}
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onExpandPlayer}
                className="cursor-pointer"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                  {currentTrack.artwork ? (
                    <img 
                      src={currentTrack.artwork} 
                      alt={currentTrack.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-white font-bold text-lg">
                      {currentTrack.title?.charAt(0) || '♪'}
                    </div>
                  )}
                </div>
              </motion.div>

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                  {currentTrack.title || 'Unknown Track'}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {currentTrack.artist || 'Unknown Artist'}
                </p>
              </div>

              {/* Time Display - Hidden on very small screens */}
              <div className="hidden sm:flex text-xs text-gray-500 dark:text-gray-400 space-x-1">
                <span>{formatTime(currentTime)}</span>
                <span>/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Shuffle - Hidden on mobile */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleShuffle}
                className={`hidden md:flex w-8 h-8 p-0 ${isShuffleOn ? 'text-purple-600' : 'text-gray-600'}`}
              >
                <Shuffle className="w-4 h-4" />
              </Button>

              {/* Previous */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onPrevious}
                className="w-8 h-8 p-0 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <SkipBack className="w-4 h-4" />
              </Button>

              {/* Play/Pause */}
              <Button
                onClick={onPlayPause}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </Button>

              {/* Next */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onNext}
                className="w-8 h-8 p-0 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <SkipForward className="w-4 h-4" />
              </Button>

              {/* Repeat - Hidden on mobile */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleRepeat}
                className={`hidden md:flex w-8 h-8 p-0 ${isRepeatOn ? 'text-purple-600' : 'text-gray-600'}`}
              >
                <Repeat className="w-4 h-4" />
              </Button>
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-2 ml-2">
              {/* Favorite - Hidden on very small screens */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleFavorite}
                className={`hidden sm:flex w-8 h-8 p-0 ${isFavorite ? 'text-red-500' : 'text-gray-600'}`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>

              {/* Volume Control */}
              <div className="relative hidden md:block" ref={volumeRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                  className="w-8 h-8 p-0 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  {volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>

                <AnimatePresence>
                  {showVolumeSlider && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute bottom-full right-0 mb-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="w-24 h-32 flex flex-col items-center">
                        <Slider
                          value={[volume]}
                          onValueChange={(value) => onVolumeChange?.(value[0])}
                          max={100}
                          step={1}
                          orientation="vertical"
                          className="h-24 mb-2"
                        />
                        <span className="text-xs text-gray-500">{volume}%</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Expand Player */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onExpandPlayer}
                className="w-8 h-8 p-0 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}