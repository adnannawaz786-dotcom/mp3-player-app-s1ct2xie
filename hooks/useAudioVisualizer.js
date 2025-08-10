import { useRef, useEffect, useState, useCallback } from 'react';

export const useAudioVisualizer = (audioElement, isPlaying) => {
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationRef = useRef(null);
  const dataArrayRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeAudioContext = useCallback(async () => {
    if (!audioElement || isInitialized) return;

    try {
      // Create audio context
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create analyser node
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;
      
      // Create source node
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioElement);
      
      // Connect nodes
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
      
      // Create data array
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing audio context:', error);
    }
  }, [audioElement, isInitialized]);

  const drawVisualizer = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return;

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    const bufferLength = analyserRef.current.frequencyBinCount;

    // Get frequency data
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);

    // Clear canvas
    canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw bars
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      barHeight = (dataArrayRef.current[i] / 255) * canvas.height * 0.8;

      // Create gradient
      const gradient = canvasCtx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
      gradient.addColorStop(0, `hsl(${(i / bufferLength) * 360}, 70%, 60%)`);
      gradient.addColorStop(1, `hsl(${(i / bufferLength) * 360}, 70%, 40%)`);

      canvasCtx.fillStyle = gradient;
      canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
  }, []);

  const startVisualization = useCallback(() => {
    if (!isPlaying || !analyserRef.current) return;

    const animate = () => {
      if (isPlaying) {
        drawVisualizer();
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();
  }, [isPlaying, drawVisualizer]);

  const stopVisualization = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const drawWaveform = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return;

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    const bufferLength = analyserRef.current.frequencyBinCount;

    // Get time domain data for waveform
    const waveformData = new Uint8Array(bufferLength);
    analyserRef.current.getByteTimeDomainData(waveformData);

    // Clear canvas
    canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw waveform
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = '#3b82f6';
    canvasCtx.beginPath();

    const sliceWidth = (canvas.width * 1.0) / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = waveformData[i] / 128.0;
      const y = (v * canvas.height) / 2;

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
  }, []);

  const drawCircularVisualizer = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return;

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    const bufferLength = analyserRef.current.frequencyBinCount;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.6;

    // Get frequency data
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);

    // Clear canvas
    canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw circular bars
    for (let i = 0; i < bufferLength; i++) {
      const angle = (i / bufferLength) * Math.PI * 2;
      const barHeight = (dataArrayRef.current[i] / 255) * radius * 0.5;
      
      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + barHeight);
      const y2 = centerY + Math.sin(angle) * (radius + barHeight);

      // Create gradient
      const gradient = canvasCtx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, `hsl(${(i / bufferLength) * 360}, 70%, 60%)`);
      gradient.addColorStop(1, `hsl(${(i / bufferLength) * 360}, 70%, 40%)`);

      canvasCtx.strokeStyle = gradient;
      canvasCtx.lineWidth = 2;
      canvasCtx.beginPath();
      canvasCtx.moveTo(x1, y1);
      canvasCtx.lineTo(x2, y2);
      canvasCtx.stroke();
    }
  }, []);

  const resizeCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    
    const ctx = canvas.getContext('2d');
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }, []);

  // Initialize audio context when audio element is available
  useEffect(() => {
    if (audioElement && !isInitialized) {
      initializeAudioContext();
    }
  }, [audioElement, initializeAudioContext, isInitialized]);

  // Handle play/pause
  useEffect(() => {
    if (isPlaying && isInitialized) {
      // Resume audio context if suspended
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      startVisualization();
    } else {
      stopVisualization();
    }

    return () => {
      stopVisualization();
    };
  }, [isPlaying, isInitialized, startVisualization, stopVisualization]);

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);
    resizeCanvas(); // Initial resize

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [resizeCanvas]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopVisualization();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopVisualization]);

  return {
    canvasRef,
    isInitialized,
    drawVisualizer,
    drawWaveform,
    drawCircularVisualizer,
    resizeCanvas,
    getFrequencyData: () => {
      if (!analyserRef.current || !dataArrayRef.current) return [];
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      return Array.from(dataArrayRef.current);
    },
    getAverageFrequency: () => {
      if (!analyserRef.current || !dataArrayRef.current) return 0;
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      const average = dataArrayRef.current.reduce((sum, value) => sum + value, 0) / dataArrayRef.current.length;
      return average;
    }
  };
};