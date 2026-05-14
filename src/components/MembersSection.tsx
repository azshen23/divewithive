import MemberCard from './MemberCard';
import { useScrollReveal } from '../hooks/useScrollReveal';

import yujinImg from '../assets/member_yujin.jpg';
import gaeulImg from '../assets/member_gaeul.jpg';
import reiImg from '../assets/member_rei.jpg';
import wonyoungImg from '../assets/member_wonyoung.jpg';
import lizImg from '../assets/member_liz.jpg';
import leeseoImg from '../assets/member_leeseo.jpg';

const members = [
  {
    name: 'Yujin',
    image: yujinImg,
    birthDate: 'September 1, 2003',
    position: 'Leader · Vocalist · Dancer',
    funFact: 'Former IZ*ONE member. Known for her powerful stage presence and leadership. Her bright energy lights up every performance.',
  },
  {
    name: 'Gaeul',
    image: gaeulImg,
    birthDate: 'September 24, 2002',
    position: 'Vocalist · Dancer',
    funFact: 'The eldest member and the dependable unnie of the group. Known for her cool charisma and versatile dance skills.',
  },
  {
    name: 'Rei',
    image: reiImg,
    birthDate: 'February 3, 2004',
    position: 'Vocalist · Rapper',
    funFact: 'Born in Japan, she\'s multilingual and known for her sweet personality. Her rap skills add a unique flavor to IVE\'s music.',
  },
  {
    name: 'Wonyoung',
    image: wonyoungImg,
    birthDate: 'August 31, 2004',
    position: 'Center · Vocalist · Visual',
    funFact: 'Former IZ*ONE center and Produce 48 winner. A global it-girl known for her elegance, charm, and iconic stage presence.',
  },
  {
    name: 'Liz',
    image: lizImg,
    birthDate: 'November 21, 2004',
    position: 'Main Vocalist',
    funFact: 'The vocal powerhouse of IVE with an angelic voice. Known for her warm personality and incredible vocal range.',
  },
  {
    name: 'Leeseo',
    image: leeseoImg,
    birthDate: 'February 21, 2007',
    position: 'Vocalist · Dancer · Maknae',
    funFact: 'The youngest member with talent beyond her years. A former child actress with natural charisma and impressive dance skills.',
  },
];

export default function MembersSection() {
  const { ref, isRevealed } = useScrollReveal<HTMLElement>(0.1);

  return (
    <section
      id="members"
      ref={ref}
      className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-ive-pink/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-ive-purple/5 rounded-full blur-3xl" />

      <div className={`transition-all duration-1000 ${isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="text-center mb-16">
          <span className="font-inter text-sm font-medium tracking-[0.3em] uppercase text-ive-accent/70">
            The Stars
          </span>
          <h2 className="font-outfit font-bold text-4xl sm:text-5xl md:text-6xl mt-3 gradient-text">
            Meet the Members
          </h2>
          <p className="font-inter text-white/40 mt-4 max-w-lg mx-auto">
            Six incredible artists who together form IVE — click any card to learn more
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {members.map((member, index) => (
            <div
              key={member.name}
              className={`transition-all duration-700 ${
                isRevealed
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: `${index * 150 + 200}ms` }}
            >
              <MemberCard {...member} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
