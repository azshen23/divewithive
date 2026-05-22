import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackEvent } from '../utils/analytics';

const handleImageError = (src: string) => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'DELETE_FROM_CACHE',
      url: src,
    });
  }
};

interface ImageCarouselProps {
  images: { src: string; alt: string }[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onSelectImage?: (index: number) => void;
}

export default function ImageCarousel({ images, currentIndex, onIndexChange, onSelectImage }: ImageCarouselProps) {
  const [direction, setDirection] = useState(0);

  if (!images || images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div 
        className="rounded-lg overflow-hidden w-full max-h-[500px] cursor-pointer group/img relative"
        onClick={() => {
          trackEvent('Carousel Image Clicked', { index: 0, src: images[0].src });
          onSelectImage?.(0);
        }}
      >
        <div className="absolute inset-0 bg-white/0 group-hover/img:bg-white/10 transition-colors duration-300 z-10" />
        <motion.img
          src={images[0].src}
          alt={images[0].alt}
          className="w-full h-full max-h-[500px] object-cover"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          loading="lazy"
          onError={() => handleImageError(images[0].src)}
        />
      </div>
    );
  }

  const nextSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    trackEvent('Carousel Slide Changed', { direction: 'next', toIndex: (currentIndex + 1) % images.length });
    setDirection(1);
    onIndexChange((currentIndex + 1) % images.length);
  };

  const prevSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    trackEvent('Carousel Slide Changed', { direction: 'prev', toIndex: (currentIndex - 1 + images.length) % images.length });
    setDirection(-1);
    onIndexChange((currentIndex - 1 + images.length) % images.length);
  };

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number; y: number } }) => {
    const swipe = info.offset.x;
    if (swipe < -50) {
      nextSlide();
    } else if (swipe > 50) {
      prevSlide();
    }
  };

  const variants = {
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
    <div className="relative rounded-lg overflow-hidden w-full h-[500px] group/carousel bg-black/20">
      <div 
        className="cursor-pointer relative h-full w-full flex items-center justify-center overflow-hidden"
        onClick={() => {
          trackEvent('Carousel Image Clicked', { index: currentIndex, src: images[currentIndex].src });
          onSelectImage?.(currentIndex);
        }}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={currentIndex}
            src={images[currentIndex].src}
            alt={images[currentIndex].alt}
            custom={direction}
            variants={variants}
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
            onDragEnd={handleDragEnd}
            className="absolute max-w-full max-h-full object-contain"
            loading="lazy"
            onError={() => handleImageError(images[currentIndex].src)}
          />
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <button 
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-black/70 backdrop-blur-md z-10"
        onClick={prevSlide}
      >
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button 
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-black/70 backdrop-blur-md z-10"
        onClick={nextSlide}
      >
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 px-2 py-1.5 rounded-full backdrop-blur-md z-10">
        {images.map((_, i) => (
          <div 
            key={i} 
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              i === currentIndex ? 'bg-white scale-125' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
