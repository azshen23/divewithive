import { useEffect, useState } from 'react';
import heroBg from '../assets/hero_bg.png';

export default function Hero() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const scrollToUpdates = () => {
    document.querySelector('#updates')?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <section
      id="hero"
      className="relative min-h-[70vh] flex items-end overflow-hidden pb-16"
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-ive-dark/80 via-ive-dark/50 to-ive-dark" />
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-ive-pink/8 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-ive-purple/8 rounded-full blur-3xl animate-float-delay" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Live badge */}
        <div className="flex items-center gap-2 mb-4 animate-fade-in">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-inter text-xs font-medium text-emerald-400/80 tracking-wider uppercase">
            Live Updates
          </span>
          <span className="font-inter text-xs text-white/30 ml-2">
            {formatDate(now)} · {formatTime(now)}
          </span>
        </div>

        <h1 className="font-outfit font-900 text-5xl sm:text-6xl md:text-7xl tracking-tight mb-4 animate-fade-in">
          <span className="gradient-text text-shadow-glow">IVE</span>
          <span className="text-white/60 font-light ml-4">LIVE</span>
        </h1>

        {/* Breaking news ticker */}
        <div className="glass-card rounded-xl p-4 max-w-2xl mb-6 animate-fade-in-up">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 px-2 py-0.5 bg-ive-pink/20 text-ive-pink text-xs font-bold rounded uppercase tracking-wider mt-0.5">
              Now
            </span>
            <div>
              <p className="font-inter text-sm text-white/90 leading-relaxed">
                <strong className="text-white">SHOW WHAT I AM</strong> World Tour continues —
                Next stop: <strong className="text-ive-accent">Macao</strong> on May 23-24.
                North American leg kicks off July 2026.
              </p>
              <p className="font-inter text-xs text-white/30 mt-1">
                REVIVE+ era · 2nd Full Album out now
              </p>
            </div>
          </div>
        </div>

        <button
          id="discover-btn"
          onClick={scrollToUpdates}
          className="font-inter text-sm text-white/50 hover:text-white flex items-center gap-2 transition-colors duration-300 group"
        >
          Latest updates
          <svg className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </div>
    </section>
  );
}
