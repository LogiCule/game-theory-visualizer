interface GameSetupProps {
  description: string;
  placeholder: string;
  inputVal: string;
  setInputVal: (val: string) => void;
  gameMode: 'pvp' | 'pve';
  setGameMode: (mode: 'pvp' | 'pve') => void;
  onStart: () => void;
}

export default function GameSetup({ 
  description, 
  placeholder, 
  inputVal, 
  setInputVal, 
  gameMode, 
  setGameMode, 
  onStart 
}: GameSetupProps) {
  return (
    <div className="game-anim bg-hextech-panel/60 backdrop-blur-md border border-hextech-border p-6 md:p-12 max-w-xl mx-auto text-center relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-0 h-1 bg-hextech-blue transition-all duration-700 group-hover:w-full" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-hextech-gold opacity-50 m-2" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-hextech-gold opacity-50 m-2" />

      <h2 className="text-2xl font-bold mb-4 uppercase tracking-widest text-hextech-gold-light">Initialize Match</h2>
      <p className="text-gray-400 mb-8 font-light tracking-wide text-sm">{description}</p>
      
      <div className="flex justify-center gap-4 mb-8">
        <button 
          onClick={() => setGameMode('pvp')}
          className={`px-6 py-2 uppercase tracking-widest text-sm font-bold border transition-colors ${gameMode === 'pvp' ? 'bg-hextech-blue/20 border-hextech-blue text-hextech-blue shadow-[0_0_10px_rgba(10,200,185,0.2)]' : 'border-hextech-border text-gray-500 hover:text-gray-300'} cursor-pointer`}
        >
          PvP (Local)
        </button>
        <button 
          onClick={() => setGameMode('pve')}
          className={`px-6 py-2 uppercase tracking-widest text-sm font-bold border transition-colors ${gameMode === 'pve' ? 'bg-[#c89b3c]/20 border-[#c89b3c] text-[#c89b3c] shadow-[0_0_10px_rgba(200,155,60,0.2)]' : 'border-hextech-border text-gray-500 hover:text-gray-300'} cursor-pointer`}
        >
          PvE (vs Bob AI)
        </button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <input 
          type="text" 
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={placeholder}
          className="px-4 py-3 md:px-6 md:py-4 bg-hextech-dark/80 border border-hextech-border focus:border-hextech-blue text-hextech-gold-light focus:outline-none focus:ring-1 focus:ring-hextech-blue font-mono text-center tracking-widest text-sm md:text-base w-full"
        />
        <button 
          onClick={onStart}
          className="bg-hextech-blue/20 hover:bg-hextech-blue/30 border border-hextech-blue text-hextech-gold-light font-bold py-3 px-6 md:py-4 md:px-10 transition-all duration-300 shadow-[0_0_15px_rgba(10,200,185,0.2)] hover:shadow-[0_0_25px_rgba(10,200,185,0.4)] cursor-pointer uppercase tracking-widest text-sm relative overflow-hidden group/btn w-full sm:w-auto shrink-0"
        >
          <div className="absolute inset-0 bg-hextech-blue/20 transform -translate-x-full skew-x-12 group-hover/btn:animate-[shine_1s_ease-out_forwards]" />
          Proceed
        </button>
      </div>
    </div>
  );
}
