import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import ImageCarousel from './ImageCarousel';
import CustomVideoPlayer from './CustomVideoPlayer';


const handleImageError = (src: string) => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'DELETE_FROM_CACHE',
      url: src,
    });
  }
};

interface TimelineEntry {
  date: string;
  last_updated?: string;
  tag: string;
  tagColor: string;
  title: string;
  body: string;
  images?: { src: string; alt: string }[];
  videoId?: string;
  videoUrl?: string;
  post_url?: string;
}

interface TimelineCardProps {
  entry: TimelineEntry;
  carouselIndices: Record<string, number>;
  setCarouselIndices: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  openLightbox: (images: { src: string; alt: string }[], index: number, entryId: string) => void;
}

const tagStyles: Record<string, string> = {
  Release: 'text-rose-300 bg-rose-500/15 border-rose-400/25',
  Member: 'text-pink-200 bg-pink-500/15 border-pink-400/25',
  Award: 'text-amber-300 bg-amber-500/15 border-amber-400/25',
  Tour: 'text-emerald-300 bg-emerald-500/15 border-emerald-400/25',
  Fansite: 'text-sky-300 bg-sky-500/15 border-sky-400/25',
};

const TimelineCard = forwardRef<HTMLDivElement, TimelineCardProps>(({
  entry,
  carouselIndices,
  setCarouselIndices,
  openLightbox
}, ref) => {
  const badgeClass = tagStyles[entry.tag] || 'text-white/75 bg-white/[0.06] border-white/10';

  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.25 }}
      className="card rounded-2xl p-5 sm:p-6 group"
    >
      <div className="flex items-center gap-2.5 mb-2.5 min-w-0">
        <span className="font-inter text-xs text-white/50 font-medium">{entry.date}</span>
        {entry.tag && (
          <span className={`font-inter text-[11px] font-medium px-2 py-0.5 rounded-md border ${badgeClass}`}>
            {entry.tag}
          </span>
        )}
      </div>

      <h3 className="font-outfit font-semibold text-base sm:text-[17px] text-white/95 leading-snug mb-1.5">
        {entry.title}
      </h3>

      <p className="font-inter text-sm text-white/60 leading-relaxed max-w-[68ch]">
        {entry.body}
      </p>

      {/* Photo Carousel */}
      {entry.images && entry.images.length === 1 && (
        <div
          className="mt-4 rounded-xl overflow-hidden w-full max-h-[520px] cursor-pointer group/img relative border border-white/[0.06]"
          onClick={() => openLightbox(entry.images || [], 0, entry.title)}
        >
          <div className="absolute inset-0 bg-white/0 group-hover/img:bg-white/[0.06] transition-colors duration-300 z-10" />
          <motion.img
            src={entry.images[0].src}
            alt={entry.images[0].alt || entry.title}
            className="w-full h-full max-h-[520px] object-cover"
            whileHover={{ scale: 1.015 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            loading="lazy"
            onError={() => handleImageError(entry.images![0].src)}
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
        <div className="mt-4 w-full rounded-xl overflow-hidden aspect-video border border-white/[0.06]">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${entry.videoId}?rel=0&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
            title={entry.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      )}

      {/* Reddit native video */}
      {entry.videoUrl && (
        <div className="mt-4">
          <CustomVideoPlayer src={entry.videoUrl} />
        </div>
      )}
    </motion.article>
  );
});

TimelineCard.displayName = 'TimelineCard';

export default TimelineCard;