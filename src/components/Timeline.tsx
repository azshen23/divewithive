import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import timelineData from '../data/timeline.json';
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

interface TimelineProps {
  onLightboxToggle?: (isOpen: boolean) => void;
}

const archiveModules = import.meta.glob('../data/archive/*.json');

const availableArchives = Object.keys(archiveModules).map(filePath => {
  const match = filePath.match(/timeline-(\d{4})-(\d{2})\.json$/);
  if (match) {
    const year = match[1];
    const monthNum = parseInt(match[2], 10);
    const date = new Date(parseInt(year), monthNum - 1, 1);
    const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return { key: `${year}-${match[2]}`, label, filePath };
  }
  return { key: filePath, label: filePath, filePath };
}).sort((a, b) => b.key.localeCompare(a.key));

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

const platformFilters = [
  { 
    name: 'All', 
    gradient: 'from-emerald-500/30 to-teal-500/30', 
    border: 'border-emerald-500/40', 
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]'
  },
  { 
    name: 'YouTube', 
    gradient: 'from-red-500/30 to-rose-500/30', 
    border: 'border-red-500/40', 
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.2)]'
  },
  { 
    name: 'TikTok', 
    gradient: 'from-cyan-500/30 to-pink-500/30', 
    border: 'border-cyan-500/40', 
    glow: 'shadow-[0_0_20px_rgba(6,182,212,0.2)]'
  },
  { 
    name: 'Instagram', 
    gradient: 'from-purple-500/30 to-pink-500/30', 
    border: 'border-pink-500/40', 
    glow: 'shadow-[0_0_20px_rgba(236,72,153,0.2)]'
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
  // State for platform filter
  const [selectedPlatform, setSelectedPlatform] = useState('All');

  // State for archive switcher
  const [currentArchiveKey, setCurrentArchiveKey] = useState<string>('recent');
  const [isArchiveDropdownOpen, setIsArchiveDropdownOpen] = useState<boolean>(false);
  const [isLoadingArchive, setIsLoadingArchive] = useState<boolean>(false);
  const [activeTimelineData, setActiveTimelineData] = useState<TimelineEntry[]>(timelineData);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsArchiveDropdownOpen(false);
      }
    };
    if (isArchiveDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isArchiveDropdownOpen]);

  const getEntryYearMonth = (entry: TimelineEntry): string => {
    if (entry.last_updated && entry.last_updated.length >= 7) {
      const ym = entry.last_updated.slice(0, 7);
      if (/^\d{4}-\d{2}$/.test(ym)) return ym;
    }
    try {
      const d = new Date(entry.date);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
      }
    } catch {
      // ignore invalid date
    }
    return '';
  };

  const handleArchiveChange = async (archiveKey: string) => {
    setIsArchiveDropdownOpen(false);
    if (archiveKey === currentArchiveKey) return;
    setCurrentArchiveKey(archiveKey);
    setIsLoadingArchive(true);
    setSelectedMember('All');
    setSelectedPlatform('All');
    setVisibleCount(15);

    if (archiveKey === 'recent') {
      setActiveTimelineData(timelineData);
      setIsLoadingArchive(false);
    } else {
      const archObj = availableArchives.find(a => a.key === archiveKey);
      if (archObj && archiveModules[archObj.filePath]) {
        try {
          const module = await archiveModules[archObj.filePath]() as { default: TimelineEntry[] };
          const archivedEntries = module.default || [];
          
          // Filter recent timelineData for any posts matching this archive month
          const recentMatchingEntries = timelineData.filter(entry => getEntryYearMonth(entry) === archiveKey);
          
          // Combine and deduplicate by post_url or title
          const combined = [...recentMatchingEntries, ...archivedEntries];
          const seen = new Set<string>();
          const deduplicated = combined.filter(entry => {
            const id = entry.post_url || entry.title;
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
          });

          setActiveTimelineData(deduplicated);
        } catch (err) {
          console.error('Failed to load archive:', err);
          setActiveTimelineData([]);
        }
      }
      setIsLoadingArchive(false);
    }
  };

  const filteredTimeline = activeTimelineData.filter((entry) => {
    // Member Filter
    if (selectedMember !== 'All') {
      const memberSearchStr = `${entry.title} ${entry.body}`.toLowerCase();
      const regex = new RegExp(`\\b${selectedMember.toLowerCase()}\\b`, 'i');
      if (!regex.test(memberSearchStr)) return false;
    }

    // Platform Filter
    if (selectedPlatform !== 'All') {
      const platformSearchStr = `${entry.title} ${entry.body} ${entry.post_url || ''}`.toLowerCase();
      if (selectedPlatform === 'YouTube') {
        const isYT = !!entry.videoId || platformSearchStr.includes('youtube');
        if (!isYT) return false;
      } else if (selectedPlatform === 'TikTok') {
        const isTT = platformSearchStr.includes('tiktok');
        if (!isTT) return false;
      } else if (selectedPlatform === 'Instagram') {
        const isIG = platformSearchStr.includes('instagram') || platformSearchStr.includes('ig update');
        if (!isIG) return false;
      }
    }

    return true;
  });

  // State and ref for infinite scroll
  const [visibleCount, setVisibleCount] = useState(15);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isLoadMoreInView = useInView(loadMoreRef, { amount: 0.1 });

  useEffect(() => {
    if (isLoadMoreInView && visibleCount < filteredTimeline.length) {
      setVisibleCount(prev => Math.min(prev + 10, filteredTimeline.length));
    }
  }, [isLoadMoreInView, visibleCount, filteredTimeline.length]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(15);
  }, [selectedMember, selectedPlatform]);

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

  const formatLastUpdated = (entry?: TimelineEntry) => {
    if (!entry) return '';
    if (entry.last_updated) {
      try {
        const date = new Date(entry.last_updated);
        if (!isNaN(date.getTime())) {
          return date.toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            timeZoneName: 'short'
          });
        }
      } catch {
        // fallback
      }
      return entry.last_updated;
    }
    return entry.date;
  };

  const visibleTimeline = filteredTimeline.slice(0, visibleCount);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">
        {/* Main Timeline */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <h2 className="font-outfit font-bold text-xl text-white/90">
              {currentArchiveKey === 'recent' ? 'IVE Updates' : `${availableArchives.find(a => a.key === currentArchiveKey)?.label} Archive`}
            </h2>
            <div className="h-px flex-1 bg-white/5" />
            <span className="font-inter text-xs text-white/30">Last updated: {formatLastUpdated(activeTimelineData[0])}</span>
          </div>

          {/* Archive Switcher Bar */}
          {availableArchives.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white/[0.02] border border-white/[0.05] rounded-2xl backdrop-blur-md shadow-lg p-2 mb-6 relative z-[90]">
              <span className="font-inter text-xs sm:text-sm text-white/40 flex items-center gap-1.5 px-2 sm:px-3">
                <svg className="w-4 h-4 text-emerald-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Timeline Period:
              </span>

              <div className="relative z-[90]" ref={dropdownRef}>
                <button
                  onClick={() => setIsArchiveDropdownOpen(!isArchiveDropdownOpen)}
                  className={`flex items-center gap-2.5 bg-white/[0.05] hover:bg-white/[0.08] text-white/90 font-inter text-xs sm:text-sm font-medium px-4 py-2 sm:py-2.5 rounded-xl border transition-all duration-300 outline-none cursor-pointer ${
                    currentArchiveKey !== 'recent'
                      ? 'border-pink-500/40 shadow-[0_0_20px_rgba(236,72,153,0.15)] bg-gradient-to-r from-purple-500/20 to-pink-500/20' 
                      : 'border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)] bg-gradient-to-r from-emerald-500/20 to-teal-500/20'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {currentArchiveKey === 'recent' ? (
                      <>
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        🌟 Recent Updates
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
                        🗂️ {availableArchives.find(a => a.key === currentArchiveKey)?.label} Archive
                      </>
                    )}
                  </span>
                  <motion.svg 
                    animate={{ rotate: isArchiveDropdownOpen ? 180 : 0 }} 
                    transition={{ duration: 0.2 }}
                    className="w-3.5 h-3.5 text-white/40" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </button>

                <AnimatePresence>
                  {isArchiveDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 top-full mt-2 w-52 bg-neutral-900/95 backdrop-blur-xl border border-white/[0.1] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden z-[100] flex flex-col py-1.5"
                    >
                      <button
                        onClick={() => handleArchiveChange('recent')}
                        className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 font-inter text-xs sm:text-sm font-medium transition-all duration-200 text-left ${
                          currentArchiveKey === 'recent'
                            ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-white font-semibold border-l-4 border-emerald-400 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]'
                            : 'text-white/70 hover:bg-white/[0.06] hover:text-white'
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${currentArchiveKey === 'recent' ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
                        🌟 Recent Updates
                      </button>

                      <div className="h-px bg-white/[0.08] my-1" />

                      <div className="max-h-60 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
                        {availableArchives.map((arch) => {
                          const isActive = currentArchiveKey === arch.key;
                          return (
                            <button
                              key={arch.key}
                              onClick={() => handleArchiveChange(arch.key)}
                              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 font-inter text-xs sm:text-sm font-medium transition-all duration-200 text-left ${
                                isActive
                                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white font-semibold border-l-4 border-pink-400 shadow-[inset_0_0_20px_rgba(236,72,153,0.1)]'
                                  : 'text-white/70 hover:bg-white/[0.06] hover:text-white'
                              }`}
                            >
                              <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-pink-400 animate-pulse' : 'bg-white/20'}`} />
                              🗂️ {arch.label} Archive
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Filter Bars Container */}
          <div className="flex flex-col gap-3 mb-6">
            {/* Member Filter Bar */}
            <div className="flex flex-wrap items-center gap-1.5 bg-white/[0.02] border border-white/[0.05] rounded-2xl backdrop-blur-md shadow-lg p-1.5">
              {memberFilters.map((filter) => {
                const isActive = selectedMember === filter.name;
                return (
                  <button
                    key={filter.name}
                    onClick={() => setSelectedMember(filter.name)}
                    className={`relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-inter text-xs sm:text-sm font-medium transition-all duration-300 ${
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

            {/* Platform Filter Bar */}
            <div className="flex flex-wrap items-center gap-1.5 bg-white/[0.02] border border-white/[0.05] rounded-2xl backdrop-blur-md shadow-lg p-1.5">
              {platformFilters.map((filter) => {
                const isActive = selectedPlatform === filter.name;
                return (
                  <button
                    key={filter.name}
                    onClick={() => setSelectedPlatform(filter.name)}
                    className={`relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-inter text-xs sm:text-sm font-medium transition-all duration-300 ${
                      isActive 
                        ? 'text-white shadow-lg' 
                        : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activePlatformFilter"
                        className={`absolute inset-0 rounded-xl bg-gradient-to-r ${filter.gradient} border ${filter.border} ${filter.glow} -z-10`}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      />
                    )}
                    <span className="relative z-10">{filter.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {isLoadingArchive ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="card rounded-xl p-16 text-center flex flex-col items-center justify-center gap-4"
                >
                  <div className="w-8 h-8 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                  <p className="font-outfit text-base text-white/60">Loading timeline archive...</p>
                </motion.div>
              ) : filteredTimeline.length === 0 ? (
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
                visibleTimeline.map((entry) => (
                  <motion.article
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    key={entry.post_url || entry.title}
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

            {/* Infinite Scroll Trigger / Loading Indicator */}
            {visibleCount < filteredTimeline.length && (
              <div ref={loadMoreRef} className="py-8 flex justify-center items-center">
                <div className="flex items-center gap-2 text-white/40 font-inter text-sm">
                  <div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                  <span>Loading more updates...</span>
                </div>
              </div>
            )}
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
