import { useEffect, useRef, useState } from 'react';
import type { HistoryEntry } from '../games/core/TwoPlayerGameEngine';
import type { MoveVerdict, MoveConfidence } from '../games/core/GameExplainer';

interface MoveHistoryProps {
  history: HistoryEntry<any>[];
}

// ── Design tokens ─────────────────────────────────────────────────────────────

// Step 3: Color system — teal=optimal, soft-blue=decent, yellow=suboptimal, red=blunder
const VERDICT_STYLE: Record<MoveVerdict, { title: string; icon: string; bar: string }> = {
  optimal:    { title: 'text-[#0ac8b9]',   icon: '✓', bar: 'bg-[#0ac8b9]' },
  decent:     { title: 'text-sky-400',      icon: '·', bar: 'bg-sky-400' },
  suboptimal: { title: 'text-yellow-400',   icon: '△', bar: 'bg-yellow-400' },
  blunder:    { title: 'text-rose-400',     icon: '✕', bar: 'bg-rose-500' },
};

const VERDICT_LABEL: Record<MoveVerdict, string> = {
  optimal:    'Optimal Move',
  decent:     'Decent Move',
  suboptimal: 'Suboptimal Move',
  blunder:    'Blunder',
};

// Step 6: Confidence colored dot
const CONF_DOT: Record<MoveConfidence, string> = {
  high:   'text-[#0ac8b9]',
  medium: 'text-sky-400',
  low:    'text-rose-400',
};

const CONF_LABEL: Record<MoveConfidence, string> = {
  high:   'High',
  medium: 'Med',
  low:    'Low',
};

// Semantic-only tags (filter out redundant ones)
const KEEP_TAGS = new Set([
  'blocking', 'fork', 'center control', 'threat', 'forcing move',
  'edge', 'win', 'losing position', 'winning position',
]);

// ── Move entry ────────────────────────────────────────────────────────────────

function MoveEntry({ entry, index }: { entry: HistoryEntry<any>; index: number }) {
  const [expanded, setExpanded] = useState(false);

  const isAlice = entry.player === 'Alice';
  const playerAccent = isAlice ? '#c89b3c' : '#0ac8b9';

  const exp     = entry.explanation;
  const verdict = exp?.verdict;
  const conf    = exp?.confidence;
  const style   = verdict ? VERDICT_STYLE[verdict] : null;
  const isBlunder = verdict === 'blunder';

  // Score string from summary
  const scoreMatch = exp?.summary?.match(/\(([+-]?\d+)\)/);
  const scoreStr = scoreMatch ? scoreMatch[1] : null;

  // Semantic tags only, max 2
  const tags = (exp?.tags ?? []).filter(t => KEEP_TAGS.has(t)).slice(0, 2);

  // Reasons — max 2 visible (Step 4)
  const reasons = exp?.reasons ?? [];
  const visible = expanded ? reasons : reasons.slice(0, 2);
  const hasMore = reasons.length > 2;

  return (
    <li className={`
      relative rounded-sm transition-colors duration-150 group
      ${isBlunder
        ? 'bg-rose-950/30 border border-rose-600/25 shadow-[inset_0_0_12px_rgba(244,63,94,0.06)]'
        : 'border border-transparent hover:border-white/5 hover:bg-white/[0.015]'
      }
    `}>
      {/* Step 7: Left accent bar */}
      {style && (
        <div className={`absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full ${style.bar} opacity-70`} />
      )}

      <div className="pl-4 pr-3 py-2.5">

        {/* ── HEADER ROW: icon · label · score · confidence ── */}
        <div className="flex items-baseline gap-2 flex-wrap">

          {/* Step 5: Move index */}
          <span
            className="text-[9px] font-mono tabular-nums shrink-0 w-[18px] text-right opacity-40"
            style={{ color: playerAccent }}
          >
            {String(index + 1).padStart(2, '0')}
          </span>

          {/* Icon + verdict label + score — Step 1 */}
          {style ? (
            <span className={`text-[13px] font-bold tracking-tight leading-none ${style.title}`}>
              <span className="mr-1 opacity-70">{style.icon}</span>
              {VERDICT_LABEL[verdict!]}
              {scoreStr && (
                <span className="ml-1.5 text-[11px] font-semibold opacity-80">
                  ({Number(scoreStr) > 0 ? '+' : ''}{scoreStr})
                </span>
              )}
            </span>
          ) : (
            <span className="text-[13px] font-bold text-hextech-gold-light/70 leading-none">
              {exp?.summary ?? entry.description}
            </span>
          )}

          {/* Step 2: Confidence inline — colored dot + short label */}
          {conf && (
            <span className={`flex items-center gap-0.5 text-[10px] ml-auto shrink-0 ${CONF_DOT[conf]} opacity-60`}>
              <span className="text-[8px]">●</span>
              {CONF_LABEL[conf]}
            </span>
          )}
        </div>

        {/* ── TAGS row (Step 8: outline, tiny, low opacity) ── */}
        {tags.length > 0 && (
          <div className="flex gap-1.5 mt-1.5 pl-[22px] flex-wrap">
            {tags.map((t, i) => (
              <span
                key={i}
                className="text-[9px] px-1.5 py-px border border-white/10 text-white/25 rounded-sm tracking-wide font-mono"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* ── Step 6: Divider ── */}
        {visible.length > 0 && (
          <div className="mt-2 mb-1.5 ml-[22px] border-t border-white/5" />
        )}

        {/* ── REASONS (Step 4: first=brighter, rest=muted) ── */}
        {visible.length > 0 && (
          <ul className="space-y-1 pl-[22px]">
            {visible.map((r, i) => (
              <li
                key={i}
                className={`flex items-start gap-1.5 text-[11px] leading-snug ${
                  i === 0
                    ? 'text-hextech-gold-light/65'
                    : 'text-hextech-gold-light/35'
                }`}
              >
                <span className="mt-[5px] w-[3px] h-[3px] rounded-full bg-current shrink-0 opacity-50" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Expand button */}
        {hasMore && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="mt-1 pl-[22px] text-[9px] text-white/20 hover:text-white/50 transition-colors tracking-widest uppercase cursor-pointer"
          >
            {expanded ? '▲ less' : `▼ ${reasons.length - 2} more`}
          </button>
        )}
      </div>
    </li>
  );
}

// ── Panel ─────────────────────────────────────────────────────────────────────

export default function MoveHistory({ history }: MoveHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [history]);

  return (
    <div className="bg-hextech-panel/60 backdrop-blur-md rounded-none shadow-2xl border border-hextech-border flex flex-col h-[500px] relative">
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-hextech-blue/50 opacity-50 m-1 pointer-events-none" />

      {/* Header */}
      <div className="bg-hextech-dark/50 border-b border-hextech-border px-5 py-3 flex items-center justify-between">
        <h3 className="font-bold text-hextech-gold uppercase tracking-widest text-[11px]">Match Log</h3>
        {history.length > 0 && (
          <span className="text-[10px] text-hextech-gold/25 tabular-nums">{history.length} move{history.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Entries */}
      <div ref={scrollRef} className="py-1.5 px-2 overflow-y-auto custom-scrollbar flex-grow">
        {history.length === 0 ? (
          <div className="text-hextech-border text-center mt-8 uppercase tracking-widest text-[10px]">
            Awaiting first move
          </div>
        ) : (
          /* Step 6: generous spacing between moves */
          <ul className="space-y-1">
            {history.map((entry, i) => (
              <MoveEntry key={i} entry={entry} index={i} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
