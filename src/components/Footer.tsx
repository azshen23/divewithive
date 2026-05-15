export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-12 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <p className="font-inter text-[11px] text-white/20">
            Fan project — not affiliated with Starship Entertainment or IVE.
          </p>
        </div>
        <p className="font-inter text-[11px] text-white/20">
          © {new Date().getFullYear()} Raining
        </p>
      </div>
    </footer>
  );
}
