import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Music, Clock, MoreHorizontal } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const TrackList = ({ 
  tracks = [], 
  currentTrack = null, 
  isPlaying = false, 
  onTrackSelect = () => {}, 
  onPlayPause = () => {} 
}) => {
  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Music className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Your Library</h2>
            <p className="text-sm text-white/60">{tracks.length} tracks</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* Track List */}
      <div className="flex-1 overflow-y-auto p-4">
        {tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Music className="w-8 h-8 text-white/40" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No tracks available</h3>
            <p className="text-white/60">Add some music to get started</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2"
          >
            {tracks.map((track, index) => {
              const isCurrentTrack = currentTrack?.id === track.id;
              const isCurrentPlaying = isCurrentTrack && isPlaying;

              return (
                <motion.div
                  key={track.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className={`group p-4 cursor-pointer transition-all duration-200 border-0 ${
                    isCurrentTrack 
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 shadow-lg' 
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                    onClick={() => onTrackSelect(track, index)}
                  >
                    <div className="flex items-center gap-4">
                      {/* Track Number / Play Button */}
                      <div className="w-8 h-8 flex items-center justify-center relative">
                        {isCurrentTrack ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-8 h-8 p-0 hover:bg-white/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlayPause();
                            }}
                          >
                            {isCurrentPlaying ? (
                              <Pause className="w-4 h-4 text-white" />
                            ) : (
                              <Play className="w-4 h-4 text-white" />
                            )}
                          </Button>
                        ) : (
                          <span className="text-sm text-white/60 font-medium">
                            {(index + 1).toString().padStart(2, '0')}
                          </span>
                        )}
                      </div>

                      {/* Album Art */}
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                        {track.artwork ? (
                          <img 
                            src={track.artwork} 
                            alt={track.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Music className="w-6 h-6 text-white/80" />
                        )}
                      </div>

                      {/* Track Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-medium truncate ${
                            isCurrentTrack ? 'text-white' : 'text-white/90'
                          }`}>
                            {track.title}
                          </h3>
                          {isCurrentPlaying && (
                            <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">
                              Playing
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-white/60 truncate">
                          {track.artist}
                        </p>
                      </div>

                      {/* Duration */}
                      <div className="flex items-center gap-2 text-white/60">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-mono">
                          {formatDuration(track.duration || 0)}
                        </span>
                      </div>

                      {/* More Options */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100 hover:bg-white/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle more options
                        }}
                      >
                        <MoreHorizontal className="w-4 h-4 text-white/60" />
                      </Button>
                    </div>

                    {/* Progress Bar for Current Track */}
                    {isCurrentTrack && (
                      <div className="mt-3">
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                            initial={{ width: 0 }}
                            animate={{ 
                              width: isCurrentPlaying ? '100%' : '0%' 
                            }}
                            transition={{ 
                              duration: track.duration || 180,
                              ease: 'linear' 
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Footer Stats */}
      {tracks.length > 0 && (
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between text-sm text-white/60">
            <span>{tracks.length} tracks</span>
            <span>
              {Math.floor(tracks.reduce((acc, track) => acc + (track.duration || 0), 0) / 60)} min total
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackList;