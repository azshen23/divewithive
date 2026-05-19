import { motion, AnimatePresence } from 'framer-motion';

interface LightboxModalProps {
  selectedGallery: { images: { src: string; alt: string }[]; initialIndex: number; entryId: string } | null;
  setSelectedGallery: React.Dispatch<React.SetStateAction<{ images: { src: string; alt: string }[]; initialIndex: number; entryId: string } | null>>;
  lightboxIndex: number;
  setLightboxIndex: React.Dispatch<React.SetStateAction<number>>;
  lightboxDirection: number;
  setLightboxDirection: React.Dispatch<React.SetStateAction<number>>;
  setCarouselIndices: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  onLightboxToggle?: (isOpen: boolean) => void;
}

export default function LightboxModal({
  selectedGallery,
  setSelectedGallery,
  lightboxIndex,
  setLightboxIndex,
  lightboxDirection,
  setLightboxDirection,
  setCarouselIndices,
  onLightboxToggle
}: LightboxModalProps) {
  if (!selectedGallery) return null;

  const nextLightbox = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLightboxDirection(1);
    const nextIdx = (lightboxIndex + 1) % selectedGallery.images.length;
    setLightboxIndex(nextIdx);
    setCarouselIndices(prev => ({ ...prev, [selectedGallery.entryId]: nextIdx }));
  };

  const prevLightbox = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLightboxDirection(-1);
    const prevIdx = (lightboxIndex - 1 + selectedGallery.images.length) % selectedGallery.images.length;
    setLightboxIndex(prevIdx);
    setCarouselIndices(prev => ({ ...prev, [selectedGallery.entryId]: prevIdx }));
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

  return (
    <AnimatePresence>
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
        <div className="absolute inset-0 bg-black/95 -z-10" />

        {/* Close Button */}
        <button 
          className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-50 cursor-pointer"
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
            className="absolute left-4 sm:left-10 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-50 cursor-pointer"
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
            className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-50 cursor-pointer"
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
              crossOrigin="anonymous"
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
                className={`relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden transition-all cursor-pointer ${
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
                <img src={img.src} alt="Thumbnail preview" className="w-full h-full object-cover" loading="lazy" crossOrigin="anonymous" />
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
