import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
                    entry.images.length === 1 ? 'grid-cols-1' :
                    entry.images.length === 2 ? 'grid-cols-2' :
                    'grid-cols-3'
                  }`}>
                    {entry.images.map((img) => (
                      <div 
                        key={img.alt} 
                        className="rounded-lg overflow-hidden w-full max-h-[500px] cursor-pointer group/img relative"
                        onClick={() => setSelectedImage(img.src)}
                      >
                        <div className="absolute inset-0 bg-white/0 group-hover/img:bg-white/10 transition-colors duration-300 z-10" />
                        <motion.img
                          layoutId={`image-${img.src}`}
                          src={img.src}
                          alt={img.alt}
                          className="w-full h-full max-h-[500px] object-cover"
                          whileHover={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Video embed */}
                {entry.videoId && (
                  <div className="w-full rounded-lg overflow-hidden aspect-video">
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

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 sm:p-8"
            onClick={() => setSelectedImage(null)}
          >
            <button 
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <motion.img 
              layoutId={`image-${selectedImage}`}
              src={selectedImage} 
              alt="Enlarged view" 
              className="max-w-full max-h-full rounded-md shadow-2xl cursor-default"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
