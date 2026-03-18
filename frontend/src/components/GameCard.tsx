import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

interface GameCardProps {
  title: string;
  description: string;
  route: string;
}

export default function GameCard({ title, description, route }: GameCardProps) {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const { contextSafe } = useGSAP({ scope: cardRef });

  const handleMouseMove = contextSafe((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    gsap.to(contentRef.current, {
      duration: 0.3,
      rotationY: x * 0.05,
      rotationX: -y * 0.05,
      z: 20,
      ease: 'power2.out',
    });
  });

  const handleMouseLeave = contextSafe(() => {
    gsap.to(contentRef.current, {
      duration: 0.5,
      rotationY: 0,
      rotationX: 0,
      z: 0,
      ease: 'power3.out',
    });
  });

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => navigate(route)}
      className="h-[250px] md:h-[300px] [perspective:1000px] cursor-pointer"
    >
      <div 
        ref={contentRef}
        className="bg-hextech-panel/80 backdrop-blur-md border border-hextech-border shadow-2xl flex flex-col h-full 
                   transition-colors duration-300 hover:border-hextech-gold group relative"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        
        {/* Decorative Corners */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-hextech-gold opacity-30 group-hover:opacity-100 transition-opacity m-1" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-hextech-gold opacity-30 group-hover:opacity-100 transition-opacity m-1" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-hextech-gold opacity-30 group-hover:opacity-100 transition-opacity m-1" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-hextech-gold opacity-30 group-hover:opacity-100 transition-opacity m-1" />

        <div className="p-6 md:p-8 flex-grow" style={{ transform: 'translateZ(30px)' }}>
          <h2 className="text-xl md:text-2xl font-bold text-hextech-gold-light tracking-widest uppercase mb-2 group-hover:text-hextech-gold transition-colors drop-shadow-md">{title}</h2>
          <div className="h-px w-10 bg-hextech-blue mb-3 md:mb-4 group-hover:w-full transition-all duration-500 shadow-[0_0_8px_var(--color-hextech-blue)]" />
          <p className="text-gray-400 text-xs md:text-sm leading-relaxed">{description}</p>
        </div>
        
        <div className="px-6 pb-6 md:px-8 md:pb-8 mt-auto" style={{ transform: 'translateZ(40px)' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(route);
            }}
            className="w-full relative overflow-hidden inline-flex items-center justify-center bg-hextech-dark/80 border border-hextech-gold/30 hover:border-hextech-gold text-hextech-gold hover:text-hextech-gold-light hover:bg-hextech-gold/10 hover:shadow-[0_0_15px_rgba(200,155,60,0.3)] font-bold py-2 md:py-3 px-4 transition-all duration-300 uppercase tracking-widest text-xs md:text-sm cursor-pointer"
          >
            Play
          </button>
        </div>
      </div>
    </div>
  );
}
