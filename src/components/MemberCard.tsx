import { useState } from 'react';

interface MemberCardProps {
  name: string;
  image: string;
  birthDate: string;
  position: string;
  funFact: string;
  index: number;
}

export default function MemberCard({ name, image, birthDate, position, funFact, index }: MemberCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="group perspective-1000"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <div
        className={`relative w-full aspect-[3/4] cursor-pointer transition-transform duration-700 preserve-3d ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
        onClick={() => setIsFlipped(!isFlipped)}
        onMouseLeave={() => setIsFlipped(false)}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden neon-border hover-lift"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <img
            src={image}
            alt={`IVE member ${name}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ive-dark via-ive-dark/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className="font-outfit font-bold text-2xl text-white tracking-wide">
              {name}
            </h3>
            <p className="font-inter text-sm text-ive-accent mt-1">{position}</p>
          </div>
          {/* Hover shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-ive-pink/0 via-white/5 to-ive-purple/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden glass-card neon-border flex flex-col items-center justify-center p-6 text-center [transform:rotateY(180deg)]"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-2 border-ive-pink/50">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="font-outfit font-bold text-2xl gradient-text mb-2">
            {name}
          </h3>
          <p className="font-inter text-sm text-ive-accent mb-1">{position}</p>
          <p className="font-inter text-xs text-white/50 mb-4">{birthDate}</p>
          <div className="w-12 h-0.5 bg-gradient-to-r from-ive-pink to-ive-purple rounded-full mb-4" />
          <p className="font-inter text-sm text-white/70 leading-relaxed">
            {funFact}
          </p>
        </div>
      </div>
    </div>
  );
}
