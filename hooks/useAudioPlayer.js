import { useState, useRef, useEffect, useCallback } from 'react';

const useAudioPlayer = () => {
  const audioRef = useRef(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none'); // 'none', 'one', 'all'
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [audioData, setAudioData] = useState(null);

  // Audio context for visualizer
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);

  // Initialize audio context for visualizer
  const initializeAudioContext = useCallback(() => {
    if (!audioContextRef.current && audioRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
        
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
        
        analyserRef.current.fftSize = 256;
        const bufferLength = analyserRef.current.frequencyBinCount;
        setAudioData(new Uint8Array(bufferLength));
      } catch (error) {
        console.warn('Web Audio API not supported:', error);
      }
    }
  }, []);

  // Get audio data for visualizer
  const getAudioData = useCallback(() => {
    if (analyserRef.current && audioData) {
      analyserRef.current.getByteFrequencyData(audioData);
      return audioData;
    }
    return null;
  }, [audioData]);

  // Load track
  const loadTrack = useCallback((track, trackIndex = 0) => {
    if (!track || !audioRef.current) return;

    setCurrentTrack(track);
    setCurrentIndex(trackIndex);
    setError(null);
    setIsLoading(true);

    audioRef.current.src = track.src || track.url;
    audioRef.current.load();

    // Initialize audio context on first user interaction
    if (!audioContextRef.current) {
      initializeAudioContext();
    }
  }, [initializeAudioContext]);

  // Play/pause
  const togglePlayPause = useCallback(async () => {
    if (!audioRef.current || !currentTrack) return;

    try {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      setError('Playback failed');
      setIsPlaying(false);
    }
  }, [isPlaying, currentTrack]);

  // Seek to time
  const seekTo = useCallback((time) => {
    if (audioRef.current && !isNaN(time)) {
      audioRef.current.currentTime = Math.max(0, Math.min(time, duration));
      setCurrentTime(audioRef.current.currentTime);
    }
  }, [duration]);

  // Set volume
  const changeVolume = useCallback((newVolume) => {
    const vol = Math.max(0, Math.min(1, newVolume));
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : vol;
    }
  }, [isMuted]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      if (audioRef.current) {
        audioRef.current.volume = newMuted ? 0 : volume;
      }
      return newMuted;
    });
  }, [volume]);

  // Change playback rate
  const changePlaybackRate = useCallback((rate) => {
    const newRate = Math.max(0.25, Math.min(2, rate));
    setPlaybackRate(newRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
  }, []);

  // Play next track
  const playNext = useCallback(() => {
    if (playlist.length === 0) return;

    let nextIndex;
    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = (currentIndex + 1) % playlist.length;
    }

    loadTrack(playlist[nextIndex], nextIndex);
  }, [playlist, currentIndex, isShuffled, loadTrack]);

  // Play previous track
  const playPrevious = useCallback(() => {
    if (playlist.length === 0) return;

    let prevIndex;
    if (currentTime > 3) {
      // If more than 3 seconds played, restart current track
      seekTo(0);
      return;
    }

    if (isShuffled) {
      prevIndex = Math.floor(Math.random() * playlist.length);
    } else {
      prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    }

    loadTrack(playlist[prevIndex], prevIndex);
  }, [playlist, currentIndex, currentTime, isShuffled, loadTrack, seekTo]);

  // Handle track end
  const handleTrackEnd = useCallback(() => {
    setIsPlaying(false);
    
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          setError('Playback failed');
        });
      }
      return;
    }

    if (repeatMode === 'all' || currentIndex < playlist.length - 1) {
      playNext();
    }
  }, [repeatMode, currentIndex, playlist.length, playNext]);

  // Toggle shuffle
  const toggleShuffle = useCallback(() => {
    setIsShuffled(prev => !prev);
  }, []);

  // Toggle repeat mode
  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => {
      switch (prev) {
        case 'none': return 'all';
        case 'all': return 'one';
        case 'one': return 'none';
        default: return 'none';
      }
    });
  }, []);

  // Set playlist
  const setPlaylistTracks = useCallback((tracks) => {
    setPlaylist(tracks);
    if (tracks.length > 0 && !currentTrack) {
      loadTrack(tracks[0], 0);
    }
  }, [currentTrack, loadTrack]);

  // Play track from playlist
  const playTrackAtIndex = useCallback((index) => {
    if (playlist[index]) {
      loadTrack(playlist[index], index);
    }
  }, [playlist, loadTrack]);

  // Format time helper
  const formatTime = useCallback((time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
    }

    const audio = audioRef.current;

    const handleLoadStart = () => setIsLoading(true);
    const handleLoadedData = () => {
      setIsLoading(false);
      setDuration(audio.duration || 0);
      setError(null);
    };
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const handleEnded = () => handleTrackEnd();
    const handleError = (e) => {
      setError('Failed to load audio file');
      setIsLoading(false);
      setIsPlaying(false);
    };
    const handleCanPlay = () => {
      setError(null);
      setIsLoading(false);
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [handleTrackEnd]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    // State
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLoading,
    error,
    playbackRate,
    isShuffled,
    repeatMode,
    playlist,
    currentIndex,
    
    // Actions
    loadTrack,
    togglePlayPause,
    seekTo,
    changeVolume,
    toggleMute,
    changePlaybackRate,
    playNext,
    playPrevious,
    toggleShuffle,
    toggleRepeat,
    setPlaylistTracks,
    playTrackAtIndex,
    
    // Visualizer
    getAudioData,
    
    // Helpers
    formatTime,
    
    // Progress percentage
    progress: duration ? (currentTime / duration) * 100 : 0,
  };
};

export default useAudioPlayer;