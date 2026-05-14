import { useScrollReveal } from '../hooks/useScrollReveal';

const milestones = [
  {
    date: 'December 1, 2021',
    title: 'Debut: ELEVEN',
    description:
      'IVE burst onto the K-pop scene with their debut single "ELEVEN," instantly captivating fans worldwide with their fresh concept and powerful stage presence.',
    icon: '🌟',
  },
  {
    date: 'April 5, 2022',
    title: 'LOVE DIVE Release',
    description:
      'Their second single "LOVE DIVE" became a massive hit, dominating Korean music charts and winning multiple music show awards. A defining moment for IVE.',
    icon: '💜',
  },
  {
    date: 'August 22, 2022',
    title: 'After LIKE Phenomenon',
    description:
      'Sampling Gloria Gaynor\'s "I Will Survive," After LIKE became a global sensation, cementing IVE as one of 4th generation K-pop\'s leading groups.',
    icon: '🔥',
  },
  {
    date: 'April 10, 2023',
    title: '1st Full Album: I\'ve IVE',
    description:
      'IVE released their highly anticipated first full-length album featuring hits like "I AM" and "Kitsch," showcasing their musical growth and versatility.',
    icon: '💿',
  },
  {
    date: 'October 2023',
    title: '1st World Tour: SHOW WHAT I HAVE',
    description:
      'IVE embarked on their first world tour, performing to sold-out arenas across Asia, North America, and Europe, connecting with fans on a global stage.',
    icon: '🌍',
  },
  {
    date: 'April 29, 2024',
    title: 'IVE SWITCH Era',
    description:
      'The 2nd EP "IVE SWITCH" arrived with the hit title track "HEYA," showcasing a bold new concept and further solidifying their position as K-pop royalty.',
    icon: '⚡',
  },
  {
    date: '2025',
    title: 'Global Domination Continues',
    description:
      'IVE continues to break records and captivate audiences worldwide with "REBEL HEART," new collaborations, and expanding their influence across music, fashion, and entertainment.',
    icon: '👑',
  },
];

export default function TimelineSection() {
  const { ref, isRevealed } = useScrollReveal<HTMLElement>(0.05);

  return (
    <section
      id="timeline"
      ref={ref}
      className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-ive-dark via-ive-deep/20 to-ive-dark overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-1/4 right-0 w-72 h-72 bg-ive-pink/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-ive-purple/5 rounded-full blur-3xl" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div
          className={`text-center mb-20 transition-all duration-1000 ${
            isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <span className="font-inter text-sm font-medium tracking-[0.3em] uppercase text-ive-accent/70">
            The Journey
          </span>
          <h2 className="font-outfit font-bold text-4xl sm:text-5xl md:text-6xl mt-3 gradient-text">
            IVE Timeline
          </h2>
          <p className="font-inter text-white/40 mt-4 max-w-lg mx-auto">
            From debut to global stardom — every milestone that matters
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-ive-pink/50 via-ive-purple/30 to-transparent" />

          {milestones.map((milestone, index) => {
            const isLeft = index % 2 === 0;

            return (
              <div
                key={milestone.title}
                className={`relative flex items-start mb-12 md:mb-16 transition-all duration-700 ${
                  isRevealed
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: `${index * 150 + 300}ms` }}
              >
                {/* Desktop layout */}
                <div className="hidden md:flex w-full items-start">
                  {/* Left content */}
                  <div
                    className={`w-1/2 ${isLeft ? 'pr-12 text-right' : 'pr-12 text-right opacity-0 pointer-events-none'}`}
                  >
                    {isLeft && (
                      <div className="glass-card glass-card-hover rounded-2xl p-6 inline-block text-left max-w-md ml-auto">
                        <span className="font-inter text-xs text-ive-accent/70 tracking-wider uppercase">
                          {milestone.date}
                        </span>
                        <h3 className="font-outfit font-bold text-xl text-white mt-2 mb-3">
                          {milestone.title}
                        </h3>
                        <p className="font-inter text-sm text-white/50 leading-relaxed">
                          {milestone.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Center dot */}
                  <div className="absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-ive-dark border-2 border-ive-pink/50 flex items-center justify-center text-xl z-10 shadow-lg shadow-ive-pink/20">
                    {milestone.icon}
                  </div>

                  {/* Right content */}
                  <div
                    className={`w-1/2 ${!isLeft ? 'pl-12' : 'pl-12 opacity-0 pointer-events-none'}`}
                  >
                    {!isLeft && (
                      <div className="glass-card glass-card-hover rounded-2xl p-6 inline-block text-left max-w-md">
                        <span className="font-inter text-xs text-ive-accent/70 tracking-wider uppercase">
                          {milestone.date}
                        </span>
                        <h3 className="font-outfit font-bold text-xl text-white mt-2 mb-3">
                          {milestone.title}
                        </h3>
                        <p className="font-inter text-sm text-white/50 leading-relaxed">
                          {milestone.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile layout */}
                <div className="flex md:hidden items-start w-full">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-ive-dark border-2 border-ive-pink/50 flex items-center justify-center text-xl z-10 shadow-lg shadow-ive-pink/20">
                    {milestone.icon}
                  </div>
                  <div className="ml-6 glass-card glass-card-hover rounded-2xl p-5 flex-1">
                    <span className="font-inter text-xs text-ive-accent/70 tracking-wider uppercase">
                      {milestone.date}
                    </span>
                    <h3 className="font-outfit font-bold text-lg text-white mt-1 mb-2">
                      {milestone.title}
                    </h3>
                    <p className="font-inter text-sm text-white/50 leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
