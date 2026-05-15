import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageCarouselProps {
  images: { src: string; alt: string }[];
  onSelectImage?: (index: number) => void;
}

export default function ImageCarousel({ images, onSelectImage }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div 
        className="rounded-lg overflow-hidden w-full max-h-[500px] cursor-pointer group/img relative"
        onClick={() => onSelectImage?.(0)}
      >
        <div className="absolute inset-0 bg-white/0 group-hover/img:bg-white/10 transition-colors duration-300 z-10" />
        <motion.img
          layoutId={`image-${images[0].src}`}
          src={images[0].src}
          alt={images[0].alt}
          className="w-full h-full max-h-[500px] object-cover"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          loading="lazy"
        />
      </div>
    );
  }

  const [direction, setDirection] = useState(0);

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const variants = {
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
    <div className="relative rounded-lg overflow-hidden w-full h-[500px] group/carousel bg-black/20">
      <div 
        className="cursor-pointer relative h-full w-full flex items-center justify-center overflow-hidden"
        onClick={() => onSelectImage?.(currentIndex)}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={currentIndex}
            layoutId={`image-${images[currentIndex].src}`}
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
            className="absolute max-w-full max-h-full object-contain"
            loading="lazy"
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
