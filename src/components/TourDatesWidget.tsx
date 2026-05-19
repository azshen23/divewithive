const tourDates = [
  { date: 'May 23-24', city: 'Macao', venue: 'The Venetian Arena' },
  { date: 'Jun 13', city: 'Sydney', venue: 'Qudos Bank Arena' },
  { date: 'Jun 16', city: 'Melbourne', venue: 'Rod Laver Arena' },
  { date: 'Jun 20', city: 'Auckland', venue: 'Spark Arena' },
  { date: 'Jul 21', city: 'Toronto', venue: 'Scotiabank Arena' },
  { date: 'Jul 23', city: 'Montreal', venue: 'Centre Bell' },
  { date: 'Jul 25', city: 'Newark', venue: 'Prudential Center' },
  { date: 'Jul 29', city: 'Austin', venue: 'Moody Center' },
  { date: 'Aug 1', city: 'Inglewood', venue: 'Kia Forum' },
  { date: 'Aug 4', city: 'Oakland', venue: 'Oakland Arena' },
  { date: 'Aug 7', city: 'Seattle', venue: 'Climate Pledge Arena' },
  { date: 'Aug 9', city: 'Vancouver', venue: 'Rogers Arena' },
];

export default function TourDatesWidget() {
  return (
    <div className="card rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
        <h3 className="font-outfit font-semibold text-sm text-white/70">
          SHOW WHAT I AM — Tour
        </h3>
      </div>

      <div className="space-y-2.5">
        {tourDates.map((show) => (
          <div key={`${show.city}-${show.date}`} className="flex items-center gap-3">
            <span className="w-14 text-right font-inter text-[11px] text-pink-400/70 font-medium shrink-0">
              {show.date}
            </span>
            <div className="min-w-0">
              <p className="font-inter text-xs text-white/70 font-medium truncate">{show.city}</p>
              <p className="font-inter text-[11px] text-white/25 truncate">{show.venue}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
