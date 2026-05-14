import { useScrollReveal } from '../hooks/useScrollReveal';

import yujinImg from '../assets/member_yujin.jpg';
import gaeulImg from '../assets/member_gaeul.jpg';
import reiImg from '../assets/member_rei.jpg';
import wonyoungImg from '../assets/member_wonyoung.jpg';
import lizImg from '../assets/member_liz.jpg';
import leeseoImg from '../assets/member_leeseo.jpg';

const recentPosts = [
  {
    src: wonyoungImg,
    member: 'Wonyoung',
    caption: 'REVIVE+ concept photo 🖤',
    platform: 'Instagram',
    time: '2h ago',
    likes: '2.1M',
  },
  {
    src: yujinImg,
    member: 'Yujin',
    caption: 'SHOW WHAT I AM tour backstage 🎤',
    platform: 'Weverse',
    time: '5h ago',
    likes: '890K',
  },
  {
    src: reiImg,
    member: 'Rei',
    caption: 'Ready for ASEA 2026! ✨',
    platform: 'Twitter',
    time: '8h ago',
    likes: '1.3M',
  },
  {
    src: leeseoImg,
    member: 'Leeseo',
    caption: 'Singapore was amazing! 🇸🇬💜',
    platform: 'Instagram',
    time: '1d ago',
    likes: '1.7M',
  },
  {
    src: gaeulImg,
    member: 'Gaeul',
    caption: 'New hair who dis 💇‍♀️',
    platform: 'Weverse',
    time: '2d ago',
    likes: '950K',
  },
  {
    src: lizImg,
    member: 'Liz',
    caption: 'Recording something special... 🎶',
    platform: 'Twitter',
    time: '3d ago',
    likes: '1.1M',
  },
];

const platformIcons: Record<string, string> = {
  Instagram: '📷',
  Twitter: '𝕏',
  Weverse: '💬',
};

export default function GallerySection() {
  const { ref, isRevealed } = useScrollReveal<HTMLElement>(0.1);

  return (
    <section
      id="gallery"
      ref={ref}
      className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        <div
          className={`flex items-center gap-3 mb-8 transition-all duration-700 ${
            isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="font-outfit font-bold text-2xl text-white">
            Recent Posts
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          <div className="flex gap-2">
            {['Instagram', 'Twitter', 'Weverse'].map((p) => (
              <span key={p} className="glass-card px-3 py-1 rounded-full text-xs font-inter text-white/50">
                {platformIcons[p]} {p}
              </span>
            ))}
          </div>
        </div>

        {/* Social Feed Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentPosts.map((post, index) => (
            <article
              key={post.member}
              className={`glass-card glass-card-hover rounded-xl overflow-hidden group transition-all duration-700 ${
                isRevealed
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 80 + 100}ms` }}
            >
              {/* Post header */}
              <div className="flex items-center gap-3 p-4 pb-0">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-ive-pink/30">
                  <img src={post.src} alt={post.member} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-inter text-sm font-medium text-white truncate">{post.member}</p>
                  <p className="font-inter text-xs text-white/30">{post.time} · {platformIcons[post.platform]} {post.platform}</p>
                </div>
              </div>

              {/* Post image */}
              <div className="relative aspect-[4/5] mt-3 mx-4 rounded-lg overflow-hidden">
                <img
                  src={post.src}
                  alt={`${post.member} - ${post.caption}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>

              {/* Post footer */}
              <div className="p-4">
                <p className="font-inter text-sm text-white/70 mb-2">
                  <span className="font-medium text-white">{post.member}</span>{' '}
                  {post.caption}
                </p>
                <div className="flex items-center gap-4 text-white/30">
                  <span className="flex items-center gap-1 text-xs">
                    <span className="text-red-400">❤️</span> {post.likes}
                  </span>
                  <span className="flex items-center gap-1 text-xs">
                    💬 Comments
                  </span>
                  <span className="flex items-center gap-1 text-xs">
                    🔗 Share
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
