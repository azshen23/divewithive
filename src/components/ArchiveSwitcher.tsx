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

  return (
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
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 font-inter text-xs sm:text-sm font-medium transition-all duration-200 text-left cursor-pointer ${
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
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 font-inter text-xs sm:text-sm font-medium transition-all duration-200 text-left cursor-pointer ${
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
  );
}
