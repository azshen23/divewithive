import { useState, useRef, useEffect } from 'react';
import { useInView } from 'framer-motion';

interface CustomVideoPlayerProps {
  src: string;
}

export default function CustomVideoPlayer({ src }: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Detect when 50% of the video is visible in the viewport
  const isInView = useInView(containerRef, { amount: 0.5 }); 
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  // Auto-play / auto-pause based on scroll visibility
  useEffect(() => {
    if (isInView && videoRef.current) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else if (!isInView && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isInView]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const prog = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(prog || 0);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (videoRef.current) {
      const bounds = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - bounds.left) / bounds.width;
      videoRef.current.currentTime = percent * videoRef.current.duration;
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full rounded-lg overflow-hidden group/video bg-black/20 mt-2" 
      style={{ maxHeight: '600px' }}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain cursor-pointer"
        src={src}
        muted={isMuted}
        loop
        playsInline
        onTimeUpdate={handleTimeUpdate}
        style={{ maxHeight: '600px' }}
      />

      {/* Overlay UI */}
      <div 
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/video:opacity-100 transition-opacity duration-300 pointer-events-none flex flex-col justify-end p-4 z-20"
      >
        
        {/* Progress Bar */}
        <div 
          className="w-full h-1.5 bg-white/20 rounded-full mb-3 cursor-pointer pointer-events-auto"
          onClick={handleSeek}
        >
          <div 
            className="h-full bg-pink-400 rounded-full transition-all duration-100" 
            style={{ width: `${progress}%` }} 
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 pointer-events-auto">
          <button onClick={togglePlay} className="text-white hover:text-pink-400 transition-colors p-1">
            {isPlaying ? (
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button onClick={toggleMute} className="text-white hover:text-pink-400 transition-colors ml-auto p-1">
            {isMuted ? (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Center Play Button Overlay when paused explicitly */}
      {!isPlaying && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
          <button 
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white transition-transform hover:scale-110 pointer-events-auto"
          >
             <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24" className="ml-1">
               <path d="M8 5v14l11-7z" />
             </svg>
          </button>
        </div>
      )}
    </div>
  );
}
