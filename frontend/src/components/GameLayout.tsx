import { useRef } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface GameLayoutProps {
  title: string;
  /** Animate children on mount when true */
  animate?: boolean;
  children: ReactNode;
}

/**
 * GameLayout — page shell only.
 * Handles: background ambience, back button, title heading, max-width wrapper.
 * Does NOT control board/history layout — game pages compose that themselves
 * using GameContentGrid.
 */
export default function GameLayout({ title, animate = true, children }: GameLayoutProps) {
  const navigate = useNavigate();
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!animate) return;
    gsap.from('.game-anim', {
      y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
    });
  }, { scope: container, dependencies: [animate] });

  return (
    <div ref={container} className="min-h-screen p-4 md:p-8 text-hextech-gold-light pt-8 relative overflow-hidden">
      {/* Background ambience */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-hextech-blue/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-hextech-gold/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="relative flex items-center justify-center mb-8 mt-2 md:mt-0">
          <button
            onClick={() => navigate('/')}
            className="absolute left-0 flex items-center text-hextech-gold hover:text-hextech-gold-light transition-colors cursor-pointer group tracking-widest uppercase text-xs md:text-sm font-bold z-10"
          >
            <ArrowLeft className="mr-1 md:mr-3 text-hextech-blue group-hover:-translate-x-1 transition-transform" size={20} />
            <span className="hidden sm:inline">Lobby</span>
          </button>

          <div className="inline-block relative text-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-hextech-gold-light to-hextech-gold uppercase whitespace-nowrap">
              {title}
            </h1>
            <div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-hextech-blue to-transparent" />
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
