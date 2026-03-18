interface ScoreBoardProps {
  aliceScore: number;
  bobScore: number;
}

export default function ScoreBoard({ aliceScore, bobScore }: ScoreBoardProps) {
  return (
    <div className="flex justify-between items-center bg-hextech-panel/80 backdrop-blur-md p-4 md:p-6 rounded-none shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-hextech-border mb-8 relative overflow-hidden">
      {/* Corner acccents */}
      <div className="absolute top-0 left-0 w-8 h-px bg-hextech-gold"></div>
      <div className="absolute top-0 left-0 w-px h-8 bg-hextech-gold"></div>
      <div className="absolute bottom-0 right-0 w-8 h-px bg-hextech-gold"></div>
      <div className="absolute bottom-0 right-0 w-px h-8 bg-hextech-gold"></div>
      
      <div className="flex flex-col items-center">
        <span className="text-xs md:text-sm font-bold text-hextech-gold-light uppercase tracking-widest mb-1 opacity-80">Alice</span>
        <span className="text-3xl md:text-4xl font-black text-[#c89b3c] drop-shadow-[0_0_8px_rgba(200,155,60,0.5)]">{aliceScore}</span>
      </div>
      
      <div className="text-lg md:text-xl font-bold text-hextech-border tracking-[0.2em] relative">
        <div className="absolute inset-0 bg-hextech-blue/20 blur-md pointer-events-none"></div>
        VS
      </div>
      
      <div className="flex flex-col items-center">
        <span className="text-xs md:text-sm font-bold text-hextech-gold-light uppercase tracking-widest mb-1 opacity-80">Bob</span>
        <span className="text-3xl md:text-4xl font-black text-[#0ac8b9] drop-shadow-[0_0_8px_rgba(10,200,185,0.5)]">{bobScore}</span>
      </div>
    </div>
  );
}
