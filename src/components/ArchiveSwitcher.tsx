import { RefObject } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ArchiveItem {
  key: string;
  label: string;
  filePath: string;
}

interface ArchiveSwitcherProps {
  availableArchives: ArchiveItem[];
  currentArchiveKey: string;
  isArchiveDropdownOpen: boolean;
  setIsArchiveDropdownOpen: (isOpen: boolean) => void;
  handleArchiveChange: (key: string) => void;
  dropdownRef: RefObject<HTMLDivElement>;
}

export default function ArchiveSwitcher({
  availableArchives,
  currentArchiveKey,
  isArchiveDropdownOpen,
  setIsArchiveDropdownOpen,
  handleArchiveChange,
  dropdownRef
}: ArchiveSwitcherProps) {
  if (availableArchives.length === 0) return null;

  const activeArchive = availableArchives.find(a => a.key === currentArchiveKey);
  const currentLabel = currentArchiveKey === 'recent' ? 'Recent Updates' : `${activeArchive?.label || currentArchiveKey}`;

  return (
    <div className="relative z-40 shrink-0" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsArchiveDropdownOpen(!isArchiveDropdownOpen)}
        aria-haspopup="listbox"
        aria-expanded={isArchiveDropdownOpen}
        aria-label="Select timeline period"
        className={`flex items-center gap-2 font-inter text-xs sm:text-[13px] font-medium px-3 py-2 rounded-xl border transition-colors duration-200 cursor-pointer ${
          currentArchiveKey !== 'recent'
            ? 'bg-rose-500/15 border-rose-400/35 text-rose-100 hover:bg-rose-500/20'
            : 'bg-white/[0.04] border-white/[0.1] text-white/85 hover:bg-white/[0.08] hover:border-white/[0.16]'
        }`}
      >
        <svg className={`w-3.5 h-3.5 shrink-0 ${currentArchiveKey !== 'recent' ? 'text-rose-300' : 'text-emerald-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{currentLabel}</span>
        <motion.svg
          animate={{ rotate: isArchiveDropdownOpen ? 180 : 0 }}
          transition={{ duration: 0.18 }}
          className="w-3.5 h-3.5 text-white/45"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {isArchiveDropdownOpen && (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-52 bg-[#12121a] border border-white/[0.12] rounded-xl shadow-[0_14px_40px_rgba(0,0,0,0.6)] overflow-hidden z-50 flex flex-col py-1.5"
          >
            <button
              type="button"
              role="option"
              aria-selected={currentArchiveKey === 'recent'}
              onClick={() => handleArchiveChange('recent')}
              className={`w-full flex items-center justify-between gap-2 px-3.5 py-2 font-inter text-xs sm:text-[13px] transition-colors text-left cursor-pointer ${
                currentArchiveKey === 'recent'
                  ? 'bg-emerald-500/15 text-white font-semibold'
                  : 'text-white/70 hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${currentArchiveKey === 'recent' ? 'bg-emerald-400' : 'bg-white/25'}`} />
                Recent Updates
              </span>
              {currentArchiveKey === 'recent' && (
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>

            <div className="h-px bg-white/[0.08] my-1" />

            <div className="max-h-60 overflow-y-auto">
              {availableArchives.map((arch) => {
                const isActive = currentArchiveKey === arch.key;
                return (
                  <button
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    key={arch.key}
                    onClick={() => handleArchiveChange(arch.key)}
                    className={`w-full flex items-center justify-between gap-2 px-3.5 py-2 font-inter text-xs sm:text-[13px] transition-colors text-left cursor-pointer ${
                      isActive
                        ? 'bg-rose-500/15 text-white font-semibold'
                        : 'text-white/70 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-rose-400' : 'bg-white/25'}`} />
                      {arch.label}
                    </span>
                    {isActive && (
                      <svg className="w-3.5 h-3.5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}