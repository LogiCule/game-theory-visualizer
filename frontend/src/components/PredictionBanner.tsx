import { Sparkles, Eye, EyeOff } from 'lucide-react';

export interface PredictionBannerProps {
  winner: string;
  optimalMove?: any;
  scoreDiff?: number;
  onClose?: () => void;
}

export default function PredictionBanner({ winner, optimalMove, scoreDiff, onClose }: PredictionBannerProps) {
  return (
    <div className="flex justify-center w-full mb-6 relative z-10">
      <div className="bg-[#0a0f14]/80 backdrop-blur-md border border-hextech-blue/40 rounded-full px-5 md:px-6 py-2.5 flex items-center flex-wrap justify-center gap-3 md:gap-6 shadow-[0_0_15px_rgba(10,200,185,0.15)] animate-fade-in relative overflow-hidden group select-none">
        
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-hextech-blue/10 to-transparent translate-x-[-100%] group-hover:animate-[shine_2s_ease-in-out_infinite]" />
        
        <div className="flex items-center gap-2 text-hextech-blue relative z-10">
          <Sparkles size={14} className="animate-pulse" />
          <span className="text-[10px] font-bold tracking-widest uppercase">Oracle</span>
        </div>

        <div className="hidden sm:block w-px h-4 bg-hextech-blue/30" />

        <div className="flex items-center gap-2 relative z-10">
          <span className="text-[10px] uppercase tracking-widest text-hextech-gold-light/60">Winner</span>
          <span className={`text-xs font-black uppercase tracking-wider ${winner === 'Alice' ? 'text-[#c89b3c]' : winner === 'Bob' ? 'text-[#0ac8b9]' : 'text-gray-400'}`}>
            {winner}
          </span>
        </div>
        
        {optimalMove !== undefined && (
          <>
            <div className="w-px h-4 bg-hextech-blue/30" />
            <div className="flex items-center gap-2 relative z-10">
              <span className="text-[10px] uppercase tracking-widest text-hextech-gold-light/60">Best Move</span>
              <span className="text-xs font-black text-hextech-blue uppercase tracking-wider drop-shadow-md">
                {String(optimalMove)}
              </span>
            </div>
          </>
        )}
        
        {scoreDiff !== undefined && (
          <>
            <div className="hidden sm:block w-px h-4 bg-hextech-blue/30" />
            <div className="flex items-center gap-2 relative z-10">
              <span className="text-[10px] uppercase tracking-widest text-hextech-gold-light/60">Margin</span>
              <span className="text-xs font-black text-hextech-gold uppercase tracking-wider">
                {scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff}
              </span>
            </div>
          </>
        )}
        
        {onClose && (
          <>
            <div className="w-px h-4 bg-hextech-blue/30 ml-2" />
            <button 
              onClick={onClose} 
              className="text-hextech-blue/50 hover:text-hextech-blue transition-colors p-1 cursor-pointer hover:bg-hextech-blue/10 rounded-full relative z-10" 
              title="Hide Oracle"
            >
              <EyeOff size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function OracleToggle({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex justify-center w-full mb-6 relative z-10">
      <button 
        onClick={onClick}
        className="flex items-center gap-2 px-5 py-2 rounded-full border border-hextech-blue/20 text-hextech-blue/60 hover:text-hextech-blue hover:border-hextech-blue/50 hover:bg-hextech-blue/10 bg-transparent transition-all duration-300 cursor-pointer text-[10px] uppercase tracking-widest font-bold shadow-[0_0_10px_rgba(10,200,185,0)] hover:shadow-[0_0_15px_rgba(10,200,185,0.2)]"
      >
        <Eye size={14} /> Consult Oracle
      </button>
    </div>
  )
}
