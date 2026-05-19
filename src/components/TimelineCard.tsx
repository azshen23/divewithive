import { motion } from 'framer-motion';
import ImageCarousel from './ImageCarousel';
import CustomVideoPlayer from './CustomVideoPlayer';

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

export default function TimelineCard({
  entry,
  carouselIndices,
  setCarouselIndices,
  openLightbox
}: TimelineCardProps) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="card rounded-xl p-5 group"
    >
      <div className="mb-2">
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
            onError={() => handleImageError(entry.images[0].src)}
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
  );
}
