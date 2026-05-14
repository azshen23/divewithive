import { useState } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const videos = [
  {
    title: 'BANG BANG',
    videoId: '9qkpcLK422o',
    views: 'New',
  },
  {
    title: 'BLACKHOLE',
    videoId: '1Lmy7qwmSMc',
    views: 'New',
  },
  {
    title: 'XOXZ',
    videoId: 'B1ShLiq3EVc',
    views: 'New',
  },
  {
    title: 'Attitude',
    videoId: '38xYeot-ciM',
    views: 'New',
  },
  {
    title: 'Rebel Heart',
    videoId: 'g36q0ZLvygQ',
    views: '100M+',
  },
  {
    title: 'Accendio',
    videoId: 'PGLx4V680J8',
    views: '100M+',
  },
  {
    title: 'HEYA',
    videoId: '07EzMbVH3QE',
    views: '200M+',
  },
  {
    title: 'All Night',
    videoId: 'xU8mQMLx0tk',
    views: '50M+',
  },
  {
    title: 'Off The Record',
    videoId: '_ApV7Lm87cg',
    views: '80M+',
  },
  {
    title: 'Either Way',
    videoId: '_Hu4GYtye5U',
    views: '70M+',
  },
  {
    title: 'Baddie',
    videoId: 'Da4P2uT4mVc',
    views: '150M+',
  },
  {
    title: 'WAVE',
    videoId: 'qD1kP_nJU3o',
    views: '30M+',
  },
  {
    title: 'Kitsch',
    videoId: 'pG6iaOMV46I',
    views: '150M+',
  },
  {
    title: 'I AM',
    videoId: '6ZUIwj3FgUY',
    views: '200M+',
  },
  {
    title: 'After LIKE',
    videoId: 'F0B7HDiY-10',
    views: '300M+',
  },
  {
    title: 'LOVE DIVE',
    videoId: 'Y8JFxS1HlDo',
    views: '400M+',
  },
  {
    title: 'ELEVEN',
    videoId: '7tkbzxa8MFQ',
    views: '300M+',
  },
];

export default function MusicVideos() {
  const { ref, isRevealed } = useScrollReveal<HTMLElement>(0.1);
  const [activeVideo, setActiveVideo] = useState(0);

  return (
    <section
      id="videos"
      ref={ref}
      className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-ive-purple/10 rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div
          className={`text-center mb-16 transition-all duration-1000 ${
            isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <span className="font-inter text-sm font-medium tracking-[0.3em] uppercase text-ive-accent/70">
            Watch
          </span>
          <h2 className="font-outfit font-bold text-4xl sm:text-5xl md:text-6xl mt-3 gradient-text">
            Music Videos
          </h2>
          <p className="font-inter text-white/40 mt-4 max-w-lg mx-auto">
            Experience the iconic visuals that captivated millions worldwide
          </p>
        </div>

        <div
          className={`transition-all duration-1000 delay-300 ${
            isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          {/* Main video player */}
          <div className="relative max-w-4xl mx-auto mb-8">
            <div className="neon-border rounded-2xl overflow-hidden animate-pulse-glow">
              <div className="relative pt-[56.25%] bg-black">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${videos[activeVideo].videoId}?rel=0`}
                  title={`IVE - ${videos[activeVideo].title} MV`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
            <div className="text-center mt-4">
              <h3 className="font-outfit font-bold text-2xl text-white">
                {videos[activeVideo].title}
              </h3>
              <p className="font-inter text-sm text-ive-accent mt-1">
                {videos[activeVideo].views} views
              </p>
            </div>
          </div>

          {/* Video selector */}
          <div className="flex flex-wrap justify-center gap-3">
            {videos.map((video, index) => (
              <button
                key={video.title}
                id={`video-btn-${video.title.toLowerCase().replace(/\s/g, '-')}`}
                onClick={() => setActiveVideo(index)}
                className={`px-5 py-2.5 rounded-full font-inter text-sm font-medium transition-all duration-300 ${
                  activeVideo === index
                    ? 'bg-gradient-to-r from-ive-pink to-ive-purple text-white shadow-lg shadow-ive-pink/25'
                    : 'glass-card text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {video.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
