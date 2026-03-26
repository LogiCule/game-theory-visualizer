import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import type { AIDifficulty } from '../ai/AIStrategy';

// Removed incorrect gsap.registerPlugin(useGSAP)

interface ScoreBoardProps {
  aliceScore: number;
  bobScore: number;
  showScore?: boolean;
  gameOver?: boolean;
  winner?: string | null;
  gameMode?: 'pvp' | 'pve';
  difficulty?: AIDifficulty;
}

export default function ScoreBoard({ 
  aliceScore, 
  bobScore, 
  showScore = true,
  gameOver,
  winner,
  gameMode,
  difficulty 
}: ScoreBoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRowRef = useRef<HTMLDivElement>(null);
  const resultRowRef = useRef<HTMLDivElement>(null);

  const isAliceWin = winner === 'Alice';
  const isBobWin = winner === 'Bob';

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    if (!gameOver || !winner) {
      // Show Active Row, Hide Result Row
      tl.set(resultRowRef.current, { display: "none", opacity: 0 });
      tl.set(activeRowRef.current, { display: "flex", opacity: 1, y: 0, scale: 1 });
      return;
    }

    // GAME OVER ANIMATION
    tl.to(activeRowRef.current, { 
      opacity: 0, 
      y: -20, 
      duration: 0.4, 
      onComplete: () => { gsap.set(activeRowRef.current, { display: "none" }); } 
    })
    .set(resultRowRef.current, { display: "flex", y: 20, opacity: 0, scale: 0.9 })
    .to(resultRowRef.current, { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      duration: 0.6,
      delay: 0.1,
      ease: "back.out(1.7)"
    });

    if (isAliceWin || isBobWin) {
      tl.to(resultRowRef.current, {
        textShadow: `0 0 20px ${isAliceWin ? "rgba(200,155,60,0.6)" : "rgba(10,200,185,0.6)"}`,
        duration: 0.5,
        repeat: -1,
        yoyo: true
      });
    }
  }, { dependencies: [gameOver, winner], scope: containerRef });

  const getModeLabel = () => {
    if (gameMode === 'pvp') return "LOCAL MODE";
    return `AI MODE • ${difficulty?.toUpperCase() || 'NORMAL'}`;
  };

  return (
    <div ref={containerRef} className="flex flex-col bg-hextech-panel/80 backdrop-blur-md p-4 md:p-6 rounded-none shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-hextech-border mb-8 relative overflow-hidden text-center min-h-[160px] justify-center">
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-8 h-px bg-hextech-gold opacity-50"></div>
      <div className="absolute top-0 left-0 w-px h-8 bg-hextech-gold opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-8 h-px bg-hextech-gold opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-px h-8 bg-hextech-gold opacity-50"></div>

      {/* MODE DISPLAY */}
      <div className="text-[10px] font-bold tracking-[0.3em] text-hextech-gold/60 mb-4 uppercase">
        {getModeLabel()}
      </div>

      {/* ACTIVE GAMEPLAY ROW */}
      <div ref={activeRowRef} className="flex items-center justify-between w-full max-w-[500px] mx-auto px-4 overflow-visible h-12">
        <div className="flex flex-col items-center flex-1">
          <span className="text-sm md:text-base font-black text-hextech-gold-light uppercase tracking-[0.15em] opacity-90">
            Alice
          </span>
        </div>
        <div className="text-xl md:text-2xl font-black text-hextech-border tracking-[0.2em] relative min-w-[100px] flex justify-center items-center">
          <div className="absolute inset-0 bg-hextech-blue/10 blur-xl pointer-events-none"></div>
          VS
        </div>
        <div className="flex flex-col items-center flex-1">
          <span className="text-sm md:text-base font-black text-hextech-gold-light uppercase tracking-[0.15em] opacity-90">
            Bob
          </span>
        </div>
      </div>

      {/* RESULT ROW (Hidden by default) */}
      <div ref={resultRowRef} className="flex-col items-center justify-center w-full h-12" style={{ display: 'none' }}>
        <span className={`text-2xl md:text-3xl font-black uppercase tracking-[0.25em] drop-shadow-[0_0_12px_rgba(0,0,0,0.5)] ${
          isAliceWin ? 'text-[#c89b3c]' : isBobWin ? 'text-[#0ac8b9]' : 'text-hextech-gold-light'
        }`}>
          {isAliceWin ? 'Alice Wins' : isBobWin ? 'Bob Wins' : "It's a Tie"}
        </span>
      </div>

      {/* Bottom Row: Score (Optional) */}
      {showScore && !gameOver && (
        <div className="flex justify-between items-center w-full max-w-[400px] mx-auto mt-4 px-12 border-t border-hextech-border/30 pt-4 animate-in fade-in duration-700">
          <div className="flex flex-col items-center">
             <span className="text-[10px] uppercase tracking-widest text-hextech-gold/40 mb-1">Score</span>
             <span className="text-2xl font-black text-[#c89b3c] drop-shadow-[0_0_8px_rgba(200,155,60,0.3)]">{aliceScore}</span>
          </div>
          <div className="flex flex-col items-center">
             <span className="text-[10px] uppercase tracking-widest text-hextech-gold/40 mb-1">Score</span>
             <span className="text-2xl font-black text-[#0ac8b9] drop-shadow-[0_0_8px_rgba(10,200,185,0.3)]">{bobScore}</span>
          </div>
        </div>
      )}
    </div>
  );
}
