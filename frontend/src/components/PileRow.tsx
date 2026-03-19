import PileTile from './PileTile';

interface PileRowProps {
  piles: number[];
  onTakeLeft: () => void;
  onTakeRight: () => void;
  gameActive: boolean;
  highlightLeft?: boolean;
  highlightRight?: boolean;
}

export default function PileRow({ piles, onTakeLeft, onTakeRight, gameActive, highlightLeft, highlightRight }: PileRowProps) {
  if (piles.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center bg-hextech-dark/50 backdrop-blur-sm border border-hextech-border rounded-none shadow-inner">
        <span className="text-hextech-border font-bold uppercase tracking-widest text-lg">No stones left</span>
      </div>
    );
  }

  const leftPile = piles[0];
  const rightPile = piles.length > 1 ? piles[piles.length - 1] : null;
  const middlePiles = piles.length > 2 ? piles.slice(1, -1) : [];

  return (
    <div className={`bg-hextech-panel/40 backdrop-blur-sm shadow-2xl border border-hextech-border min-h-[140px] md:min-h-[160px] w-full py-6 px-2 md:py-8 md:px-4 flex items-center relative overflow-hidden ${piles.length === 1 ? 'justify-center' : 'justify-between'}`}>
      
      {/* Background grid accent */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(200,155,60,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(200,155,60,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

      {/* Fixed Leftmost Pile */}
      <div className="flex-shrink-0 z-20">
        <PileTile
          value={leftPile}
          selectable={gameActive}
          onClick={onTakeLeft}
          position="left"
          highlight={highlightLeft}
        />
      </div>

      {/* Scrollable Middle Area */}
      {middlePiles.length > 0 ? (
        <div className="flex-1 relative mx-4 min-w-0 flex items-center h-full">
          {/* Fading Edges overlaying the scrollable content */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#1e2328] to-transparent pointer-events-none z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#1e2328] to-transparent pointer-events-none z-10"></div>
          
          <div className="overflow-x-auto custom-scrollbar flex items-center w-full px-1 md:px-2 py-4">
            <div className="flex flex-nowrap items-center min-w-max gap-2 md:gap-4 mx-auto w-fit px-4 md:px-8">
              {middlePiles.map((pile, idx) => (
                <PileTile
                  key={`middle-${idx}-${pile}`}
                  value={pile}
                  selectable={false}
                  onClick={() => {}}
                  position="middle"
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Empty flexible space for 2 piles */
        piles.length === 2 && <div className="flex-1 flex justify-center text-hextech-border font-medium text-sm"></div>
      )}

      {/* Fixed Rightmost Pile */}
      {rightPile !== null && (
        <div className="flex-shrink-0 z-20">
          <PileTile
            value={rightPile}
            selectable={gameActive}
            onClick={onTakeRight}
            position="right"
            highlight={highlightRight}
          />
        </div>
      )}
    </div>
  );
}
