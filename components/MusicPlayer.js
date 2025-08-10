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
  Shuffle, 
  Repeat,
  Heart,
  MoreHorizontal,
  Maximize2,
  Minimize2,
  Music
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

const MusicPlayer = ({ 
  tracks = [], 
  onTrackSelect, 
  isFullscreen = false, 
  onToggleFullscreen 
}) => {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none'); // none, one, all
  const [isLiked, setIsLiked] = useState(false);
  const [visualizerData, setVisualizerData] = useState(Array(64).fill(0));

  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);

  // Default tracks if none provided
  const defaultTracks = [
    {
      id: 1,
      title: 'Midnight Dreams',
      artist: 'Luna Eclipse',
      album: 'Starlight Sessions',
      duration: '3:42',
      cover: '/api/placeholder/300/300',
      src: '/audio/sample1.mp3'
    },
    {
      id: 2,
      title: 'Electric Pulse',
      artist: 'Neon Waves',
      album: 'Digital Horizon',
      duration: '4:15',
      cover: '/api/placeholder/300/300',
      src: '/audio/sample2.mp3'
    },
    {
      id: 3,
      title: 'Ocean Breeze',
      artist: 'Coastal Vibes',
      album: 'Summer Nights',
      duration: '3:28',
      cover: '/api/placeholder/300/300',
      src: '/audio/sample3.mp3'
    }
  ];

  const trackList = tracks.length > 0 ? tracks : defaultTracks;
  const track = trackList[currentTrack];

  // Initialize audio context and analyzer
  useEffect(() => {
    if (audioRef.current && !audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        const source = audioContextRef.current.createMediaElementSource(audioRef.current);
        source.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
        analyserRef.current.fftSize = 128;
      } catch (error) {
        console.warn('Audio context not supported:', error);
      }
    }
  }, []);

  // Visualizer animation
  useEffect(() => {
    if (isPlaying && analyserRef.current) {
      const animate = () => {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        setVisualizerData([...dataArray]);
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setVisualizerData(Array(64).fill(0));
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => handleNext();

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack]);

  const handlePlayPause = async () => {
    if (!audioRef.current) return;

    try {
      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      if (isPlaying) {
        audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Playback error:', error);
    }
  };

  const handleNext = () => {
    let nextTrack;
    if (repeatMode === 'one') {
      nextTrack = currentTrack;
    } else if (isShuffled) {
      nextTrack = Math.floor(Math.random() * trackList.length);
    } else {
      nextTrack = (currentTrack + 1) % trackList.length;
    }
    setCurrentTrack(nextTrack);
    onTrackSelect?.(nextTrack);
  };

  const handlePrevious = () => {
    if (currentTime > 3) {
      audioRef.current.currentTime = 0;
    } else {
      const prevTrack = currentTrack === 0 ? trackList.length - 1 : currentTrack - 1;
      setCurrentTrack(prevTrack);
      onTrackSelect?.(prevTrack);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newVolume = Math.max(0, Math.min(1, percent));
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
  };

  const toggleRepeat = () => {
    const modes = ['none', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    setRepeatMode(modes[(currentIndex + 1) % modes.length]);
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const Visualizer = () => (
    <div className="flex items-end justify-center space-x-1 h-16 bg-gradient-to-t from-purple-900/20 to-transparent rounded-lg p-2">
      {visualizerData.slice(0, 32).map((value, index) => (
        <motion.div
          key={index}
          className="bg-gradient-to-t from-purple-500 to-pink-500 rounded-full min-w-[2px]"
          style={{
            height: `${Math.max(2, (value / 255) * 50)}px`,
            opacity: isPlaying ? 0.8 : 0.3
          }}
          animate={{
            height: isPlaying ? `${Math.max(2, (value / 255) * 50)}px` : '2px'
          }}
          transition={{ duration: 0.1 }}
        />
      ))}
    </div>
  );

  const TrackList = () => (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {trackList.map((trackItem, index) => (
        <motion.div
          key={trackItem.id}
          className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
            index === currentTrack 
              ? 'bg-purple-500/20 border border-purple-500/30' 
              : 'hover:bg-white/5'
          }`}
          onClick={() => {
            setCurrentTrack(index);
            onTrackSelect?.(index);
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            {index === currentTrack && isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {trackItem.title}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {trackItem.artist}
            </p>
          </div>
          <div className="text-xs text-gray-400">
            {trackItem.duration}
          </div>
        </motion.div>
      ))}
    </div>
  );

  if (!track) return null;

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : ''} bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900`}>
      <audio
        ref={audioRef}
        src={track.src}
        volume={volume}
        onLoadStart={() => setIsPlaying(false)}
      />

      <div className={`${isFullscreen ? 'h-full p-6' : 'p-4'} text-white`}>
        <AnimatePresence mode="wait">
          {isFullscreen ? (
            <motion.div
              key="fullscreen"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="h-full flex flex-col"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Now Playing</h1>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleFullscreen}
                  className="text-white hover:bg-white/10"
                >
                  <Minimize2 className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Album Art & Visualizer */}
                <div className="space-y-6">
                  <motion.div
                    className="aspect-square max-w-md mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-1"
                    animate={{ rotate: isPlaying ? 360 : 0 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  >
                    <div className="w-full h-full bg-gray-800 rounded-xl flex items-center justify-center">
                      <Music className="w-20 h-20 text-gray-400" />
                    </div>
                  </motion.div>
                  <Visualizer />
                </div>

                {/* Right Column - Controls & Track List */}
                <div className="space-y-6">
                  {/* Track Info */}
                  <div className="text-center lg:text-left">
                    <h2 className="text-3xl font-bold mb-2">{track.title}</h2>
                    <p className="text-xl text-gray-300 mb-1">{track.artist}</p>
                    <p className="text-gray-400">{track.album}</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div 
                      className="w-full h-2 bg-gray-700 rounded-full cursor-pointer"
                      onClick={handleSeek}
                    >
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center space-x-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleShuffle}
                      className={`${isShuffled ? 'text-purple-400' : 'text-gray-400'} hover:text-white`}
                    >
                      <Shuffle className="w-5 h-5" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="lg"
                      onClick={handlePrevious}
                      className="text-white hover:bg-white/10"
                    >
                      <SkipBack className="w-6 h-6" />
                    </Button>
                    
                    <Button
                      size="lg"
                      onClick={handlePlayPause}
                      className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"