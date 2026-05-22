/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { trackEvent } from '../utils/analytics';


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
  const [volume, setVolume] = useState(50);

  const playerRef = useRef<YTPlayer | null>(null);

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
              nextSong(false);
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
        trackEvent('Music Paused', { songTitle: currentSong.title, artist: currentSong.artist });
        playerRef.current.pauseVideo();
      } else {
        trackEvent('Music Played', { songTitle: currentSong.title, artist: currentSong.artist });
        playerRef.current.playVideo();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextSong = (manual = false) => {
    if (manual) {
      trackEvent('Music Skipped', { direction: 'next', fromSong: currentSong.title });
    }
    setCurrentSongIndex((prev) => (prev + 1) % songs.length);
  };

  const prevSong = (manual = false) => {
    if (manual) {
      trackEvent('Music Skipped', { direction: 'prev', fromSong: currentSong.title });
    }
    setCurrentSongIndex((prev) => (prev - 1 + songs.length) % songs.length);
  };

  return (
    <div className="card rounded-xl p-5 w-full relative overflow-hidden">
      {/* Hidden YouTube Player (Must be in DOM to work) */}
      <div id="youtube-player" className="absolute opacity-0 pointer-events-none" />

      <div className="relative z-10 flex flex-col">
        {/* Header / Now Playing info */}
        <div className="mb-4">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold block">Now Playing</span>
            {isPlaying && (
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
              />
            )}
          </div>
          <h4 className="font-outfit font-bold text-white text-lg truncate leading-tight">{currentSong.title}</h4>
          <p className="font-inter text-white/40 text-xs tracking-wider uppercase mt-0.5">{currentSong.artist}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-5 justify-center mb-5 py-2">
          <button
            onClick={() => prevSong(true)}
            className="text-white/40 hover:text-white transition-colors hover:scale-110 active:scale-95 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" /></svg>
          </button>

          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl cursor-pointer"
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>

          <button
            onClick={() => nextSong(true)}
            className="text-white/40 hover:text-white transition-colors hover:scale-110 active:scale-95 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
          </button>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-3 mb-5 px-1 group/volume">
          <div className="text-white/30 group-hover/volume:text-white/60 transition-colors">
            {volume === 0 ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M23 9l-6 6m0-6l6 6" /></svg>
            ) : volume < 50 ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
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
          <span className="text-[10px] font-bold text-white/20 min-w-[20px] tabular-nums">{volume}</span>
        </div>

        {/* Visualizer bars */}
        <div className="flex items-end justify-between gap-[3px] h-4 px-1">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                height: isPlaying ? [2, Math.random() * 12 + 2, 2] : 2
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
      </div>
    </div>
  );
}
