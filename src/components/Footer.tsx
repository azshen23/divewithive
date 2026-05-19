export default function Footer() {
  return (
    <div className="card rounded-xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <h3 className="font-outfit font-semibold text-sm text-white/70">
          About & Disclaimer
        </h3>
      </div>
      <p className="font-inter text-xs text-white/40 leading-relaxed">
        Fan project — not affiliated with Starship Entertainment or IVE.
      </p>
      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-white/30">
        <span>
          © {new Date().getFullYear()}{' '}
          <a
            href="https://raining.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-400 transition-colors duration-200 underline underline-offset-2"
          >
            Raining
          </a>
        </span>
      </div>
    </div>
  );
}

