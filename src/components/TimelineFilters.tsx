import { motion } from 'framer-motion';

interface TimelineFiltersProps {
  selectedMember: string;
  setSelectedMember: (member: string) => void;
  selectedPlatform: string;
  setSelectedPlatform: (platform: string) => void;
}

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

export default function TimelineFilters({
  selectedMember,
  setSelectedMember,
  selectedPlatform,
  setSelectedPlatform
}: TimelineFiltersProps) {
  return (
    <div className="flex flex-col gap-3 mb-6">
      {/* Member Filter Bar */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white/[0.02] border border-white/[0.05] rounded-2xl backdrop-blur-md shadow-lg p-1.5">
        {memberFilters.map((filter) => {
          const isActive = selectedMember === filter.name;
          return (
            <button
              key={filter.name}
              onClick={() => setSelectedMember(filter.name)}
              className={`relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-inter text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer ${
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
              className={`relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-inter text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer ${
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
  );
}
