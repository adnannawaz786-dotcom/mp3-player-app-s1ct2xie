'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const AudioVisualizer = ({ 
  audioElement, 
  isPlaying, 
  className = '',
  type = 'bars', // 'bars', 'circular', 'waveform'
  color = 'primary',
  height = 200,
  barCount = 64
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Color schemes
  const colorSchemes = {
    primary: {
      gradient: ['#3b82f6', '#1d4ed8', '#1e40af'],
      glow: '#3b82f6'
    },
    purple: {
      gradient: ['#a855f7', '#7c3aed', '#6d28d9'],
      glow: '#a855f7'
    },
    green: {
      gradient: ['#10b981', '#059669', '#047857'],
      glow: '#10b981'
    },
    orange: {
      gradient: ['#f97316', '#ea580c', '#c2410c'],
      glow: '#f97316'
    }
  };

  const currentColors = colorSchemes[color] || colorSchemes.primary;

  useEffect(() => {
    if (!audioElement || isInitialized) return;

    const initializeAudioContext = async () => {
      try {
        // Create audio context
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();

        // Create analyser
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        analyserRef.current.smoothingTimeConstant = 0.8;

        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);

        // Connect audio element to analyser
        if (!sourceRef.current) {
          sourceRef.current = audioContextRef.current.createMediaElementSource(audioElement);
          sourceRef.current.connect(analyserRef.current);
          analyserRef.current.connect(audioContextRef.current.destination);
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing audio context:', error);
      }
    };

    // Initialize on user interaction
    const handleUserInteraction = () => {
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      initializeAudioContext();
      document.removeEventListener('click', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    initializeAudioContext();

    return () => {
      document.removeEventListener('click', handleUserInteraction);
    };
  }, [audioElement, isInitialized]);

  useEffect(() => {
    if (!isInitialized || !analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      if (!analyserRef.current || !dataArrayRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!isPlaying) {
        // Show static visualization when not playing
        drawStaticVisualization(ctx, canvas);
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      // Draw based on type
      switch (type) {
        case 'bars':
          drawBars(ctx, canvas);
          break;
        case 'circular':
          drawCircular(ctx, canvas);
          break;
        case 'waveform':
          drawWaveform(ctx, canvas);
          break;
        default:
          drawBars(ctx, canvas);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    const drawBars = (ctx, canvas) => {
      const barWidth = canvas.width / barCount;
      const dataStep = Math.floor(dataArrayRef.current.length / barCount);

      for (let i = 0; i < barCount; i++) {
        const dataIndex = i * dataStep;
        const barHeight = (dataArrayRef.current[dataIndex] / 255) * canvas.height;

        // Create gradient
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, currentColors.gradient[0]);
        gradient.addColorStop(0.5, currentColors.gradient[1]);
        gradient.addColorStop(1, currentColors.gradient[2]);

        ctx.fillStyle = gradient;
        ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 2, barHeight);

        // Add glow effect
        ctx.shadowColor = currentColors.glow;
        ctx.shadowBlur = 10;
        ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 2, barHeight);
        ctx.shadowBlur = 0;
      }
    };

    const drawCircular = (ctx, canvas) => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) - 50;
      const dataStep = Math.floor(dataArrayRef.current.length / barCount);

      ctx.translate(centerX, centerY);

      for (let i = 0; i < barCount; i++) {
        const dataIndex = i * dataStep;
        const barHeight = (dataArrayRef.current[dataIndex] / 255) * 60;
        const angle = (i / barCount) * Math.PI * 2;

        ctx.save();
        ctx.rotate(angle);

        // Create gradient
        const gradient = ctx.createLinearGradient(0, radius, 0, radius + barHeight);
        gradient.addColorStop(0, currentColors.gradient[0]);
        gradient.addColorStop(1, currentColors.gradient[2]);

        ctx.fillStyle = gradient;
        ctx.fillRect(-2, radius, 4, barHeight);

        // Add glow
        ctx.shadowColor = currentColors.glow;
        ctx.shadowBlur = 8;
        ctx.fillRect(-2, radius, 4, barHeight);
        ctx.shadowBlur = 0;

        ctx.restore();
      }

      ctx.translate(-centerX, -centerY);
    };

    const drawWaveform = (ctx, canvas) => {
      ctx.lineWidth = 3;
      ctx.strokeStyle = currentColors.gradient[0];
      ctx.beginPath();

      const sliceWidth = canvas.width / dataArrayRef.current.length;
      let x = 0;

      for (let i = 0; i < dataArrayRef.current.length; i++) {
        const v = dataArrayRef.current[i] / 255;
        const y = v * canvas.height / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.stroke();

      // Add glow effect
      ctx.shadowColor = currentColors.glow;
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    const drawStaticVisualization = (ctx, canvas) => {
      const barWidth = canvas.width / barCount;

      for (let i = 0; i < barCount; i++) {
        const barHeight = Math.random() * 20 + 5;

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, currentColors.gradient[0] + '40');
        gradient.addColorStop(1, currentColors.gradient[2] + '20');

        ctx.fillStyle = gradient;
        ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 2, barHeight);
      }
    };

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Start animation
    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isInitialized, isPlaying, type, color, height, barCount, currentColors]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <motion.div
      className={`relative overflow-hidden rounded-lg bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ height: `${height}px` }}
      />
      
      {/* Overlay effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
      
      {/* Loading state */}
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      )}
    </motion.div>
  );
};

export default AudioVisualizer;