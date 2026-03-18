import TagBadge from './TagBadge';

type FilterBarProps = {
  activeTags: string[];
  onRemoveTag: (tag: string) => void;
  onClearAll: () => void;
};

export default function FilterBar({ activeTags, onRemoveTag, onClearAll }: FilterBarProps) {
  if (activeTags.length === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
      <div className="text-xs text-hextech-gold/70 uppercase tracking-[0.2em] font-bold">Active Filters:</div>
      <div className="flex flex-wrap gap-2 justify-center">
        {activeTags.map((tag) => (
          <TagBadge 
            key={tag} 
            tag={tag} 
            isActive 
            onRemove={() => onRemoveTag(tag)} 
          />
        ))}
      </div>
      <button 
        onClick={onClearAll}
        className="text-xs text-red-500 hover:text-red-400 uppercase tracking-widest font-bold transition-colors underline underline-offset-4 ml-2"
      >
        Clear All
      </button>
    </div>
  );
}
