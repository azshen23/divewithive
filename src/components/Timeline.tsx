import fansite1 from '../assets/fansite1.jpg';
import fansite2 from '../assets/fansite2.jpg';
import fansite4 from '../assets/fansite4.jpg';
import fansite5 from '../assets/fansite5.jpg';
import fansiteGroup from '../assets/fansite_group_concert.jpg';
import fansiteWonyoung from '../assets/fansite_wonyoung_airport.jpg';

interface TimelineEntry {
  date: string;
  tag: string;
  tagColor: string;
  title: string;
  body: string;
  images?: { src: string; alt: string }[];
  videoId?: string;
}

const timeline: TimelineEntry[] = [
  {
    date: 'May 13, 2026',
    tag: 'Tour',
    tagColor: 'text-emerald-400 bg-emerald-400/10',
    title: 'IVE wraps up Singapore shows, heads to Macao',
    body: 'The SHOW WHAT I AM world tour continues with sold-out shows at the Singapore Indoor Stadium on May 9. Next stops: Macao (May 23-24), then Oceania in June.',
    images: [
      { src: fansiteGroup, alt: 'IVE members performing on stage in Singapore' },
    ],
  },
  {
    date: 'May 10, 2026',
    tag: 'Award',
    tagColor: 'text-amber-400 bg-amber-400/10',
    title: 'IVE ranks #2 in May Idol Brand Reputation',
    body: 'IVE holds strong at #2 in the May 2026 Idol Group Brand Reputation rankings, trailing only BTS. The ranking reflects continued high public interest during their world tour.',
  },
  {
    date: 'May 8, 2026',
    tag: 'Member',
    tagColor: 'text-violet-400 bg-violet-400/10',
    title: 'Rei confirmed as MC for ASEA 2026 in Japan',
    body: 'Rei returns as MC for the 3rd Asia Star Entertainer Awards at Belluna Dome on May 16-17, her second consecutive year hosting the event.',
    images: [
      { src: fansite2, alt: 'Rei at press event' },
    ],
  },
  {
    date: 'May 2, 2026',
    tag: 'Fansite',
    tagColor: 'text-pink-400 bg-pink-400/10',
    title: 'Fansite previews from recent shows',
    body: 'Fansites captured amazing HD photos from recent tour stops. The stage production and outfits are receiving massive praise from DIVEs.',
    images: [
      { src: fansite1, alt: 'High quality concert fan taken photo' },
    ],
  },
  {
    date: 'Apr 20, 2026',
    tag: 'Fansite',
    tagColor: 'text-pink-400 bg-pink-400/10',
    title: 'Airport fashion — Departure for overseas schedule',
    body: 'Fansite photos of the members departing Incheon Airport. Wonyoung and the rest of the members greeted fans brightly.',
    images: [
      { src: fansiteWonyoung, alt: 'Wonyoung airport fashion' },
      { src: fansite4, alt: 'Member airport preview' },
      { src: fansite5, alt: 'Member airport preview' },
    ],
  },
  {
    date: 'Apr 15, 2026',
    tag: 'Release',
    tagColor: 'text-rose-400 bg-rose-400/10',
    title: '"BANG BANG" MV passes 200M views',
    body: 'The music video for BANG BANG from the REVIVE+ album surpasses 200 million views on YouTube, becoming one of the fastest IVE MVs to reach the milestone.',
    videoId: '9qkpcLK422o',
  },
];

const tourDates = [
  { date: 'May 23-24', city: 'Macao', venue: 'The Venetian Arena' },
  { date: 'Jun 13', city: 'Sydney', venue: 'Qudos Bank Arena' },
  { date: 'Jun 16', city: 'Melbourne', venue: 'Rod Laver Arena' },
  { date: 'Jun 20', city: 'Auckland', venue: 'Spark Arena' },
  { date: 'Jul 21', city: 'Toronto', venue: 'Scotiabank Arena' },
  { date: 'Jul 23', city: 'Montreal', venue: 'Centre Bell' },
  { date: 'Jul 25', city: 'Newark', venue: 'Prudential Center' },
  { date: 'Jul 29', city: 'Austin', venue: 'Moody Center' },
  { date: 'Aug 1', city: 'Inglewood', venue: 'Kia Forum' },
  { date: 'Aug 4', city: 'Oakland', venue: 'Oakland Arena' },
  { date: 'Aug 7', city: 'Seattle', venue: 'Climate Pledge Arena' },
  { date: 'Aug 9', city: 'Vancouver', venue: 'Rogers Arena' },
];

export default function Timeline() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">
        {/* Main Timeline */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <h2 className="font-outfit font-bold text-xl text-white/90">Timeline</h2>
            <div className="h-px flex-1 bg-white/5" />
            <span className="font-inter text-xs text-white/30">Last 30 days</span>
          </div>

          <div className="space-y-1">
            {timeline.map((entry) => (
              <article
                key={entry.title}
                className="card rounded-xl p-5 group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${entry.tagColor}`}>
                    {entry.tag}
                  </span>
                  <span className="font-inter text-xs text-white/25">{entry.date}</span>
                </div>

                <h3 className="font-outfit font-semibold text-[15px] text-white/90 leading-snug mb-1.5">
                  {entry.title}
                </h3>

                <p className="font-inter text-sm text-white/40 leading-relaxed mb-3">
                  {entry.body}
                </p>

                {/* Photo grid */}
                {entry.images && (
                  <div className={`grid gap-2 mb-1 ${
                    entry.images.length === 1 ? 'grid-cols-1 max-w-sm' :
                    entry.images.length === 2 ? 'grid-cols-2 max-w-lg' :
                    'grid-cols-3 max-w-2xl'
                  }`}>
                    {entry.images.map((img) => (
                      <div key={img.alt} className="rounded-lg overflow-hidden aspect-[3/4]">
                        <img
                          src={img.src}
                          alt={img.alt}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Video embed */}
                {entry.videoId && (
                  <div className="max-w-lg rounded-lg overflow-hidden aspect-video">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${entry.videoId}?rel=0`}
                      title={entry.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Tour Dates */}
          <div className="card rounded-xl p-5 sticky top-20">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
              <h3 className="font-outfit font-semibold text-sm text-white/70">
                SHOW WHAT I AM — Tour
              </h3>
            </div>

            <div className="space-y-2.5">
              {tourDates.map((show) => (
                <div key={`${show.city}-${show.date}`} className="flex items-center gap-3">
                  <span className="w-14 text-right font-inter text-[11px] text-pink-400/70 font-medium shrink-0">
                    {show.date}
                  </span>
                  <div className="min-w-0">
                    <p className="font-inter text-xs text-white/70 font-medium truncate">{show.city}</p>
                    <p className="font-inter text-[11px] text-white/25 truncate">{show.venue}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Info */}
          <div className="card rounded-xl p-5">
            <h3 className="font-outfit font-semibold text-sm text-white/70 mb-3">About IVE</h3>
            <div className="space-y-2">
              {[
                ['Debut', 'December 1, 2021'],
                ['Members', '6'],
                ['Agency', 'Starship Entertainment'],
                ['Fandom', 'DIVE'],
                ['Latest Album', 'REVIVE+ (Feb 2026)'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="font-inter text-[11px] text-white/25">{label}</span>
                  <span className="font-inter text-[11px] text-white/50">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="card rounded-xl p-5">
            <h3 className="font-outfit font-semibold text-sm text-white/70 mb-3">Follow</h3>
            <div className="space-y-2">
              {[
                ['Instagram', 'https://www.instagram.com/ivestarship/'],
                ['Twitter / X', 'https://twitter.com/IVEstarship'],
                ['YouTube', 'https://www.youtube.com/@IVEstarship'],
                ['Weverse', 'https://weverse.io/ive'],
                ['TikTok', 'https://www.tiktok.com/@ivestarship'],
              ].map(([name, url]) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between group"
                >
                  <span className="font-inter text-xs text-white/40 group-hover:text-white/70 transition-colors">{name}</span>
                  <span className="font-inter text-[11px] text-white/20 group-hover:text-white/40 transition-colors">→</span>
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
