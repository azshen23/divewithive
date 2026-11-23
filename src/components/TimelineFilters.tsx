import { motion } from 'framer-motion';

interface TimelineFiltersProps {
  selectedMember: string;
  setSelectedMember: (member: string) => void;
  selectedPlatform: string;
  setSelectedPlatform: (platform: string) => void;
}

const memberFilters = [
  { name: 'All', dot: 'bg-emerald-400' },
  { name: 'Yujin', dot: 'bg-sky-400' },
  { name: 'Gaeul', dot: 'bg-amber-400' },
  { name: 'Rei', dot: 'bg-emerald-300' },
  { name: 'Wonyoung', dot: 'bg-rose-400' },
  { name: 'Liz', dot: 'bg-orange-400' },
  { name: 'Leeseo', dot: 'bg-pink-400' },
];

const platformFilters = ['All', 'YouTube', 'TikTok', 'Instagram'];

export default function TimelineFilters({
  selectedMember,
  setSelectedMember,
  selectedPlatform,
  setSelectedPlatform
}: TimelineFiltersProps) {
  const hasActiveFilter = selectedMember !== 'All' || selectedPlatform !== 'All';

  return (
    <div className="card rounded-2xl p-3 sm:p-3.5 mb-5 space-y-2.5">
      {/* Member Filter Row */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-inter text-[11px] font-medium uppercase tracking-wider text-white/40 px-1.5 mr-1">
          Member
        </span>
        {memberFilters.map((filter) => {
          const isActive = selectedMember === filter.name;
          return (
            <button
              type="button"
              key={filter.name}
              onClick={() => setSelectedMember(filter.name)}
              aria-pressed={isActive}
              className={`relative px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg font-inter text-xs sm:text-[13px] font-medium transition-colors duration-200 cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'text-[#0a0a0f] font-semibold'
                  : 'text-white/65 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeMemberFilter"
                  className="absolute inset-0 rounded-lg bg-white"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className={`relative z-10 w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#0a0a0f]/60' : filter.dot}`} />
              <span className="relative z-10">{filter.name}</span>
            </button>
          );
        })}
      </div>

      <div className="h-px bg-white/[0.06]" />

      {/* Platform Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-inter text-[11px] font-medium uppercase tracking-wider text-white/40 px-1.5 mr-1">
            Source
          </span>
          {platformFilters.map((platform) => {
            const isActive = selectedPlatform === platform;
            return (
              <button
                type="button"
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                aria-pressed={isActive}
                className={`relative px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg font-inter text-xs sm:text-[13px] font-medium transition-colors duration-200 cursor-pointer ${
                  isActive
                    ? 'text-rose-100 font-semibold'
                    : 'text-white/65 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activePlatformFilter"
                    className="absolute inset-0 rounded-lg bg-rose-500/20 border border-rose-400/40"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{platform}</span>
              </button>
            );
          })}
        </div>

        {hasActiveFilter && (
          <button
            type="button"
            onClick={() => {
              setSelectedMember('All');
              setSelectedPlatform('All');
            }}
            className="font-inter text-xs text-white/55 hover:text-white px-2.5 py-1 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}