import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import timelineData from '../data/timeline.json';
import Footer from './Footer';
import MusicPlayer from './MusicPlayer';
import TourDatesWidget from './TourDatesWidget';
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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-8">
        {/* Left Sidebar: Music Player */}
        <aside className="space-y-6 order-1 lg:order-none">
          <div className="sticky top-20 space-y-6">
            <MusicPlayer />
          </div>
        </aside>

        {/* Main Timeline */}
        <div className="min-w-0 order-2 lg:order-none">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <h2 className="font-outfit font-bold text-xl text-white/90">
              {currentArchiveKey === 'recent' ? 'IVE Updates' : `${availableArchives.find(a => a.key === currentArchiveKey)?.label} Archive`}
            </h2>
            <div className="h-px flex-1 bg-white/5" />
            <span className="font-inter text-xs text-white/30">Last updated: {formatLastUpdated(activeTimelineData[0])}</span>
          </div>

          <ArchiveSwitcher
            availableArchives={availableArchives}
            currentArchiveKey={currentArchiveKey}
            isArchiveDropdownOpen={isArchiveDropdownOpen}
            setIsArchiveDropdownOpen={setIsArchiveDropdownOpen}
            handleArchiveChange={handleArchiveChange}
            dropdownRef={dropdownRef}
          />

          <TimelineFilters
            selectedMember={selectedMember}
            setSelectedMember={setSelectedMember}
            selectedPlatform={selectedPlatform}
            setSelectedPlatform={setSelectedPlatform}
          />

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
                <div className="flex items-center gap-2 text-white/40 font-inter text-sm">
                  <div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                  <span>Loading more updates...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Tour Dates & Footer */}
        <aside className="space-y-6 order-3 lg:order-none">
          <div className="sticky top-20 space-y-6">
            <TourDatesWidget />
            <Footer />
          </div>
        </aside>
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
