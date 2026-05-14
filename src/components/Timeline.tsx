import timelineData from '../data/timeline.json';

interface TimelineEntry {
  date: string;
  tag: string;
  tagColor: string;
  title: string;
  body: string;
  images?: { src: string; alt: string }[];
  videoId?: string;
}

const timeline: TimelineEntry[] = timelineData;

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

        </aside>
      </div>
    </main>
  );
}
