import { useState, useRef, useEffect, useMemo } from 'react';
import { StoneGame2Engine } from '../games/StoneGame2Engine';
import type { StoneGame2State } from '../games/StoneGame2Engine';
import ScoreBoard from '../components/ScoreBoard';
import TurnIndicator from '../components/TurnIndicator';
import MoveHistory from '../components/MoveHistory';
import FrontTakeRow from '../components/FrontTakeRow';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function StoneGame2Page() {
  const navigate = useNavigate();
  const [inputVal, setInputVal] = useState('2, 7, 9, 4, 4');
  const [gameState, setGameState] = useState<StoneGame2State | null>(null);
  const [gameMode, setGameMode] = useState<'pvp' | 'pve'>('pve');
  const container = useRef<HTMLDivElement>(null);
  
  const engine = useMemo(() => new StoneGame2Engine(), []);
  const isGameActive = gameState !== null;

  useGSAP(() => {
    gsap.from('.game-anim', {
      y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
    });
  }, { scope: container, dependencies: [isGameActive] });

  const startGame = () => {
    setGameState(engine.getInitialState(inputVal));
  };

  const handleTake = (count: number) => {
    if (gameState && !gameState.gameOver) {
      setGameState(engine.applyMove(gameState, count));
    }
  };

  useEffect(() => {
    if (gameState && !gameState.gameOver && gameMode === 'pve' && gameState.currentPlayer === 'Bob') {
      const timer = setTimeout(() => {
        const move = engine.getOptimalMove(gameState);
        if (move !== null) {
          setGameState(prev => prev ? engine.applyMove(prev, move) : null);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState, gameMode, engine]);

  return (
    <div ref={container} className="min-h-screen p-4 md:p-8 text-hextech-gold-light pt-8 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-hextech-blue/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-hextech-gold/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-[1200px] mx-auto relative z-10">
        <div className="flex items-center justify-between mb-12">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-hextech-gold hover:text-hextech-gold-light transition-colors cursor-pointer group tracking-widest uppercase text-sm font-bold"
          >
            <ArrowLeft className="mr-3 text-hextech-blue group-hover:-translate-x-1 transition-transform" size={20} />
            Lobby
          </button>
          
          <div className="inline-block relative">
            <h1 className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-hextech-gold-light to-hextech-gold uppercase">
              Stone Game II
            </h1>
            <div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-hextech-blue to-transparent" />
          </div>
          <div className="w-24"></div>
        </div>

        {!gameState && (
          <div className="game-anim bg-hextech-panel/60 backdrop-blur-md border border-hextech-border p-12 max-w-xl mx-auto text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-0 h-1 bg-hextech-blue transition-all duration-700 group-hover:w-full" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-hextech-gold opacity-50 m-2" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-hextech-gold opacity-50 m-2" />

            <h2 className="text-2xl font-bold mb-4 uppercase tracking-widest text-hextech-gold-light">Initialize Match</h2>
            <p className="text-gray-400 mb-8 font-light tracking-wide text-sm">Deploy the initial sequence of stones.</p>
            
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
                placeholder="2, 7, 9, 4, 4"
                className="px-6 py-4 bg-hextech-dark/80 border border-hextech-border focus:border-hextech-blue text-hextech-gold-light focus:outline-none focus:ring-1 focus:ring-hextech-blue font-mono text-center tracking-widest"
              />
              <button 
                onClick={startGame}
                className="bg-hextech-blue/20 hover:bg-hextech-blue/30 border border-hextech-blue text-hextech-gold-light font-bold py-4 px-10 transition-all duration-300 shadow-[0_0_15px_rgba(10,200,185,0.2)] hover:shadow-[0_0_25px_rgba(10,200,185,0.4)] cursor-pointer uppercase tracking-widest text-sm relative overflow-hidden group/btn"
              >
                <div className="absolute inset-0 bg-hextech-blue/20 transform -translate-x-full skew-x-12 group-hover/btn:animate-[shine_1s_ease-out_forwards]" />
                Proceed
              </button>
            </div>
          </div>
        )}

        {gameState && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 flex flex-col items-center w-full max-w-3xl mx-auto">
              <div className="game-anim w-full">
                <ScoreBoard aliceScore={gameState.scores.Alice} bobScore={gameState.scores.Bob} />
              </div>
              
              <div className="game-anim">
                <TurnIndicator 
                  currentPlayer={gameState.currentPlayer} 
                  gameOver={gameState.gameOver} 
                  winner={engine.getWinner(gameState)} 
                />
              </div>
              
              <div className="game-anim w-full mb-8">
                <div className="text-center mb-6 text-hextech-blue font-bold tracking-widest uppercase text-sm drop-shadow-[0_0_8px_rgba(10,200,185,0.5)]">
                  Current Multiplier (M): {gameState.M} &nbsp;&mdash;&nbsp; Max Take: {2 * gameState.M}
                </div>
                <FrontTakeRow 
                  piles={gameState.piles} 
                  maxTake={2 * gameState.M}
                  gameActive={!gameState.gameOver && !(gameMode === 'pve' && gameState.currentPlayer === 'Bob')}
                  onTake={handleTake}
                />
              </div>

              {gameState.gameOver && (
                <div className="game-anim flex justify-center mt-6 w-full">
                  <button 
                    onClick={() => setGameState(null)}
                    className="flex items-center justify-center bg-hextech-dark border border-hextech-gold text-hextech-gold hover:text-hextech-gold-light hover:bg-[#c89b3c]/20 font-bold py-4 px-10 transition-all duration-300 shadow-[0_0_20px_rgba(200,155,60,0.15)] hover:shadow-[0_0_30px_rgba(200,155,60,0.3)] cursor-pointer uppercase tracking-widest relative overflow-hidden group/btn w-full max-w-sm"
                  >
                    <div className="absolute inset-0 bg-hextech-gold/10 transform -translate-x-full skew-x-12 group-hover/btn:animate-[shine_1s_ease-out_forwards]" />
                    <RefreshCw className="mr-3" size={18} />
                    Deploy Again
                  </button>
                </div>
              )}
            </div>
            
            <div className="lg:col-span-1 h-full w-full game-anim">
              <MoveHistory history={gameState.history} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
