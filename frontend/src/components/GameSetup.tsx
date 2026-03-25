import { Info } from 'lucide-react';
import type { AIDifficulty } from '../ai/AIStrategy';

interface GameSetupProps {
  title?: string;
  description: string;
  rules: string;
  placeholder?: string;
  inputVal?: string;
  setInputVal?: (val: string) => void;
  gameMode: 'pvp' | 'pve';
  setGameMode: (mode: 'pvp' | 'pve') => void;
  difficulty?: AIDifficulty;
  setDifficulty?: (d: AIDifficulty) => void;
  onStart: () => void;
  hideInput?: boolean;
}

const DIFFICULTIES: { value: AIDifficulty; label: string; color: string; glow: string }[] = [
  { value: 'easy',   label: 'Easy',   color: 'border-emerald-500 text-emerald-400 bg-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.3)]',  glow: 'hover:border-emerald-400 hover:text-emerald-300' },
  { value: 'medium', label: 'Medium', color: 'border-amber-500 text-amber-400 bg-amber-500/20 shadow-[0_0_10px_rgba(251,191,36,0.3)]',          glow: 'hover:border-amber-400 hover:text-amber-300' },
  { value: 'hard',   label: 'Hard',   color: 'border-rose-500 text-rose-400 bg-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.3)]',             glow: 'hover:border-rose-400 hover:text-rose-300' },
];

export default function GameSetup({ 
  title = "Initialize Match", 
  description, 
  rules,
  placeholder, 
  inputVal, 
  setInputVal, 
  gameMode, 
  setGameMode,
  difficulty = 'hard',
  setDifficulty,
  onStart,
  hideInput = false
}: GameSetupProps) {
  return (
    <div className="game-anim bg-hextech-panel/60 backdrop-blur-md border border-hextech-border p-6 md:p-12 max-w-xl mx-auto text-center relative group">
      <div className="absolute top-0 left-0 w-0 h-1 bg-hextech-blue transition-all duration-700 group-hover:w-full" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-hextech-gold opacity-50 m-2" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-hextech-gold opacity-50 m-2" />

      <div className="flex justify-center mb-4">
        <div className="relative inline-flex items-center gap-3 group/info">
          <h2 className="text-2xl font-bold uppercase tracking-widest text-hextech-gold-light m-0 border-b-2 border-transparent">{title}</h2>
          <div className="relative cursor-help flex items-center justify-center p-1">
            <Info size={22} className="text-hextech-blue hover:text-[#0ac8b9] transition-colors" />
            <div className="absolute left-1/2 -translate-x-1/2 top-[140%] mt-2 w-[280px] sm:w-[350px] p-5 bg-hextech-dark/95 border border-hextech-blue/50 text-hextech-gold-light text-xs sm:text-sm text-left shadow-[0_0_20px_rgba(10,200,185,0.2)] backdrop-blur-xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible z-50 rounded-sm leading-relaxed transition-opacity duration-300">
              <div className="font-bold text-hextech-blue uppercase tracking-widest mb-3 text-xs w-full border-b border-hextech-blue/30 pb-2">Game Rules</div>
              <div className="text-hextech-gold/90">{rules}</div>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 border-l-[8px] border-r-[8px] border-b-[8px] border-l-transparent border-r-transparent border-b-hextech-blue/50 w-0 h-0" />
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-gray-400 mb-8 font-light tracking-wide text-sm max-w-md mx-auto">{description}</p>
      
      {/* Game Mode Toggle */}
      <div className="flex justify-center gap-4 mb-6">
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

      {/* AI Difficulty Selector (PvE only) */}
      {gameMode === 'pve' && setDifficulty && (
        <div className="mb-8 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="text-xs uppercase tracking-widest text-hextech-gold/60 mb-3 font-bold">AI Difficulty</div>
          <div className="flex justify-center gap-3">
            {DIFFICULTIES.map(({ value, label, color, glow }) => {
              const isActive = difficulty === value;
              return (
                <button
                  key={value}
                  onClick={() => setDifficulty(value)}
                  className={`
                    relative px-5 py-2 text-sm font-bold uppercase tracking-widest border transition-all duration-200 cursor-pointer
                    ${isActive ? color : 'border-hextech-border/50 text-gray-500 bg-transparent'}
                    ${!isActive ? glow : ''}
                  `}
                >
                  {label}
                  {isActive && (
                    <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full border-2 border-hextech-dark"
                      style={{ background: value === 'easy' ? '#34d399' : value === 'medium' ? '#fbbf24' : '#f43f5e' }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {!hideInput && (
        <div className="flex flex-col sm:flex-row gap-0 group/input">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal && setInputVal(e.target.value)}
            className="w-full bg-[#0a0f14] border border-hextech-border/30 text-hextech-gold-light text-center px-4 md:px-6 py-4 outline-none font-mono text-xl sm:text-2xl tracking-[0.3em] transition-all group-hover/input:border-hextech-gold/50 focus:border-hextech-gold shadow-inner"
            placeholder={placeholder}
          />
        </div>
      )}
      
      <div className="flex justify-center gap-4 w-full mt-8">
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

