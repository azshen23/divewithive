import { motion, AnimatePresence } from 'framer-motion';
import { trackEvent } from '../utils/analytics';

interface KofiButtonProps {
  isVisible?: boolean;
}

export default function KofiButton({ isVisible = true }: KofiButtonProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.a
          href="https://ko-fi.com/G2G21ZKPT6"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent('Support Clicked', { platform: 'Ko-fi' })}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          whileHover={{ scale: 1.05, translateY: -4 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-[9999] flex items-center gap-2 sm:gap-3 px-4 py-2.5 sm:px-6 sm:py-3.5 bg-[#72a4f2] text-white rounded-full shadow-[0_8px_30px_rgb(114,164,242,0.3)] hover:shadow-[0_12px_40px_rgb(114,164,242,0.4)] transition-all duration-300 border border-white/10 group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5 sm:w-6 sm:h-6 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916z M18.992 12.937c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z"
              fill="currentColor"
            />
            <path
              d="M12.819 12.459c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311z"
              fill="#ff5e5b"
            />
          </svg>

          <span className="font-outfit font-semibold text-[13px] sm:text-[15px] tracking-wide relative z-10">
            Buy Me a Coffee!
          </span>

          <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:animate-[shine_1.5s_infinite]" />
        </motion.a>
      )}
    </AnimatePresence>
  );
}
