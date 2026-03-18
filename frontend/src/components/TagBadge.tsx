import React from 'react';

type TagBadgeProps = {
  tag: string;
  onClick?: (e: React.MouseEvent) => void;
  isActive?: boolean;
  onRemove?: () => void;
};

export default function TagBadge({ tag, onClick, isActive, onRemove }: TagBadgeProps) {
  return (
    <div 
      onClick={onClick}
      className={`
        inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold
        transition-colors duration-200 border
        ${onClick ? 'cursor-pointer' : ''}
        ${isActive 
          ? 'bg-hextech-blue/20 text-hextech-blue border-hextech-blue hover:bg-hextech-blue/30' 
          : 'bg-hextech-panel/80 border-hextech-border text-gray-400 hover:text-hextech-gold-light hover:border-hextech-gold'
        }
      `}
    >
      <span>{tag}</span>
      {onRemove && (
        <button 
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-2 flex items-center justify-center w-4 h-4 rounded-full hover:bg-red-500/20 text-current hover:text-red-400 focus:outline-none transition-colors"
        >
          &times;
        </button>
      )}
    </div>
  );
}
