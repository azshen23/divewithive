/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import iveLogo from '../assets/ive_logo.svg';

interface YTPlayer {
  loadVideoById: (id: string) => void;
  pauseVideo: () => void;
  playVideo: () => void;
  setVolume: (volume: number) => void;
}

interface YTEvent {
  data: number;
}

interface YTGlobal {
  Player: new (id: string, options: unknown) => YTPlayer;
  PlayerState: {
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
  };
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: YTGlobal;
  }
}

const songs = [
  {
    title: 'ELEVEN',
    artist: 'IVE',
    color: '#ff0055',
    youtubeId: '--FmExEAsM8',
  },
  {
    title: 'LOVE DIVE',
    artist: 'IVE',
    color: '#7b00ff',
    youtubeId: 'Y8JFxS1HlDo',
  },
  {
    title: 'I AM',
    artist: 'IVE',
    color: '#00ccff',
    youtubeId: '6ZUIwj3FgUY',
  },
  {
    title: 'Off The Record',
    artist: 'IVE',
    color: '#ff5c8a',
    youtubeId: '_ApV7Lm87cg',
  },
  {
    title: 'XOXZ',
    artist: 'IVE',
    color: '#7c3aed',
    youtubeId: 'B1ShLiq3EVc',
  },
  {
    title: 'Blackhole',
    artist: 'IVE',
    color: '#1a1a2e',
    youtubeId: '1Lmy7qwmSMc',
  }
];

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isApiReady, setIsApiReady] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [volume, setVolume] = useState(50);

  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentSong = songs[currentSongIndex];

  // Load YouTube API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setIsApiReady(true);
      };
    } else {
      setIsApiReady(true);
    }
  }, []);

  // Initialize/Update Player
  useEffect(() => {
    if (isApiReady && !playerRef.current) {
      playerRef.current = new window.YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: currentSong.youtubeId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
        },
        events: {
          onStateChange: (event: YTEvent) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              nextSong();
            } else if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            }
          },
        },
      });
    }
  }, [isApiReady]);

  // Sync video with current song
  useEffect(() => {
    if (playerRef.current && playerRef.current.loadVideoById) {
      playerRef.current.loadVideoById(currentSong.youtubeId);
      if (!isPlaying) {
        playerRef.current.pauseVideo();
      }
    }
  }, [currentSongIndex]);

  // Sync volume
  useEffect(() => {
    if (playerRef.current && playerRef.current.setVolume) {
      playerRef.current.setVolume(volume);
    }
  }, [volume, isApiReady]);

  const togglePlay = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextSong = () => {
    setCurrentSongIndex((prev) => (prev + 1) % songs.length);
  };

  const prevSong = () => {
    setCurrentSongIndex((prev) => (prev - 1 + songs.length) % songs.length);
  };

  return (
    <div
      className="fixed top-20 right-4 sm:right-6 z-[100] flex flex-col items-end pointer-events-none"
      ref={containerRef}
    >
      {/* Hidden YouTube Player (Must be in DOM to work) */}
      <div id="youtube-player" className="absolute opacity-0 pointer-events-none" />

      <div className="relative flex items-center pointer-events-auto">
        {/* Expanded Info Panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.9, filter: 'blur(10px)' }}
              animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: 20, scale: 0.9, filter: 'blur(10px)' }}
              className="absolute right-full mr-3 sm:mr-6 top-1/2 -translate-y-1/2 bg-[#0a0a0f]/80 backdrop-blur-xl p-3 sm:p-4 rounded-2xl sm:rounded-3xl min-w-[180px] sm:min-w-[220px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] whitespace-nowrap"
            >
              <div className="mb-3 sm:mb-4">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-white/30 font-bold block">Now Playing</span>
                  {isPlaying && (
                    <motion.div
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                    />
                  )}
                </div>
                <h4 className="font-outfit font-bold text-white text-sm sm:text-base truncate leading-tight">{currentSong.title}</h4>
                <p className="font-inter text-white/40 text-[9px] sm:text-[10px] tracking-wider uppercase">{currentSong.artist}</p>
              </div>

              <div className="flex items-center gap-3 sm:gap-5 justify-center mb-3 sm:mb-4">
                <button
                  onClick={prevSong}
                  className="text-white/40 hover:text-white transition-colors hover:scale-110 active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" /></svg>
                </button>

                <button
                  onClick={togglePlay}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
                >
                  {isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  )}
                </button>

                <button
                  onClick={nextSong}
                  className="text-white/40 hover:text-white transition-colors hover:scale-110 active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-3 mb-4 px-1 group/volume">
                <div className="text-white/30 group-hover/volume:text-white/60 transition-colors">
                  {volume === 0 ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M23 9l-6 6m0-6l6 6" /></svg>
                  ) : volume < 50 ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
                  )}
                </div>
                <div className="relative flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(parseInt(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    animate={{ width: `${volume}%` }}
                    style={{ backgroundColor: currentSong.color }}
                  />
                </div>
                <span className="text-[9px] font-bold text-white/20 min-w-[20px] tabular-nums">{volume}</span>
              </div>

              {/* Visualizer bars */}
              <div className="flex items-end justify-between gap-[2px] h-3 px-1">
                {[...Array(15)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: isPlaying ? [2, Math.random() * 10 + 2, 2] : 2
                    }}
                    transition={{
                      duration: 0.3 + Math.random() * 0.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.02
                    }}
                    className="flex-1 rounded-full"
                    style={{ backgroundColor: currentSong.color }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Spinning Record Container */}
        <div className="relative group pointer-events-auto">
          {/* Base of the record player */}
          <div className="absolute inset-[-8px] bg-white/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <motion.div
            className="relative cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {/* Vinyl Record */}
            <motion.div
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-[#080808] shadow-[0_10px_30px_rgba(0,0,0,0.8)] relative flex items-center justify-center border-[2px] sm:border-[3px] border-zinc-800"
            >
              {/* Vinyl grooves */}
              <div className="absolute inset-0 rounded-full opacity-40 pointer-events-none"
                style={{
                  backgroundImage: 'repeating-radial-gradient(circle, transparent 0, transparent 1px, rgba(255,255,255,0.03) 2px, transparent 3px)',
                }}
              />

              {/* Subtle reflection */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />

              {/* Center Label */}
              <div
                className="w-8 h-8 rounded-full shadow-lg relative z-10 overflow-hidden flex items-center justify-center p-1.5 transition-colors duration-1000"
                style={{ backgroundColor: currentSong.color }}
              >
                <img
                  src={iveLogo}
                  alt="IVE"
                  className="w-full h-full object-contain brightness-0 invert opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
              </div>

              {/* Center hole */}
              <div className="absolute w-1 h-1 bg-[#0a0a0f] rounded-full z-20 shadow-inner border border-white/10" />
            </motion.div>

            {/* Tonearm */}
            <div className="absolute -right-4 top-0 w-12 h-12 pointer-events-none">
              <motion.div
                initial={{ rotate: -20 }}
                animate={{ rotate: isPlaying ? 0 : -20 }}
                transition={{ type: "spring", stiffness: 60, damping: 10 }}
                className="absolute top-0 right-4 w-1 h-12 bg-gradient-to-b from-zinc-300 to-zinc-600 rounded-full origin-top z-30"
              >
                {/* Arm head */}
                <div className="absolute bottom-[-2px] -left-1 w-3 h-4 bg-zinc-800 rounded-sm shadow-md flex items-center justify-center">
                  <div className="w-[1px] h-2 bg-zinc-400" />
                </div>

                {/* Arm pivot base */}
                <div className="absolute top-[-4px] left-[-4px] w-3 h-3 bg-zinc-500 rounded-full border border-zinc-300" />
              </motion.div>
            </div>

            {/* Glowing background for active state */}
            {isPlaying && (
              <motion.div
                layoutId="activeGlow"
                className="absolute inset-[-10px] rounded-full blur-2xl z-[-1] pointer-events-none"
                style={{ backgroundColor: currentSong.color }}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0.1, 0.2, 0.1],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
