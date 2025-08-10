import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat, List, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const sampleTracks = [
  {
    id: 1,
    title: 'Midnight Dreams',
    artist: 'Luna Echo',
    duration: '3:45',
    url: '/audio/sample1.mp3',
    cover: '/images/cover1.jpg'
  },
  {
    id: 2,
    title: 'Electric Sunset',
    artist: 'Neon Waves',
    duration: '4:12',
    url: '/audio/sample2.mp3',
    cover: '/images/cover2.jpg'
  },
  {
    id: 3,
    title: 'Ocean Breeze',
    artist: 'Coastal Vibes',
    duration: '3:28',
    url: '/audio/sample3.mp3',
    cover: '/images/cover3.jpg'
  },
  {
    id: 4,
    title: 'Urban Nights',
    artist: 'City Sounds',
    duration: '4:05',
    url: '/audio/sample4.mp3',
    cover: '/images/cover4.jpg'
  },
  {
    id: 5,
    title: 'Mountain High',
    artist: 'Alpine Acoustics',
    duration: '3:52',
    url: '/audio/sample5.mp3',
    cover: '/images/cover5.jpg'
  }
];

const AudioVisualizer = ({ isPlaying, audioRef }) => {
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      if (!sourceRef.current) {
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
      }
    }

    const draw = () => {
      if (!isPlaying) return;
      
      requestAnimationFrame(draw);
      
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / dataArrayRef.current.length) * 2.5;
      let barHeight;
      let x = 0;
      
      for (let i = 0; i < dataArrayRef.current.length; i++) {
        barHeight = (dataArrayRef.current[i] / 255) * canvas.height;
        
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, '#8b5cf6');
        gradient.addColorStop(1, '#06b6d4');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    };

    if (isPlaying) {
      draw();
    }
  }, [isPlaying, audioRef]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={200}
      className="w-full h-48 rounded-lg bg-gradient-to-br from-purple-900/20 to-cyan-900/20 backdrop-blur-sm"
    />
  );
};

const TrackList = ({ tracks, currentTrack, onTrackSelect, isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="w-full max-w-md"
        >
          <Card className="p-4 bg-white/10 backdrop-blur-md border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Playlist</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {tracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onTrackSelect(index)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    currentTrack === index
                      ? 'bg-purple-500/30 border border-purple-400/50'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{track.title}</p>
                      <p className="text-gray-300 text-sm truncate">{track.artist}</p>
                    </div>
                    <Badge variant="secondary" className="bg-white/10 text-white">
                      {track.duration}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const MiniPlayer = ({ track, isPlaying, onTogglePlay, isVisible, onMaximize }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 z-40"
        >
          <Card className="p-3 bg-black/80 backdrop-blur-md border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{track?.title}</p>
                <p className="text-gray-300 text-sm truncate">{track?.artist}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onTogglePlay}
                  className="text-white hover:bg-white/10"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMaximize}
                  className="text-white hover:bg-white/10"
                >
                  <Maximize2 size={20} />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const FullScreenPlayer = ({ track, isPlaying, onTogglePlay, isVisible, onMinimize, onNext, onPrevious }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900 flex flex-col items-center justify-center p-6"
        >
          <div className="absolute top-6 right-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMinimize}
              className="text-white hover:bg-white/10"
            >
              <Minimize2 size={24} />
            </Button>
          </div>
          
          <div className="text-center mb-8">
            <div className="w-64 h-64 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 shadow-2xl"></div>
            <h1 className="text-3xl font-bold text-white mb-2">{track?.title}</h1>
            <p className="text-xl text-gray-300">{track?.artist}</p>
          </div>
          
          <div className="flex items-center space-x-6 mb-8">
            <Button
              variant="ghost"
              size="lg"
              onClick={onPrevious}
              className="text-white hover:bg-white/10"
            >
              <SkipBack size={32} />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={onTogglePlay}
              className="text-white hover:bg-white/10 bg-white/20 rounded-full p-4"
            >
              {isPlaying ? <Pause size={40} /> : <Play size={40} />}
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={onNext}
              className="text-white hover:bg-white/10"
            >
              <SkipForward size={32} />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const BottomNavigation = ({ activeView, onViewChange }) => {
  const navItems = [
    { id: 'player', icon: Play, label: 'Player' },
    { id: 'playlist', icon: List, label: 'Playlist' },
    { id: 'visualizer', icon: Volume2, label: 'Visualizer' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-black/80 backdrop-blur-md border-t border-white/20">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            onClick={() => onViewChange(item.id)}
            className={`flex flex-col items-center space-y-1 text-xs ${
              activeView === item.id ? 'text-purple-400' : 'text-gray-400'
            }`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default function Home() {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0); // 0: off, 1: all, 2: one
  const [activeView, setActiveView] = useState('player');
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  
  const audioRef = useRef(null);

  const currentTrackData = sampleTracks[currentTrack];

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    if (isShuffled) {
      const randomIndex = Math.floor(Math.random() * sampleTracks.length);
      setCurrentTrack(randomIndex);
    } else {
      setCurrentTrack((prev) => (prev + 1) % sampleTracks.length);
    }
  };

  const previousTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + sampleTracks.length) % sampleTracks.length);
  };

  const selectTrack = (index) => {
    setCurrentTrack(index);
    setIsPlaying(false);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
  };

  const toggleRepeat = () => {
    setRepeatMode((prev) => (prev + 1) % 3);
  };

  const handleViewChange = (view) => {
    setActiveView(view);
    if (view === 'player') {
      setShowFullScreen(true);
      setShowMiniPlayer(false);
    } else {
      setShowFullScreen(false);
      setShowMiniPlayer(true);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      const handleEnded = () => {
        if (repeatMode === 2) {
          audioRef.current.play();
        } else if (repeatMode === 1 || currentTrack < sampleTracks.length - 1) {
          nextTrack();
        } else {
          setIsPlaying(false);
        }
      };

      audioRef.current.addEventListener('ended', handleEnded);
      
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('ended', handleEnded);
        }
      };
    }
  }, [repeatMode, currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = currentTrackData.url;
      audioRef.current.load();
    }
  }, [currentTrack]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900">
      <audio ref={audioRef} />
      
      <div className="container mx-auto px-4 py-8 pb-24">
        {/* Main Player Interface */}
        <div className="flex flex-col items-center space-y-8">
          {/* Current Track Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-48 h-48 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 shadow-2xl"></div>
            <h1 className="text-2xl font-bold text-white mb-2">{currentTrackData.title}</h1>
            <p className="text-lg text-gray-300">{currentTrackData.artist}</p>
          </motion.div>

          {/* Player Controls */}
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="lg"
              onClick={toggleShuffle}
              className={`text-white hover:bg-white/10 ${
                isShuffled ? 'text-purple-400' : ''
              }`}
            >
              <Shuffle size={24} />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={previousTrack}
              className="text-white hover:bg-white/10"
            >
              <SkipBack size={32} />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={togglePlay}
              className="text-white hover:bg-white/10 bg-white/20 rounded-full p-4"
            >
              {isPlaying ? <Pause size={40} /> : <Play size={40} />}
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={nextTrack}
              className="text-white hover:bg-white/10"
            >
              <SkipForward size={32} />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={toggleRepeat}
              className={`text-white hover:bg-white/10 ${
                repeatMode > 0 ? 'text-purple-400' : ''
              }`}
            >
              <Repeat size={24} />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="text-white hover:bg-white/10"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </Button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-32 accent-purple-500"
            />
          </div>

          {/* Audio Visualizer */}
          {activeView === 'visualizer' && (
            <AudioVisualizer isPlaying={isPlaying} audioRef={audioRef} />
          )}

          {/* Track List */}
          <TrackList
            tracks={sampleTracks}
            currentTrack={currentTrack}
            onTrackSelect={selectTrack}
            isVisible={activeView === 'playlist'}
          />
        </div>
      </div>

      {/* Full Screen Player */}
      <FullScreenPlayer
        track={currentTrackData}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        isVisible={showFullScreen}
        onMinimize={() => setShowFullScreen(false)}
        onNext={nextTrack}
        onPrevious={previousTrack}
      />

      {/* Mini Player */}
      <MiniPlayer
        track={currentTrackData}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        isVisible={showMiniPlayer}
        onMaximize={() => setShowFullScreen(true)}
      />

      {/* Bottom Navigation */}
      <BottomNavigation
        activeView={activeView}
        onViewChange={handleViewChange}
      />
    </div>
  );
}