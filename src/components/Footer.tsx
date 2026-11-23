export default function Footer() {
  return (
    <footer className="card rounded-2xl p-5 space-y-2.5">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <h3 className="font-outfit font-semibold text-sm text-white/85">
          About & Disclaimer
        </h3>
      </div>
      <p className="font-inter text-xs text-white/55 leading-relaxed">
        Independent fan archive — not affiliated with Starship Entertainment or IVE.
      </p>
      <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs text-white/45">
        <span>
          © {new Date().getFullYear()}{' '}
          <a
            href="https://raining.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-rose-300 transition-colors duration-200 underline underline-offset-4"
          >
            Raining
          </a>
        </span>
      </div>
    </footer>
  );
}