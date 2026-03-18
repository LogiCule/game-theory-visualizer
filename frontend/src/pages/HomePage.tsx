import { useRef } from 'react';
import GameCard from '../components/GameCard';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export default function HomePage() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Entrance animations
    gsap.from('.stagger-item', {
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out',
    });
    
    gsap.from('.header-glow', {
      scale: 0.8,
      opacity: 0,
      duration: 1.5,
      ease: 'power2.out',
    });
  }, { scope: container });

  return (
    <div ref={container} className="min-h-screen p-4 md:p-8 text-hextech-gold-light relative overflow-hidden flex flex-col items-center pt-16 md:pt-24">
      {/* Background flare */}
      <div className="header-glow absolute top-[-10%] left-1/2 transform -translate-x-1/2 w-[800px] h-[500px] bg-hextech-blue/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl w-full mx-auto relative z-10">
        <header className="text-center mb-16 md:mb-24 stagger-item">
          <div className="inline-block relative">
            <h1 className="text-4xl md:text-6xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-hextech-gold-light to-hextech-gold mb-4 md:mb-6 uppercase drop-shadow-2xl">
              Strategy Simulator
            </h1>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-hextech-gold to-transparent" />
          </div>
          <p className="text-base md:text-xl text-gray-400 max-w-2xl mx-auto font-light tracking-wide mt-6 px-4 md:px-0">
            A portal to interact with algorithmic domains.
          </p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          <div className="stagger-item">
            <GameCard
              title="Stone Game I"
              description="Two players pick stones from either end of a row of piles. Both players play optimally. Defeat your opponent through perfect calculation."
              route="/games/stone-game"
            />
          </div>
          <div className="stagger-item">
            <GameCard
              title="Stone Game II"
              description="Take up to 2M stones from the front of the line. M scales up dynamically. Plan your exponential expansion."
              route="/games/stone-game-2"
            />
          </div>
          <div className="stagger-item">
            <GameCard
              title="Stone Game III"
              description="A ruthless battle where stones have values that can be negative. Take 1, 2, or 3 stones from the front."
              route="/games/stone-game-3"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
