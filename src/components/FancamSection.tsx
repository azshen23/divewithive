import { useState } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const fancams = [
  {
    title: 'Wonyoung - HEYA (직캠)',
    videoId: 'M_jGJn7WPWU',
    member: 'Wonyoung',
    event: 'Music Core',
    badge: '4K',
  },
  {
    title: 'Yujin - LOVE DIVE (직캠)',
    videoId: 'jedOZRPLks4',
    member: 'Yujin',
    event: 'Music Bank',
    badge: '4K',
  },
  {
    title: 'Rei - After LIKE (직캠)',
    videoId: 'DHcEhPBO8SI',
    member: 'Rei',
    event: 'Inkigayo',
    badge: '4K',
  },
  {
    title: 'Leeseo - ELEVEN (직캠)',
    videoId: 'EiEiBmVLDXQ',
    member: 'Leeseo',
    event: 'Music Bank',
    badge: 'HD',
  },
  {
    title: 'Gaeul - Kitsch (직캠)',
    videoId: 'f8ntJ5lrHH0',
    member: 'Gaeul',
    event: 'M Countdown',
    badge: '4K',
  },
  {
    title: 'Liz - I AM (직캠)',
    videoId: 'BmFo0r2VMIM',
    member: 'Liz',
    event: 'Inkigayo',
    badge: '4K',
  },
];

const memberColors: Record<string, string> = {
  Yujin: 'from-rose-500 to-pink-600',
  Gaeul: 'from-blue-500 to-indigo-600',
  Rei: 'from-purple-500 to-violet-600',
  Wonyoung: 'from-pink-400 to-rose-500',
  Liz: 'from-amber-400 to-orange-500',
  Leeseo: 'from-emerald-400 to-teal-500',
};

export default function FancamSection() {
  const { ref, isRevealed } = useScrollReveal<HTMLElement>(0.1);
  const [playingId, setPlayingId] = useState<string | null>(null);

  return (
    <section
      id="fancams"
      ref={ref}
      className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-ive-dark via-ive-deep/20 to-ive-dark overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute top-1/4 right-0 w-72 h-72 bg-ive-pink/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-ive-purple/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div
          className={`text-center mb-16 transition-all duration-1000 ${
            isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <span className="font-inter text-sm font-medium tracking-[0.3em] uppercase text-ive-accent/70">
            Live Moments
          </span>
          <h2 className="font-outfit font-bold text-4xl sm:text-5xl md:text-6xl mt-3 gradient-text">
            Fancams
          </h2>
          <p className="font-inter text-white/40 mt-4 max-w-lg mx-auto">
            Fan-captured moments that showcase each member's individual charm on stage
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {fancams.map((fancam, index) => (
            <div
              key={fancam.videoId}
              className={`group glass-card glass-card-hover rounded-2xl overflow-hidden hover-lift transition-all duration-700 ${
                isRevealed
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: `${index * 100 + 200}ms` }}
            >
              {/* Video thumbnail / embed */}
              <div className="relative aspect-video bg-black cursor-pointer"
                onClick={() => setPlayingId(playingId === fancam.videoId ? null : fancam.videoId)}
              >
                {playingId === fancam.videoId ? (
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${fancam.videoId}?autoplay=1&rel=0`}
                    title={fancam.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <>
                    <img
                      src={`https://img.youtube.com/vi/${fancam.videoId}/hqdefault.jpg`}
                      alt={fancam.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition-colors duration-300">
                      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[14px] border-l-white ml-1" />
                      </div>
                    </div>
                    {/* Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${memberColors[fancam.member] || 'from-ive-pink to-ive-purple'} shadow-lg`}>
                        {fancam.badge}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${memberColors[fancam.member] || 'from-ive-pink to-ive-purple'}`} />
                  <span className="font-inter text-xs font-medium text-ive-accent">
                    {fancam.member} Focus
                  </span>
                </div>
                <h3 className="font-outfit font-semibold text-sm text-white truncate">
                  {fancam.title}
                </h3>
                <p className="font-inter text-xs text-white/30 mt-1">
                  {fancam.event}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
