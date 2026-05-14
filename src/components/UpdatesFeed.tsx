import { useScrollReveal } from '../hooks/useScrollReveal';

interface NewsItem {
  date: string;
  tag: string;
  tagColor: string;
  title: string;
  summary: string;
  link?: string;
}

const newsItems: NewsItem[] = [
  {
    date: 'May 13, 2026',
    tag: 'Tour',
    tagColor: 'bg-emerald-500/20 text-emerald-400',
    title: 'IVE wraps up Singapore shows, heads to Macao',
    summary: 'The SHOW WHAT I AM world tour continues with sold-out shows in Singapore on May 9. Next stops: Macao (May 23-24), followed by the Oceania leg in June.',
  },
  {
    date: 'May 10, 2026',
    tag: 'Award',
    tagColor: 'bg-amber-500/20 text-amber-400',
    title: 'IVE ranks #2 in May Idol Brand Reputation',
    summary: 'IVE maintains their position as one of K-pop\'s top groups, ranking 2nd in the May 2026 Idol Group Brand Reputation rankings, right behind BTS.',
  },
  {
    date: 'May 8, 2026',
    tag: 'Member',
    tagColor: 'bg-violet-500/20 text-violet-400',
    title: 'Rei to MC the 3rd ASEA Awards in Japan',
    summary: 'Rei will serve as MC for the Asia Star Entertainer Awards on May 16-17 at Belluna Dome, marking her second consecutive year hosting the event.',
  },
  {
    date: 'Feb 23, 2026',
    tag: 'Comeback',
    tagColor: 'bg-ive-pink/20 text-ive-pink',
    title: 'REVIVE+ — 2nd Full Album drops worldwide',
    summary: '12-track album featuring title tracks "BLACKHOLE" and "BANG BANG," plus solo tracks for all six members: FORCE (Yujin), Odd (Gaeul), In Your Heart (Rei), 8 (Wonyoung), Unreal (Liz), Super ICY (Leeseo).',
  },
  {
    date: 'Feb 9, 2026',
    tag: 'Release',
    tagColor: 'bg-rose-500/20 text-rose-400',
    title: '"BANG BANG" pre-release single out now',
    summary: 'The high-energy pre-release single for REVIVE+ drops with an official MV, showcasing a powerful performance-driven concept.',
  },
  {
    date: 'Aug 25, 2025',
    tag: 'Comeback',
    tagColor: 'bg-ive-pink/20 text-ive-pink',
    title: 'IVE SECRET — 4th EP with "XOXZ"',
    summary: 'IVE drops their 4th mini album featuring the dreamy title track "XOXZ," continuing their streak of chart-topping releases.',
  },
  {
    date: 'Feb 3, 2025',
    tag: 'Comeback',
    tagColor: 'bg-ive-pink/20 text-ive-pink',
    title: 'IVE EMPATHY — "Rebel Heart" & "Attitude"',
    summary: 'Double title tracks mark a bold new direction. The 3rd EP showcases IVE\'s musical growth with contrasting concepts.',
  },
  {
    date: 'Apr 29, 2024',
    tag: 'Comeback',
    tagColor: 'bg-ive-pink/20 text-ive-pink',
    title: 'IVE SWITCH era — "HEYA" takes over',
    summary: '"HEYA" becomes an instant hit with its catchy choreography and vibrant concept. "Accendio" serves as the second title track.',
  },
];

const tourDates = [
  { date: 'May 23-24', city: 'Macao', venue: 'The Venetian Arena', status: 'upcoming' as const },
  { date: 'Jun 13', city: 'Sydney', venue: 'Qudos Bank Arena', status: 'upcoming' as const },
  { date: 'Jun 16', city: 'Melbourne', venue: 'Rod Laver Arena', status: 'upcoming' as const },
  { date: 'Jun 20', city: 'Auckland', venue: 'Spark Arena', status: 'upcoming' as const },
  { date: 'Jul 21', city: 'Toronto', venue: 'Scotiabank Arena', status: 'upcoming' as const },
  { date: 'Jul 23', city: 'Montreal', venue: 'Centre Bell', status: 'upcoming' as const },
  { date: 'Jul 25', city: 'Newark', venue: 'Prudential Center', status: 'upcoming' as const },
  { date: 'Jul 29', city: 'Austin', venue: 'Moody Center', status: 'upcoming' as const },
  { date: 'Aug 1', city: 'Inglewood', venue: 'Kia Forum', status: 'upcoming' as const },
  { date: 'Aug 4', city: 'Oakland', venue: 'Oakland Arena', status: 'upcoming' as const },
  { date: 'Aug 7', city: 'Seattle', venue: 'Climate Pledge Arena', status: 'upcoming' as const },
  { date: 'Aug 9', city: 'Vancouver', venue: 'Rogers Arena', status: 'upcoming' as const },
];

export default function UpdatesFeed() {
  const { ref, isRevealed } = useScrollReveal<HTMLElement>(0.05);

  return (
    <section
      id="updates"
      ref={ref}
      className="relative py-16 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* News Feed — Main column */}
          <div className="lg:col-span-2">
            <div
              className={`flex items-center gap-3 mb-8 transition-all duration-700 ${
                isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <h2 className="font-outfit font-bold text-2xl text-white">
                Latest Updates
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>

            <div className="space-y-4">
              {newsItems.map((item, index) => (
                <article
                  key={item.title}
                  className={`glass-card glass-card-hover rounded-xl p-5 transition-all duration-700 ${
                    isRevealed
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${index * 80 + 100}ms` }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${item.tagColor}`}>
                      {item.tag}
                    </span>
                    <span className="font-inter text-xs text-white/30">
                      {item.date}
                    </span>
                  </div>
                  <h3 className="font-outfit font-semibold text-lg text-white mb-1.5 leading-snug">
                    {item.title}
                  </h3>
                  <p className="font-inter text-sm text-white/40 leading-relaxed">
                    {item.summary}
                  </p>
                </article>
              ))}
            </div>
          </div>

          {/* Sidebar — Tour Dates */}
          <div className="lg:col-span-1">
            <div
              className={`transition-all duration-700 delay-200 ${
                isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="flex items-center gap-3 mb-8">
                <h2 className="font-outfit font-bold text-2xl text-white">
                  Tour Dates
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
              </div>

              <div className="glass-card rounded-xl p-5 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-ive-pink animate-pulse" />
                  <span className="font-outfit font-semibold text-sm text-ive-accent">
                    SHOW WHAT I AM
                  </span>
                </div>

                <div className="space-y-3">
                  {tourDates.map((show, index) => (
                    <div
                      key={`${show.city}-${show.date}`}
                      className={`flex items-center gap-3 py-2 transition-all duration-500 ${
                        isRevealed ? 'opacity-100' : 'opacity-0'
                      } ${index < tourDates.length - 1 ? 'border-b border-white/5' : ''}`}
                      style={{ transitionDelay: `${index * 60 + 400}ms` }}
                    >
                      <div className="flex-shrink-0 w-16 text-right">
                        <span className="font-inter text-xs font-medium text-ive-accent/70">
                          {show.date}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-inter text-sm text-white font-medium truncate">
                          {show.city}
                        </p>
                        <p className="font-inter text-xs text-white/30 truncate">
                          {show.venue}
                        </p>
                      </div>
                      <span className="flex-shrink-0 w-2 h-2 rounded-full bg-emerald-400/60" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="glass-card rounded-xl p-5">
                <h3 className="font-outfit font-semibold text-sm text-white/60 uppercase tracking-wider mb-4">
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Debut', value: 'Dec 1, 2021' },
                    { label: 'Members', value: '6' },
                    { label: 'Albums', value: '10+ releases' },
                    { label: 'Agency', value: 'Starship Ent.' },
                    { label: 'Fandom', value: 'DIVE' },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between">
                      <span className="font-inter text-xs text-white/30">{stat.label}</span>
                      <span className="font-inter text-xs text-white/70 font-medium">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
