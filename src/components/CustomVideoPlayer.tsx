import { useState, useRef, useEffect } from 'react';
import { useInView } from 'framer-motion';

interface CustomVideoPlayerProps {
  src: string;
}

export default function CustomVideoPlayer({ src }: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const progressBarRef = useRef<HTMLDivElement>(null);
  
  // Detect when 50% of the video is visible in the viewport
  const isInView = useInView(containerRef, { amount: 0.5 }); 
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isVolumeDragging, setIsVolumeDragging] = useState(false);
  const volumeBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const updateProgress = () => {
      if (videoRef.current && videoRef.current.duration && !isDragging) {
        const prog = (videoRef.current.currentTime / videoRef.current.duration) * 100;
        setProgress(prog || 0);
      }
      animationRef.current = requestAnimationFrame(updateProgress);
    };

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(updateProgress);
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
    
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, isDragging]);

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
      if (isMuted) {
        if (volume === 0) {
          videoRef.current.volume = 1;
          setVolume(1);
        }
        videoRef.current.muted = false;
        setIsMuted(false);
      } else {
        videoRef.current.muted = true;
        setIsMuted(true);
      }
    }
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const updateProgressFromEvent = (clientX: number) => {
    if (videoRef.current && progressBarRef.current) {
      const bounds = progressBarRef.current.getBoundingClientRect();
      let percent = (clientX - bounds.left) / bounds.width;
      percent = Math.max(0, Math.min(1, percent));
      videoRef.current.currentTime = percent * videoRef.current.duration;
      setProgress(percent * 100);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(true);
    updateProgressFromEvent(e.clientX);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      e.stopPropagation();
      updateProgressFromEvent(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      e.stopPropagation();
      setIsDragging(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const updateVolumeFromEvent = (clientY: number) => {
    if (videoRef.current && volumeBarRef.current) {
      const bounds = volumeBarRef.current.getBoundingClientRect();
      let newVolume = (bounds.bottom - clientY) / bounds.height;
      newVolume = Math.max(0, Math.min(1, newVolume));
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      if (newVolume > 0 && videoRef.current.muted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      } else if (newVolume === 0 && !videoRef.current.muted) {
        videoRef.current.muted = true;
        setIsMuted(true);
      }
    }
  };

  const handleVolumePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsVolumeDragging(true);
    updateVolumeFromEvent(e.clientY);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleVolumePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isVolumeDragging) {
      e.stopPropagation();
      updateVolumeFromEvent(e.clientY);
    }
  };

  const handleVolumePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isVolumeDragging) {
      e.stopPropagation();
      setIsVolumeDragging(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full rounded-lg overflow-hidden group/video bg-black mt-2 flex items-center justify-center ${isFullscreen ? 'h-screen' : ''}`} 
      style={{ maxHeight: isFullscreen ? 'none' : '600px' }}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain cursor-pointer"
        src={src}
        muted={isMuted}
        loop
        playsInline
        style={{ maxHeight: isFullscreen ? '100vh' : '600px' }}
      />

      {/* Overlay UI */}
      <div 
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/video:opacity-100 transition-opacity duration-300 pointer-events-none flex flex-col justify-end p-4 z-20"
      >
        
        {/* Progress Bar */}
        <div 
          ref={progressBarRef}
          className="w-full py-2 mb-1 cursor-pointer pointer-events-auto group/progress relative flex items-center"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full h-1.5 bg-white/20 rounded-full">
            <div 
              className="h-full bg-pink-400 rounded-full relative" 
              style={{ width: `${progress}%` }} 
            >
              <div 
                className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-md ${isDragging ? 'opacity-100 scale-125' : 'opacity-0 group-hover/progress:opacity-100'} transition-all duration-150`}
              />
            </div>
          </div>
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

          <div className="flex items-center group/volume ml-auto relative">
            <button onClick={toggleMute} className="text-white hover:text-pink-400 transition-colors p-1">
              {isMuted || volume === 0 ? (
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
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 pb-2">
              <div 
                className={`overflow-hidden transition-all duration-300 ${isVolumeDragging ? 'h-24 opacity-100' : 'h-0 opacity-0 group-hover/volume:h-24 group-hover/volume:opacity-100'} flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg w-8`}
              >
                <div 
                  ref={volumeBarRef}
                  className="h-[80%] w-full cursor-pointer flex flex-col items-center justify-end group/volbar relative"
                  onPointerDown={handleVolumePointerDown}
                  onPointerMove={handleVolumePointerMove}
                  onPointerUp={handleVolumePointerUp}
                  onPointerCancel={handleVolumePointerUp}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-1 h-full bg-white/30 rounded-full relative">
                    <div 
                      className="w-full bg-pink-400 rounded-full absolute bottom-0"
                      style={{ height: `${(isMuted ? 0 : volume) * 100}%` }}
                    >
                      <div 
                        className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-md ${isVolumeDragging ? 'opacity-100 scale-125' : 'opacity-0 group-hover/volbar:opacity-100'} transition-all duration-150`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button onClick={toggleFullscreen} className="text-white hover:text-pink-400 transition-colors p-1">
            {isFullscreen ? (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
              </svg>
            ) : (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
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
