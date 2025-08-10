'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Repeat, 
  Shuffle, 
  Heart,
  MoreHorizontal,
  ChevronDown,
  Share
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Slider } from './ui/slider';

const FullScreenPlayer = ({ 
  isOpen, 
  onClose, 
  currentTrack, 
  isPlaying, 
  onPlayPause, 
  onNext, 
  onPrevious,
  currentTime = 0,
  duration = 0,
  onSeek,
  volume = 1,
  onVolumeChange,
  isShuffled = false,
  onShuffle,
  repeatMode = 'none',
  onRepeat,
  onToggleLike
}) => {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef(null);
  const animationRef = useRef();

  // Audio visualizer
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const bars = 64;
    let dataArray = new Array(bars).fill(0);

    const animate = () => {
      if (!isPlaying) {
        // Fade out animation
        dataArray = dataArray.map(val => val * 0.95);
      } else {
        // Generate random visualization data (replace with actual audio analysis)
        dataArray = dataArray.map(() => Math.random() * 255);
      }

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      const barWidth = canvas.offsetWidth / bars;
      
      dataArray.forEach((value, index) => {
        const barHeight = (value / 255) * (canvas.offsetHeight * 0.8);
        const x = index * barWidth;
        const y = (canvas.offsetHeight - barHeight) / 2;
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, '#8B5CF6');
        gradient.addColorStop(0.5, '#06B6D4');
        gradient.addColorStop(1, '#10B981');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth - 1, barHeight);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isOpen, isPlaying]);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (value) => {
    const newTime = (value[0] / 100) * duration;
    onSeek?.(newTime);
  };

  const getRepeatIcon = () => {
    if (repeatMode === 'one') return <Repeat className="w-5 h-5" />;
    return <Repeat className="w-5 h-5" />;
  };

  if (!currentTrack) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"
        >
          {/* Background blur effect */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          
          {/* Header */}
          <div className="relative z-10 flex items-center justify-between p-4 pt-12">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <ChevronDown className="w-6 h-6" />
            </Button>
            
            <div className="text-center">
              <p className="text-white/80 text-sm">Playing from</p>
              <p className="text-white font-medium">My Library</p>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
            >
              <MoreHorizontal className="w-6 h-6" />
            </Button>
          </div>

          {/* Visualizer */}
          <div className="relative mx-4 mb-8">
            <canvas
              ref={canvasRef}
              className="w-full h-32 rounded-lg bg-black/30"
            />
          </div>

          {/* Track Info */}
          <motion.div 
            className="px-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {currentTrack.title?.charAt(0) || '♪'}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h1 className="text-white text-xl font-bold truncate">
                    {currentTrack.title}
                  </h1>
                  <p className="text-white/70 truncate">
                    {currentTrack.artist}
                  </p>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleLike?.(currentTrack.id)}
                  className="text-white hover:bg-white/10"
                >
                  <Heart 
                    className={`w-6 h-6 ${currentTrack.liked ? 'fill-red-500 text-red-500' : ''}`} 
                  />
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Progress Bar */}
          <motion.div 
            className="px-6 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Slider
              value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="w-full mb-2"
            />
            <div className="flex justify-between text-white/70 text-sm">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div 
            className="px-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-center space-x-8">
              <Button
                variant="ghost"
                size="icon"
                onClick={onShuffle}
                className={`text-white hover:bg-white/10 ${isShuffled ? 'text-green-400' : ''}`}
              >
                <Shuffle className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={onPrevious}
                className="text-white hover:bg-white/10"
              >
                <SkipBack className="w-6 h-6" />
              </Button>

              <Button
                onClick={onPlayPause}
                size="icon"
                className="w-16 h-16 bg-white text-black hover:bg-white/90 rounded-full"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8 ml-1" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={onNext}
                className="text-white hover:bg-white/10"
              >
                <SkipForward className="w-6 h-6" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={onRepeat}
                className={`text-white hover:bg-white/10 ${
                  repeatMode !== 'none' ? 'text-green-400' : ''
                }`}
              >
                {getRepeatIcon()}
              </Button>
            </div>
          </motion.div>

          {/* Bottom Actions */}
          <motion.div 
            className="px-6 pb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onMouseEnter={() => setShowVolumeSlider(true)}
                  onMouseLeave={() => setShowVolumeSlider(false)}
                  className="text-white hover:bg-white/10 relative"
                >
                  {volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                  
                  <AnimatePresence>
                    {showVolumeSlider && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="absolute left-12 top-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-sm rounded-lg p-3"
                      >
                        <Slider
                          value={[volume * 100]}
                          onValueChange={(value) => onVolumeChange?.(value[0] / 100)}
                          max={100}
                          className="w-24"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
              >
                <Share className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FullScreenPlayer;