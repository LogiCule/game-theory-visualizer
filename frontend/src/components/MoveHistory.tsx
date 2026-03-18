import { useEffect, useRef } from 'react';

interface MoveHistoryProps {
  history: string[];
}

export default function MoveHistory({ history }: MoveHistoryProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [history]);

  return (
    <div className="bg-hextech-panel/60 backdrop-blur-md rounded-none shadow-2xl border border-hextech-border flex flex-col h-[500px] relative">
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-hextech-blue/50 opacity-50 m-1 pointer-events-none" />
      
      <div className="bg-hextech-dark/50 border-b border-hextech-border px-6 py-4">
        <h3 className="font-bold text-hextech-gold uppercase tracking-widest text-sm flex items-center">
          Match Log
        </h3>
      </div>
      <div ref={scrollContainerRef} className="p-4 overflow-y-auto custom-scrollbar flex-grow">
        {history.length === 0 ? (
          <div className="text-hextech-border text-center mt-4 uppercase tracking-widest text-xs">Awaiting first move</div>
        ) : (
          <ul className="space-y-4">
            {history.map((move, index) => {
              const isAlice = move.startsWith('Alice');
              const colorClass = isAlice ? 'bg-[#c89b3c]/10 text-[#c89b3c] border-[#c89b3c]/30' : 'bg-[#0ac8b9]/10 text-[#0ac8b9] border-[#0ac8b9]/30';
              return (
                <li key={index} className="flex items-start game-anim">
                  <span className={`
                    inline-flex items-center justify-center w-6 h-6 text-xs font-bold mr-3 mt-0.5 shrink-0 border
                    ${colorClass}
                  `}>
                    {index + 1}
                  </span>
                  <span className="text-hextech-gold-light/80 text-sm font-mono tracking-tight">{move}</span>
                </li>
              );
            })}
            <div ref={bottomRef} />
          </ul>
        )}
      </div>
    </div>
  );
}
