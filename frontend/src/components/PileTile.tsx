interface PileTileProps {
  value: number;
  selectable: boolean;
  onClick: () => void;
  position: 'left' | 'right' | 'middle';
  highlight?: boolean;
}

export default function PileTile({ value, selectable, onClick, position, highlight }: PileTileProps) {
  return (
    <button
      onClick={onClick}
      disabled={!selectable}
      data-position={position}
      className={`
        relative flex items-center justify-center group overflow-hidden
        h-24 w-20 sm:h-32 sm:w-28 font-black text-3xl sm:text-4xl shadow-xl transition-all duration-300
        ${selectable 
          ? 'bg-hextech-panel border border-hextech-blue/50 text-hextech-gold-light cursor-pointer transform hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(10,200,185,0.2)] z-10' 
          : 'bg-hextech-dark/50 border border-hextech-border text-hextech-border cursor-not-allowed opacity-60'
        }
        ${highlight ? 'animate-pulse ring-2 ring-hextech-blue shadow-[0_0_20px_rgba(10,200,185,0.6)] !border-hextech-blue !bg-hextech-blue/10' : ''}
      `}
      style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 85%, 85% 100%, 0 100%, 0 15%)' }}
    >
      {/* Decorative hover gradient */}
      <div className={`absolute inset-0 bg-gradient-to-tr from-hextech-blue/20 to-transparent opacity-0 transition-opacity duration-300 ${selectable ? 'group-hover:opacity-100' : ''}`} />
      
      {/* Hextech accent lines */}
      <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 ${selectable ? 'bg-hextech-blue shadow-[0_0_8px_rgba(10,200,185,0.8)]' : 'bg-hextech-border'}`} />

      <span className="relative z-10 drop-shadow-md">{value}</span>
      
      {selectable && (
        <span className="absolute top-2 right-2 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full bg-hextech-blue opacity-75"></span>
          <span className="relative inline-flex h-3 w-3 bg-[#0ac8b9] border border-hextech-dark"></span>
        </span>
      )}
    </button>
  );
}
