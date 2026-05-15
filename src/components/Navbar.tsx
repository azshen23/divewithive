import { useState, useEffect } from 'react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 transition-colors duration-200 ${
        scrolled ? 'bg-[#0a0a0f]/95 border-b border-white/5' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <span className="font-outfit font-bold text-sm tracking-wide">
            <span className="text-pink-400">DIVE</span>
            <span className="text-white/50 ml-1">WITH IVE</span>
          </span>
        </a>

        <div />
      </div>
    </nav>
  );
}
