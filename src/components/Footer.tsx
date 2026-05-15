export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-12 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <p className="font-inter text-[11px] text-white/20">
            Fan project — not affiliated with Starship Entertainment or IVE.
          </p>
          <a 
            href="https://ko-fi.com/G2G21ZKPT6" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-inter text-[11px] text-white/40 hover:text-[#72a4f2] transition-colors"
          >
            Support on Ko-fi
          </a>
        </div>
        <p className="font-inter text-[11px] text-white/20">
          © {new Date().getFullYear()} Dive with IVE
        </p>
      </div>
    </footer>
  );
}
