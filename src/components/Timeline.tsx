import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import timelineData from '../data/timeline.json';
import ImageCarousel from './ImageCarousel';
import CustomVideoPlayer from './CustomVideoPlayer';

interface TimelineEntry {
  date: string;
  tag: string;
  tagColor: string;
  title: string;
  body: string;
  images?: { src: string; alt: string }[];
  videoId?: string;
  videoUrl?: string;
  post_url?: string;
}

interface TimelineProps {
  onLightboxToggle?: (isOpen: boolean) => void;
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

const memberFilters = [
  { 
    name: 'All', 
    gradient: 'from-emerald-500/30 to-teal-500/30', 
    border: 'border-emerald-500/40', 
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]'
  },
  { 
    name: 'Yujin', 
    gradient: 'from-blue-500/30 to-indigo-500/30', 
    border: 'border-blue-500/40', 
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.2)]'
  },
  { 
    name: 'Gaeul', 
    gradient: 'from-amber-500/30 to-yellow-500/30', 
    border: 'border-amber-500/40', 
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]'
  },
  { 
    name: 'Rei', 
    gradient: 'from-purple-500/30 to-violet-500/30', 
    border: 'border-purple-500/40', 
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.2)]'
  },
  { 
    name: 'Wonyoung', 
    gradient: 'from-rose-500/30 to-pink-500/30', 
    border: 'border-rose-500/40', 
    glow: 'shadow-[0_0_20px_rgba(244,63,94,0.2)]'
  },
  { 
    name: 'Liz', 
    gradient: 'from-orange-500/30 to-amber-500/30', 
    border: 'border-orange-500/40', 
    glow: 'shadow-[0_0_20px_rgba(249,115,22,0.2)]'
  },
  { 
    name: 'Leeseo', 
    gradient: 'from-cyan-500/30 to-blue-500/30', 
    border: 'border-cyan-500/40', 
    glow: 'shadow-[0_0_20px_rgba(6,182,212,0.2)]'
  },
];

export default function Timeline({ onLightboxToggle }: TimelineProps) {
  const [selectedGallery, setSelectedGallery] = useState<{images: {src: string, alt: string}[], initialIndex: number, entryId: string} | null>(null);
  
  // Track current index for each post's inline carousel
  const [carouselIndices, setCarouselIndices] = useState<Record<string, number>>({});

  // State for the full-screen lightbox
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxDirection, setLightboxDirection] = useState(0);

  // State for member filter
  const [selectedMember, setSelectedMember] = useState('All');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedGallery(null);
        onLightboxToggle?.(false);
      }
    };

    if (selectedGallery) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedGallery, onLightboxToggle]);

  const openLightbox = (images: {src: string, alt: string}[], index: number, entryId: string) => {
    setSelectedGallery({ images, initialIndex: index, entryId });
    setLightboxIndex(index);
    setLightboxDirection(0);
    onLightboxToggle?.(true);
  };

  const nextLightbox = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedGallery) {
      setLightboxDirection(1);
      const nextIdx = (lightboxIndex + 1) % selectedGallery.images.length;
      setLightboxIndex(nextIdx);
      setCarouselIndices(prev => ({ ...prev, [selectedGallery.entryId]: nextIdx }));
    }
  };

  const prevLightbox = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedGallery) {
      setLightboxDirection(-1);
      const prevIdx = (lightboxIndex - 1 + selectedGallery.images.length) % selectedGallery.images.length;
      setLightboxIndex(prevIdx);
      setCarouselIndices(prev => ({ ...prev, [selectedGallery.entryId]: prevIdx }));
    }
  };

  const handleLightboxDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number; y: number } }) => {
    const swipe = info.offset.x;
    if (swipe < -50) {
      nextLightbox();
    } else if (swipe > 50) {
      prevLightbox();
    }
  };

  const lightboxVariants = {
    enter: (dir: number) => ({
      x: dir === 0 ? 0 : (dir > 0 ? '100%' : '-100%'),
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir === 0 ? 0 : (dir < 0 ? '100%' : '-100%'),
      opacity: 0,
    }),
  };

  const filteredTimeline = timeline.filter((entry) => {
    if (selectedMember === 'All') return true;
    const searchStr = `${entry.title} ${entry.body}`.toLowerCase();
    const regex = new RegExp(`\\b${selectedMember.toLowerCase()}\\b`, 'i');
    return regex.test(searchStr);
  });

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">
        {/* Main Timeline */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <h2 className="font-outfit font-bold text-xl text-white/90">IVE Updates</h2>
            <div className="h-px flex-1 bg-white/5" />
            <span className="font-inter text-xs text-white/30">Last updated: {timeline[0]?.date}</span>
          </div>

          {/* Member Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 mb-6 p-1.5 bg-white/[0.02] border border-white/[0.05] rounded-2xl backdrop-blur-md shadow-lg">
            {memberFilters.map((filter) => {
              const isActive = selectedMember === filter.name;
              return (
                <button
                  key={filter.name}
                  onClick={() => setSelectedMember(filter.name)}
                  className={`relative px-4 py-2 rounded-xl font-inter text-sm font-medium transition-all duration-300 ${
                    isActive 
                      ? 'text-white shadow-lg' 
                      : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeMemberFilter"
                      className={`absolute inset-0 rounded-xl bg-gradient-to-r ${filter.gradient} border ${filter.border} ${filter.glow} -z-10`}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                  <span className="relative z-10">{filter.name}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {filteredTimeline.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="card rounded-xl p-12 text-center"
                >
                  <p className="font-outfit text-lg text-white/60 mb-2">No updates found for {selectedMember}</p>
                  <p className="font-inter text-sm text-white/30">Check back later for more updates!</p>
                </motion.div>
              ) : (
                filteredTimeline.map((entry) => (
                  <motion.article
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    key={entry.post_url || entry.title}
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
                    {entry.images && entry.images.length === 1 && (
                      <div 
                        className="mt-4 rounded-lg overflow-hidden w-full max-h-[500px] cursor-pointer group/img relative"
                        onClick={() => openLightbox(entry.images || [], 0, entry.title)}
                      >
                        <div className="absolute inset-0 bg-white/0 group-hover/img:bg-white/10 transition-colors duration-300 z-10" />
                        <motion.img 
                          src={entry.images[0].src} 
                          alt={entry.images[0].alt || entry.title} 
                          className="w-full h-full max-h-[500px] object-cover"
                          whileHover={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          loading="lazy"
                        />
                      </div>
                    )}
                    
                    {entry.images && entry.images.length > 1 && (
                      <div className="mt-4">
                        <ImageCarousel 
                          images={entry.images} 
                          currentIndex={carouselIndices[entry.title] || 0}
                          onIndexChange={(idx) => setCarouselIndices(prev => ({ ...prev, [entry.title]: idx }))}
                          onSelectImage={(index) => openLightbox(entry.images || [], index, entry.title)}
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
                      <CustomVideoPlayer src={entry.videoUrl} />
                    )}
                  </motion.article>
                ))
              )}
            </AnimatePresence>
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
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 pb-6 sm:p-8 sm:pb-8"
            onClick={() => {
              setSelectedGallery(null);
              onLightboxToggle?.(false);
            }}
          >
            {/* Background Overlay */}
            <div 
              className="absolute inset-0 bg-black/95 -z-10"
            />

            {/* Close Button */}
            <button 
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-50"
              onClick={() => {
                setSelectedGallery(null);
                onLightboxToggle?.(false);
              }}
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

            <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden z-40">
              <AnimatePresence initial={false} custom={lightboxDirection}>
                <motion.img 
                  key={lightboxIndex}
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
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={1}
                  onDragEnd={handleLightboxDragEnd}
                  className="absolute max-w-full max-h-full rounded-md shadow-2xl cursor-default object-contain pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                  loading="lazy"
                />
              </AnimatePresence>
            </div>
            
            {/* Thumbnail Navigation for Lightbox */}
            {selectedGallery.images.length > 1 && (
              <div 
                className="relative mt-4 flex items-center gap-2 max-w-[90vw] overflow-x-auto px-4 py-3 bg-white/5 backdrop-blur-md rounded-2xl z-50 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                onClick={(e) => e.stopPropagation()}
              >
                {selectedGallery.images.map((img, i) => (
                  <button 
                    key={i} 
                    className={`relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden transition-all ${
                      i === lightboxIndex ? 'ring-2 ring-white scale-105 opacity-100' : 'opacity-50 hover:opacity-100 ring-1 ring-white/20'
                    }`}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (i === lightboxIndex) return;
                      setLightboxDirection(i > lightboxIndex ? 1 : -1);
                      setLightboxIndex(i); 
                      setCarouselIndices(prev => ({ ...prev, [selectedGallery.entryId]: i }));
                    }}
                  >
                    <img src={img.src} alt="Thumbnail preview" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
