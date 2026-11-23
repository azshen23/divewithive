import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import timelineData from '../data/timeline.json';
import Footer from './Footer';
import MusicPlayer from './MusicPlayer';
import TimelineFilters from './TimelineFilters';
import ArchiveSwitcher from './ArchiveSwitcher';
import TimelineCard from './TimelineCard';
import LightboxModal from './LightboxModal';

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

export default function Timeline({ onLightboxToggle }: TimelineProps) {
  const [selectedGallery, setSelectedGallery] = useState<{images: {src: string, alt: string}[], initialIndex: number, entryId: string} | null>(null);
  const [carouselIndices, setCarouselIndices] = useState<Record<string, number>>({});
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxDirection, setLightboxDirection] = useState(0);
  const [selectedMember, setSelectedMember] = useState('All');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
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
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-[296px_minmax(0,1fr)] gap-6 lg:gap-8 items-start">
        {/* Left Sidebar: Brand, Music Player & Footer */}
        <aside className="hidden lg:block">
          <div className="sticky top-8 space-y-5">
            <div className="px-1">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span className="font-outfit font-bold text-lg tracking-tight text-white">Dive with IVE</span>
              </div>
              <p className="font-inter text-xs text-white/50 mt-1">
                Curated real-time timeline &amp; media archive
              </p>
            </div>
            <MusicPlayer />
            <Footer />
          </div>
        </aside>

        {/* Main Timeline */}
        <div className="min-w-0">
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 lg:hidden shrink-0" />
                <h1 className="font-outfit font-bold text-xl sm:text-2xl text-white tracking-tight truncate">
                  {currentArchiveKey === 'recent' ? 'IVE Updates' : `${availableArchives.find(a => a.key === currentArchiveKey)?.label} Archive`}
                </h1>
                <span className="font-inter text-xs text-white/45 bg-white/[0.04] border border-white/[0.07] px-2 py-0.5 rounded-md tabular-nums shrink-0">
                  {filteredTimeline.length}
                </span>
              </div>
              <p className="font-inter text-xs text-white/45 mt-1">
                Last updated {formatLastUpdated(activeTimelineData[0])}
              </p>
            </div>

            <ArchiveSwitcher
              availableArchives={availableArchives}
              currentArchiveKey={currentArchiveKey}
              isArchiveDropdownOpen={isArchiveDropdownOpen}
              setIsArchiveDropdownOpen={setIsArchiveDropdownOpen}
              handleArchiveChange={handleArchiveChange}
              dropdownRef={dropdownRef}
            />
          </header>

          <TimelineFilters
            selectedMember={selectedMember}
            setSelectedMember={setSelectedMember}
            selectedPlatform={selectedPlatform}
            setSelectedPlatform={setSelectedPlatform}
          />

          <div className="flex flex-col gap-3.5">
            <AnimatePresence mode="popLayout">
              {isLoadingArchive ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className="card rounded-2xl p-14 text-center flex flex-col items-center justify-center gap-3.5"
                >
                  <div className="w-7 h-7 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                  <p className="font-outfit text-base text-white/70">Loading timeline archive...</p>
                </motion.div>
              ) : filteredTimeline.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="card rounded-2xl p-12 text-center"
                >
                  <p className="font-outfit text-lg text-white/80 mb-1.5">
                    No updates found{selectedMember !== 'All' ? ` for ${selectedMember}` : ''}{selectedPlatform !== 'All' ? ` on ${selectedPlatform}` : ''}
                  </p>
                  <p className="font-inter text-sm text-white/45 mb-5">Try another period or clear active filters.</p>
                  {(selectedMember !== 'All' || selectedPlatform !== 'All') && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMember('All');
                        setSelectedPlatform('All');
                      }}
                      className="font-inter text-xs font-medium px-4 py-2 rounded-lg bg-white text-[#0a0a0f] hover:bg-white/90 transition-colors cursor-pointer"
                    >
                      Reset filters
                    </button>
                  )}
                </motion.div>
              ) : (
                visibleTimeline.map((entry) => (
                  <TimelineCard
                    key={entry.post_url || entry.title}
                    entry={entry}
                    carouselIndices={carouselIndices}
                    setCarouselIndices={setCarouselIndices}
                    openLightbox={openLightbox}
                  />
                ))
              )}
            </AnimatePresence>

            {/* Infinite Scroll Trigger / Loading Indicator */}
            {visibleCount < filteredTimeline.length && (
              <div ref={loadMoreRef} className="py-8 flex justify-center items-center">
                <div className="flex items-center gap-2 text-white/50 font-inter text-sm">
                  <div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                  <span>Loading more updates...</span>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Footer */}
          <div className="mt-8 lg:hidden">
            <Footer />
          </div>
        </div>
      </div>

      <LightboxModal
        selectedGallery={selectedGallery}
        setSelectedGallery={setSelectedGallery}
        lightboxIndex={lightboxIndex}
        setLightboxIndex={setLightboxIndex}
        lightboxDirection={lightboxDirection}
        setLightboxDirection={setLightboxDirection}
        setCarouselIndices={setCarouselIndices}
        onLightboxToggle={onLightboxToggle}
      />
    </main>
  );
}