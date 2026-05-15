import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import timelineData from '../data/timeline.json';
import ImageCarousel from './ImageCarousel';

interface TimelineEntry {
  date: string;
  tag: string;
  tagColor: string;
  title: string;
  body: string;
  images?: { src: string; alt: string }[];
  videoId?: string;
  videoUrl?: string;
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
  const [selectedGallery, setSelectedGallery] = useState<{images: {src: string, alt: string}[], initialIndex: number} | null>(null);

  // State for the full-screen lightbox
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxDirection, setLightboxDirection] = useState(0);

  const openLightbox = (images: {src: string, alt: string}[], index: number) => {
    setSelectedGallery({ images, initialIndex: index });
    setLightboxIndex(index);
    setLightboxDirection(0);
  };

  const nextLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedGallery) {
      setLightboxDirection(1);
      setLightboxIndex((prev) => (prev + 1) % selectedGallery.images.length);
    }
  };

  const prevLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedGallery) {
      setLightboxDirection(-1);
      setLightboxIndex((prev) => (prev - 1 + selectedGallery.images.length) % selectedGallery.images.length);
    }
  };

  const lightboxVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

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

                {/* Photo Carousel */}
                {entry.images && entry.images.length > 0 && (
                  <div className="mb-2">
                    <ImageCarousel 
                      images={entry.images} 
                      onSelectImage={(index) => openLightbox(entry.images!, index)}
                    />
                  </div>
                )}

                {/* YouTube embed */}
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

                {/* Reddit native video */}
                {entry.videoUrl && (
                  <div className="w-full rounded-lg overflow-hidden mt-2">
                    <video
                      className="w-full rounded-lg bg-black/20"
                      controls
                      playsInline
                      preload="metadata"
                      style={{ maxHeight: '600px' }}
                    >
                      <source src={entry.videoUrl} type="video/mp4" />
                    </video>
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

      {/* Lightbox Modal with Carousel Support */}
      <AnimatePresence>
        {selectedGallery && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 sm:p-8"
            onClick={() => setSelectedGallery(null)}
          >
            <button 
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-50"
              onClick={() => setSelectedGallery(null)}
            >
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Previous Button */}
            {selectedGallery.images.length > 1 && (
              <button 
                className="absolute left-4 sm:left-10 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-50"
                onClick={prevLightbox}
              >
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Next Button */}
            {selectedGallery.images.length > 1 && (
              <button 
                className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-50"
                onClick={nextLightbox}
              >
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            <div className="relative w-full h-[90vh] flex items-center justify-center overflow-hidden z-40">
              <AnimatePresence initial={false} custom={lightboxDirection}>
                <motion.img 
                  key={lightboxIndex}
                  layoutId={`image-${selectedGallery.images[lightboxIndex].src}`}
                  src={selectedGallery.images[lightboxIndex].src} 
                  alt={selectedGallery.images[lightboxIndex].alt || "Enlarged view"} 
                  custom={lightboxDirection}
                  variants={lightboxVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: 'tween', ease: 'easeInOut', duration: 0.3 },
                    opacity: { duration: 0.2 },
                  }}
                  className="absolute max-w-full max-h-full rounded-md shadow-2xl cursor-default object-contain"
                  onClick={(e) => e.stopPropagation()}
                  loading="lazy"
                />
              </AnimatePresence>
            </div>
            
            {/* Dots Indicator for Lightbox */}
            {selectedGallery.images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 px-3 py-2 rounded-full backdrop-blur-md z-50">
                {selectedGallery.images.map((_, i) => (
                  <button 
                    key={i} 
                    className={`transition-all rounded-full ${
                      i === lightboxIndex ? 'w-2 h-2 bg-white scale-125' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/60'
                    }`}
                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
