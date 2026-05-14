import { useScrollReveal } from '../hooks/useScrollReveal';

const albums = [
  {
    title: 'ELEVEN',
    type: 'Debut Single',
    year: '2021',
    color: 'from-rose-500 to-pink-700',
    tracks: 2,
  },
  {
    title: 'LOVE DIVE',
    type: 'Single Album',
    year: '2022',
    color: 'from-violet-500 to-purple-800',
    tracks: 2,
  },
  {
    title: 'After LIKE',
    type: 'Single Album',
    year: '2022',
    color: 'from-amber-400 to-orange-600',
    tracks: 3,
  },
  {
    title: "I've IVE",
    type: '1st Full Album',
    year: '2023',
    color: 'from-sky-400 to-blue-700',
    tracks: 10,
  },
  {
    title: 'WAVE',
    type: 'Japanese Mini Album',
    year: '2023',
    color: 'from-cyan-400 to-sky-600',
    tracks: 4,
  },
  {
    title: "I'VE MINE",
    type: '1st EP',
    year: '2023',
    color: 'from-stone-400 to-zinc-700',
    tracks: 6,
  },
  {
    title: 'IVE SWITCH',
    type: '2nd EP',
    year: '2024',
    color: 'from-fuchsia-500 to-pink-700',
    tracks: 6,
  },
  {
    title: 'IVE EMPATHY',
    type: '3rd EP',
    year: '2025',
    color: 'from-red-500 to-rose-800',
    tracks: 6,
  },
  {
    title: 'IVE SECRET',
    type: '4th EP',
    year: '2025',
    color: 'from-indigo-400 to-violet-700',
    tracks: 6,
  },
  {
    title: 'REVIVE+',
    type: '2nd Full Album',
    year: '2026',
    color: 'from-emerald-400 to-teal-700',
    tracks: 12,
  },
];

export default function DiscographySection() {
  const { ref, isRevealed } = useScrollReveal<HTMLElement>(0.1);

  return (
    <section
      id="discography"
      ref={ref}
      className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-ive-dark via-ive-deep/30 to-ive-dark"
    >
      <div className="max-w-7xl mx-auto">
        <div
          className={`text-center mb-16 transition-all duration-1000 ${
            isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <span className="font-inter text-sm font-medium tracking-[0.3em] uppercase text-ive-accent/70">
            The Music
          </span>
          <h2 className="font-outfit font-bold text-4xl sm:text-5xl md:text-6xl mt-3 gradient-text">
            Discography
          </h2>
          <p className="font-inter text-white/40 mt-4 max-w-lg mx-auto">
            From their explosive debut to global domination — every release that shaped IVE
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album, index) => (
            <div
              key={album.title}
              className={`group glass-card glass-card-hover rounded-2xl overflow-hidden hover-lift transition-all duration-700 ${
                isRevealed
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: `${index * 100 + 200}ms` }}
            >
              {/* Album art placeholder with gradient */}
              <div
                className={`relative h-52 bg-gradient-to-br ${album.color} flex items-center justify-center overflow-hidden`}
              >
                {/* Vinyl record decoration */}
                <div className="absolute right-[-30px] top-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-black/30 border-4 border-white/10 opacity-0 group-hover:opacity-100 group-hover:right-[-10px] transition-all duration-500">
                  <div className="absolute inset-0 rounded-full border-2 border-white/5 m-4" />
                  <div className="absolute inset-0 rounded-full border border-white/5 m-8" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/20" />
                </div>

                <div className="text-center relative z-10">
                  <span className="font-outfit font-black text-3xl md:text-4xl text-white/90 drop-shadow-lg tracking-wide">
                    {album.title}
                  </span>
                </div>

                {/* Shine effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-outfit font-semibold text-lg text-white">
                    {album.title}
                  </h3>
                  <span className="font-inter text-xs text-white/30 font-mono">
                    {album.year}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-inter text-sm text-ive-accent/80">
                    {album.type}
                  </span>
                  <span className="font-inter text-xs text-white/30">
                    {album.tracks} {album.tracks === 1 ? 'track' : 'tracks'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
