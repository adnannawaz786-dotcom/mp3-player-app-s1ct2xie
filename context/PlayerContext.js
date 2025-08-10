'use client';

import { createContext, useContext, useReducer, useRef, useEffect } from 'react';

// Initial state
const initialState = {
  currentTrack: null,
  tracks: [
    {
      id: 1,
      title: 'Sample Track 1',
      artist: 'Artist 1',
      duration: '3:45',
      url: '/audio/sample1.mp3',
      cover: '/images/cover1.jpg'
    },
    {
      id: 2,
      title: 'Sample Track 2',
      artist: 'Artist 2',
      duration: '4:12',
      url: '/audio/sample2.mp3',
      cover: '/images/cover2.jpg'
    },
    {
      id: 3,
      title: 'Sample Track 3',
      artist: 'Artist 3',
      duration: '3:28',
      url: '/audio/sample3.mp3',
      cover: '/images/cover3.jpg'
    }
  ],
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isMuted: false,
  isShuffled: false,
  repeatMode: 'off', // 'off', 'one', 'all'
  isFullscreen: false,
  showMiniPlayer: false,
  visualizerData: new Array(64).fill(0),
  isLoading: false,
  error: null
};

// Action types
const actionTypes = {
  SET_CURRENT_TRACK: 'SET_CURRENT_TRACK',
  SET_TRACKS: 'SET_TRACKS',
  TOGGLE_PLAY: 'TOGGLE_PLAY',
  SET_PLAYING: 'SET_PLAYING',
  SET_CURRENT_TIME: 'SET_CURRENT_TIME',
  SET_DURATION: 'SET_DURATION',
  SET_VOLUME: 'SET_VOLUME',
  TOGGLE_MUTE: 'TOGGLE_MUTE',
  TOGGLE_SHUFFLE: 'TOGGLE_SHUFFLE',
  SET_REPEAT_MODE: 'SET_REPEAT_MODE',
  TOGGLE_FULLSCREEN: 'TOGGLE_FULLSCREEN',
  TOGGLE_MINI_PLAYER: 'TOGGLE_MINI_PLAYER',
  SET_VISUALIZER_DATA: 'SET_VISUALIZER_DATA',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  NEXT_TRACK: 'NEXT_TRACK',
  PREVIOUS_TRACK: 'PREVIOUS_TRACK',
  SEEK_TO: 'SEEK_TO'
};

// Reducer function
function playerReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_CURRENT_TRACK:
      return {
        ...state,
        currentTrack: action.payload,
        showMiniPlayer: action.payload !== null
      };

    case actionTypes.SET_TRACKS:
      return {
        ...state,
        tracks: action.payload
      };

    case actionTypes.TOGGLE_PLAY:
      return {
        ...state,
        isPlaying: !state.isPlaying
      };

    case actionTypes.SET_PLAYING:
      return {
        ...state,
        isPlaying: action.payload
      };

    case actionTypes.SET_CURRENT_TIME:
      return {
        ...state,
        currentTime: action.payload
      };

    case actionTypes.SET_DURATION:
      return {
        ...state,
        duration: action.payload
      };

    case actionTypes.SET_VOLUME:
      return {
        ...state,
        volume: action.payload,
        isMuted: action.payload === 0
      };

    case actionTypes.TOGGLE_MUTE:
      return {
        ...state,
        isMuted: !state.isMuted
      };

    case actionTypes.TOGGLE_SHUFFLE:
      return {
        ...state,
        isShuffled: !state.isShuffled
      };

    case actionTypes.SET_REPEAT_MODE:
      const modes = ['off', 'one', 'all'];
      const currentIndex = modes.indexOf(state.repeatMode);
      const nextIndex = (currentIndex + 1) % modes.length;
      return {
        ...state,
        repeatMode: modes[nextIndex]
      };

    case actionTypes.TOGGLE_FULLSCREEN:
      return {
        ...state,
        isFullscreen: !state.isFullscreen
      };

    case actionTypes.TOGGLE_MINI_PLAYER:
      return {
        ...state,
        showMiniPlayer: !state.showMiniPlayer
      };

    case actionTypes.SET_VISUALIZER_DATA:
      return {
        ...state,
        visualizerData: action.payload
      };

    case actionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case actionTypes.NEXT_TRACK:
      if (!state.currentTrack || state.tracks.length === 0) return state;
      
      const currentIndex = state.tracks.findIndex(track => track.id === state.currentTrack.id);
      let nextIndex;
      
      if (state.isShuffled) {
        nextIndex = Math.floor(Math.random() * state.tracks.length);
      } else if (state.repeatMode === 'one') {
        nextIndex = currentIndex;
      } else if (state.repeatMode === 'all') {
        nextIndex = (currentIndex + 1) % state.tracks.length;
      } else {
        nextIndex = currentIndex + 1;
        if (nextIndex >= state.tracks.length) {
          return {
            ...state,
            isPlaying: false
          };
        }
      }
      
      return {
        ...state,
        currentTrack: state.tracks[nextIndex],
        currentTime: 0
      };

    case actionTypes.PREVIOUS_TRACK:
      if (!state.currentTrack || state.tracks.length === 0) return state;
      
      const prevCurrentIndex = state.tracks.findIndex(track => track.id === state.currentTrack.id);
      let prevIndex;
      
      if (state.currentTime > 3) {
        // If more than 3 seconds played, restart current track
        return {
          ...state,
          currentTime: 0
        };
      }
      
      if (state.isShuffled) {
        prevIndex = Math.floor(Math.random() * state.tracks.length);
      } else {
        prevIndex = prevCurrentIndex - 1;
        if (prevIndex < 0) {
          if (state.repeatMode === 'all') {
            prevIndex = state.tracks.length - 1;
          } else {
            return {
              ...state,
              currentTime: 0,
              isPlaying: false
            };
          }
        }
      }
      
      return {
        ...state,
        currentTrack: state.tracks[prevIndex],
        currentTime: 0
      };

    case actionTypes.SEEK_TO:
      return {
        ...state,
        currentTime: action.payload
      };

    default:
      return state;
  }
}

// Create context
const PlayerContext = createContext();

// Provider component
export function PlayerProvider({ children }) {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  const audioRef = useRef(null);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);
  const animationFrameRef = useRef(null);
  const isSeekingRef = useRef(false);

  // Update visualizer data
  const updateVisualizerData = () => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      dispatch({
        type: actionTypes.SET_VISUALIZER_DATA,
        payload: Array.from(dataArray)
      });
    }
    
    if (state.isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateVisualizerData);
    }
  };

  // Initialize audio context and analyser
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      
      // Audio event listeners
      const audio = audioRef.current;
      
      const handleLoadStart = () => dispatch({ type: actionTypes.SET_LOADING, payload: true });
      const handleCanPlay = () => dispatch({ type: actionTypes.SET_LOADING, payload: false });
      const handleDurationChange = () => {
        dispatch({ type: actionTypes.SET_DURATION, payload: audio.duration || 0 });
      };
      const handleTimeUpdate = () => {
        if (!isSeekingRef.current) {
          dispatch({ type: actionTypes.SET_CURRENT_TIME, payload: audio.currentTime });
        }
      };
      const handleEnded = () => {
        dispatch({ type: actionTypes.NEXT_TRACK });
      };
      const handleError = () => {
        dispatch({ type: actionTypes.SET_ERROR, payload: 'Failed to load audio' });
      };

      audio.addEventListener('loadstart', handleLoadStart);
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('durationchange', handleDurationChange);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);

      return () => {
        audio.removeEventListener('loadstart', handleLoadStart);
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('durationchange', handleDurationChange);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, []);

  // Initialize Web Audio API for visualizer
  const initializeAudioContext = async () => {
    if (!audioContextRef.current && audioRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
        
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
        
        analyserRef.current.fftSize = 128;
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
      }
    }
  };

  // Handle track change
  useEffect(() => {
    if (state.currentTrack && audioRef.current) {
      audioRef.current.src = state.currentTrack.url;
      audioRef.current.load();
    }
  }, [state.currentTrack]);

  // Handle play/pause
  useEffect(() => {
    if (audioRef.current) {
      if (state.isPlaying) {
        initializeAudioContext();
        audioRef.current.play().catch(console.error);
        updateVisualizerData();
      } else {
        audioRef.current.pause();
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      }
    }
  }, [state.isPlaying]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.isMuted ? 0 : state.volume;
    }
  }, [state.volume, state.isMuted]);

  // Handle seeking
  useEffect(() => {
    if (audioRef.current && isSeekingRef.current) {
      audioRef.current.currentTime = state.currentTime;
      isSeekingRef.current = false;
    }
  }, [state.currentTime]);

  // Action creators
  const actions = {
    setCurrentTrack: (track) => dispatch({ type: actionTypes.SET_CURRENT_TRACK, payload: track }),
    setTracks: (tracks) => dispatch({ type: actionTypes.SET_TRACKS, payload: tracks }),
    togglePlay: () => dispatch({ type: actionTypes.TOGGLE_PLAY }),
    setPlaying: (playing) => dispatch({ type: actionTypes.SET_PLAYING, payload: playing }),
    setVolume: (volume) => dispatch({ type: actionTypes.SET_VOLUME, payload: volume }),
    toggleMute: () => dispatch({ type: actionTypes.TOGGLE_MUTE }),
    toggleShuffle: () => dispatch({ type: actionTypes.TOGGLE_SHUFFLE }),
    setRepeatMode: () => dispatch({ type: actionTypes.SET_REPEAT_MODE }),
    toggleFullscreen: () => dispatch({ type: actionTypes.TOGGLE_FULLSCREEN }),
    toggleMiniPlayer: () => dispatch({ type: actionTypes.TOGGLE_MINI_PLAYER }),
    nextTrack: () => dispatch({ type: actionTypes.NEXT_TRACK }),
    previousTrack: () => dispatch({ type: actionTypes.PREVIOUS_TRACK }),
    seekTo: (time) => {
      isSeekingRef.current = true;
      dispatch({ type: actionTypes.SEEK_TO, payload: time });
    },
    setError: (error) => dispatch({ type: actionTypes.SET_ERROR, payload: error })
  };

  const value = {
    ...state,
    ...actions,
    audioRef
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}

// Custom hook to use player context
export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}

export default PlayerContext;