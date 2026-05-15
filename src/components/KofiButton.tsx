import { motion } from 'framer-motion';

export default function KofiButton() {
  return (
    <motion.a
      href="https://ko-fi.com/G2G21ZKPT6"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.05, translateY: -4 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-8 right-8 z-[9999] flex items-center gap-3 px-6 py-3.5 bg-[#72a4f2] text-white rounded-full shadow-[0_8px_30px_rgb(114,164,242,0.3)] hover:shadow-[0_12px_40px_rgb(114,164,242,0.4)] transition-all duration-300 border border-white/10 group overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <svg
        viewBox="0 0 256 256"
        className="w-6 h-6 shrink-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M236.42 81.36c-4.46-24.16-32.55-30.84-32.55-30.84H21.57a6.38 6.38 0 0 0-6.37 6.37v79.4c0 1.76.8 3.33 2.05 4.38 8.44 11.45 16.51 31.7 21.05 44.5 4.54 12.8 11.23 20.44 23.47 20.44h97.43c10.42 0 17.55-7.44 21.84-20.25 4.3-12.8 12.18-33.32 20.62-44.69.17-.23.33-.46.5-.7h1.4c31.14 0 37.36-34.45 37.36-34.45s3.52-19.14-4.5-24.16zm-36.8 45.45c-2.4 13.9-15.3 14.03-15.3 14.03h-5.91a277.6 277.6 0 0 0-14.73-39.06V72.93h87.65s15.42 3.19 13.1 19.33c-2.32 16.15-13.63 15.65-13.63 15.65-7.14.34-11.2 5.03-13.62 14.47z"
          fill="currentColor"
        />
        <path
          d="M106.63 95.83a21.43 21.43 0 0 0-30.3 0 21.43 21.43 0 0 0 0 30.3l30.3 30.3 30.3-30.3a21.43 21.43 0 0 0 0-30.3 21.43 21.43 0 0 0-30.3 0z"
          fill="#ff5e5b"
        />
      </svg>

      <span className="font-outfit font-semibold text-[15px] tracking-wide relative z-10">
        Buy Me a Coffee!
      </span>

      <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:animate-[shine_1.5s_infinite]" />
    </motion.a>
  );
}
